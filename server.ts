import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

// In-memory TTL Cache to eliminate duplicate calls and stay within free tier limits
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleTTLCache {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs = 3600000): void {
    if (this.store.size > 500) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }
}

const apiCache = new SimpleTTLCache();

// Request Queue with pacing to prevent burst rate limits (429) across parallel component calls
class GeminiRequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private lastCallTimestamp = 0;
  private readonly minIntervalMs = 1200; // 1.2s spacing between external calls

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const waitTime = Math.max(0, this.minIntervalMs - (now - this.lastCallTimestamp));
          if (waitTime > 0) {
            await new Promise((r) => setTimeout(r, waitTime));
          }
          this.lastCallTimestamp = Date.now();
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    const task = this.queue.shift();
    if (task) {
      try {
        await task();
      } catch {
        // Individual task error handled in its own promise
      }
    }
    this.isProcessing = false;
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

const geminiQueue = new GeminiRequestQueue();

// Rate limiter: strictly respect free tier (5 requests per minute limit)
let recentCallTimestamps: number[] = [];
let quotaExceededCooldownUntil = 0;

function canCallGemini(): boolean {
  if (!process.env.GEMINI_API_KEY) return false;
  const now = Date.now();
  if (now < quotaExceededCooldownUntil) {
    return false; // In 429 backoff cooldown
  }
  recentCallTimestamps = recentCallTimestamps.filter((ts) => now - ts < 60000);
  // Cap at max 4 calls per 60 seconds to safely stay below 5 RPM free tier ceiling
  return recentCallTimestamps.length < 4;
}

function recordGeminiCallSuccess(): void {
  recentCallTimestamps.push(Date.now());
}

function recordGeminiRateLimitError(): void {
  // Back off for 30 seconds if 429 is encountered
  quotaExceededCooldownUntil = Date.now() + 30000;
}

// Resilient JSON extractor: handles markdown code fences, trailing commas, and unclosed snippets
function safeExtractJSON<T = any>(raw: string | undefined | null): T | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    let clean = raw.trim();
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      clean = clean.substring(start, end + 1);
    }
    // Remove trailing commas before closing braces/brackets
    clean = clean.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(clean) as T;
  } catch {
    return null;
  }
}

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Comprehensive awareness reasoning fallback when no API key is provided
function generateLocalAwarenessResponse(
  userQuery: string,
  cityContext: {
    cityName: string;
    aqi: number;
    category: string;
    pm25: number;
    pm10: number;
    temperature: number;
    trend: string;
  }
): string {
  const query = userQuery.toLowerCase();
  const { cityName, aqi, category, pm25, pm10 } = cityContext;

  // Jogging / Outdoor exercise query
  if (query.includes("jog") || query.includes("run") || query.includes("exercise") || query.includes("workout") || query.includes("walk")) {
    if (aqi <= 50) {
      return `Good news for ${cityName}! The current AQI is ${aqi} (${category}), with PM2.5 at ${pm25} µg/m³. Outdoor jogging and physical training are completely safe today. Enjoy the clean air!`;
    } else if (aqi <= 100) {
      return `In ${cityName}, the air quality is Moderate (AQI ${aqi}). Outdoor jogging is generally fine for most healthy individuals, but if you have asthma or sensitive airways, consider a lighter pace or working out later if smog peaks.`;
    } else if (aqi <= 150) {
      return `Outdoor jogging in ${cityName} requires caution right now (AQI ${aqi} – ${category}). Sensitive individuals, runners with allergies, and elderly runners should reduce prolonged outdoor exertion. Consider indoor cardio or treadmill exercise.`;
    } else {
      return `Outdoor jogging is NOT recommended in ${cityName} right now because the current AQI is ${aqi} (${category}, PM2.5: ${pm25} µg/m³). Inhaling deeply during intense aerobic activity pulls fine particulate matter deep into lung alveolar tissue. Please opt for indoor exercise or gym workouts with filtered air today.`;
    }
  }

  // Children / Playing outside query
  if (query.includes("child") || query.includes("kid") || query.includes("play outside") || query.includes("baby") || query.includes("school")) {
    if (aqi <= 50) {
      return `Yes! It is very safe for children to play outside in ${cityName} today. The air quality index is ${aqi} (${category}), well within safe physiological thresholds.`;
    } else if (aqi <= 100) {
      return `In ${cityName}, the AQI is ${aqi} (Moderate). Normal outdoor play is acceptable for most children, but keep an eye on kids with diagnosed asthma or respiratory sensitivities.`;
    } else if (aqi <= 150) {
      return `Take precautions for children in ${cityName} today (AQI ${aqi} – ${category}). Children breathe more air per pound of body weight than adults; limit their high-intensity outdoor recess or play to short intervals and encourage indoor games.`;
    } else {
      return `It is NOT recommended for children to play outside in ${cityName} right now. The AQI is ${aqi} (${category}) with PM2.5 at ${pm25} µg/m³ (WHO guideline is 15 µg/m³). Children's developing respiratory tracts are particularly vulnerable to fine particulates. Keep activities indoors with closed windows.`;
    }
  }

  // Mask query
  if (query.includes("mask") || query.includes("n95") || query.includes("protection") || query.includes("wear")) {
    if (aqi <= 50) {
      return `No protective mask is required in ${cityName} today for air quality purposes (AQI is ${aqi}, ${category}). The ambient air is clean and healthy to breathe.`;
    } else if (aqi <= 100) {
      return `A mask is generally not required for the general public in ${cityName} (AQI ${aqi} – Moderate). However, highly sensitive individuals commuting near busy industrial roads may benefit from a particulate mask.`;
    } else if (aqi <= 150) {
      return `Wearing an N95 or KN95 particulate respirator is recommended for sensitive groups, cyclists, and traffic-heavy commuters in ${cityName} today, as AQI is ${aqi} (${category}). Cloth masks do not filter PM2.5 effectively.`;
    } else {
      return `Yes, wearing a well-fitted N95, KN95, or FFP2 respirator is strongly recommended whenever you step outside in ${cityName} today. With an AQI of ${aqi} (${category}) and PM2.5 at ${pm25} µg/m³, standard cloth or surgical masks cannot adequately block sub-2.5-micron particulates.`;
    }
  }

  // What does today's AQI mean?
  if (query.includes("mean") || query.includes("what does") || query.includes("explain") || query.includes("score")) {
    let explanation = "";
    if (aqi <= 50) explanation = "Air quality is considered satisfactory, and air pollution poses little or no health risk.";
    else if (aqi <= 100) explanation = "Air quality is acceptable. However, a moderate health concern may exist for a very small number of people unusually sensitive to air pollution.";
    else if (aqi <= 150) explanation = "Members of sensitive groups (children, elderly, asthmatics) may experience health effects. The general public is less likely to be affected.";
    else if (aqi <= 200) explanation = "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.";
    else if (aqi <= 300) explanation = "Health alert: The risk of health effects is substantially increased for everyone in the population.";
    else explanation = "Health warning of emergency conditions: Everyone is more likely to be affected by acute cardiovascular and pulmonary distress.";

    return `In ${cityName}, today's AQI is ${aqi}, which falls in the "${category}" bracket. ${explanation} The dominant pollutant is fine particulate matter (PM2.5: ${pm25} µg/m³, PM10: ${pm10} µg/m³).`;
  }

  // Is today's air quality improving?
  if (query.includes("improv") || query.includes("trend") || query.includes("better") || query.includes("worse") || query.includes("forecast")) {
    const isImproving = cityContext.trend.toLowerCase().includes("improv") || aqi < 150;
    if (isImproving) {
      return `Based on recent 7-day monitoring in ${cityName}, conditions show a positive stabilizing trend. However, current AQI is ${aqi} (${category}). Monitor local wind speeds and peak evening traffic hours as changes in thermal inversion can temporarily alter particulate concentrations.`;
    } else {
      return `In ${cityName}, the air quality trend has been elevated over recent days (current AQI: ${aqi}, ${category}). High vehicular emissions, lower seasonal boundary layer heights, and ambient particulate accumulation mean pollution levels remain concerning. Check our 7-day trend chart below for detailed daily readings.`;
    }
  }

  // Elderly or sensitive persons
  if (query.includes("elder") || query.includes("senior") || query.includes("grandparent") || query.includes("asthma") || query.includes("heart")) {
    if (aqi <= 100) {
      return `For seniors and those with respiratory conditions in ${cityName}, the AQI is currently ${aqi} (${category}). Light outdoor walks are fine, but ensure regular medications/inhalers are accessible as a standard precaution.`;
    } else {
      return `Special caution is advised for seniors and individuals with cardiovascular or respiratory ailments in ${cityName} (AQI: ${aqi}, ${category}). High PM2.5 levels (${pm25} µg/m³) put extra stress on the heart and lungs. Please remain in air-purified indoor spaces and avoid heavy chores outside.`;
    }
  }

  // General fallback tailored response
  return `In ${cityName}, the current Air Quality Index is ${aqi} (${category}) with PM2.5 at ${pm25} µg/m³ and PM10 at ${pm10} µg/m³. For this pollution tier: ${
    aqi > 200
      ? "Avoid prolonged outdoor exposure, use HEPA filtration indoors, and equip an N95 respirator if venturing outside."
      : aqi > 100
      ? "Sensitive groups should limit strenuous outdoor activities. General public can proceed with moderate awareness."
      : "Air conditions are favorable for outdoor work, recreation, and open-window ventilation."
  } Feel free to ask more specific questions about jogging, masks, children, or 7-day trends!`;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      geminiAvailable: !!process.env.GEMINI_API_KEY,
    });
  });

  // AI Assistant endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        message,
        cityName = "Delhi",
        aqi = 210,
        category = "Very Unhealthy",
        pm25 = 145,
        pm10 = 260,
        temperature = 28,
        trend = "Worsening",
      } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "A message string is required." });
      }

      const cacheKey = `chat:${cityName.toLowerCase()}:${aqi}:${message.trim().toLowerCase()}`;
      const cached = apiCache.get<any>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const client = getGeminiClient();

      if (client && canCallGemini()) {
        try {
          const systemPrompt = `You are "AirAware AI", an environmental and public health awareness assistant aligned with UN SDG 11 (Sustainable Cities and Communities) and SDG 13 (Climate Action).
Current Real-Time Context:
- City: ${cityName}
- Current AQI: ${aqi} (${category})
- Fine Particulate Matter PM2.5: ${pm25} µg/m³ (WHO safe threshold is 15 µg/m³)
- Particulate Matter PM10: ${pm10} µg/m³ (WHO safe threshold is 45 µg/m³)
- Ambient Temperature: ${temperature}°C
- 7-Day Trend: ${trend}

Guidelines:
1. Always analyze and reference the current AQI (${aqi}) and city (${cityName}) directly in your guidance.
2. If asked about outdoor jogging, exercise, or children playing outside, provide specific, clear safety advice based on the AQI level (e.g. if AQI > 100, recommend indoor alternatives or caution).
3. If asked about masks, specify N95/KN95/FFP2 respirators when AQI > 150 because standard cloth masks cannot filter fine PM2.5 particulates.
4. Keep the tone empathetic, scientifically sound, concise, and easy to understand (2-4 clear paragraphs or bullet points).
5. Always remind the user that this is environmental awareness guidance, not clinical medical diagnosis. Recommend consulting a healthcare professional for acute medical symptoms.`;

          const response = await geminiQueue.enqueue(() =>
            client.models.generateContent({
              model: "gemini-3.8-flash",
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }],
                },
              ],
            })
          );

          recordGeminiCallSuccess();
          const replyText = response.text || "";
          if (replyText.trim()) {
            const result = {
              reply: replyText.trim(),
              source: "gemini-3.8-flash",
              aqiReference: aqi,
              cityName,
            };
            apiCache.set(cacheKey, result);
            return res.json(result);
          }
        } catch (apiError: any) {
          if (apiError?.status === 429 || `${apiError}`.includes("429") || `${apiError}`.includes("quota")) {
            recordGeminiRateLimitError();
          }
        }
      }

      // Local awareness fallback
      const localReply = generateLocalAwarenessResponse(message, {
        cityName,
        aqi,
        category,
        pm25,
        pm10,
        temperature,
        trend,
      });

      const fallbackResult = {
        reply: localReply,
        source: "airaware-awareness-engine",
        aqiReference: aqi,
        cityName,
      };
      apiCache.set(cacheKey, fallbackResult);
      return res.json(fallbackResult);
    } catch (err: any) {
      console.error("Error handling /api/chat:", err);
      res.status(500).json({
        error: "Internal server error processing air quality inquiry",
      });
    }
  });

  // 1. Smart AQI Analysis Endpoint
  app.post("/api/analyze-aqi", async (req, res) => {
    try {
      const {
        cityName = "Delhi",
        aqi = 250,
        category = "Very Unhealthy",
        pm25 = 150,
        pm10 = 260,
        dominantPollutant = "PM2.5 (Fine Particulates)",
      } = req.body;

      const cacheKey = `aqi-analysis:${cityName.toLowerCase()}:${aqi}`;
      const cached = apiCache.get<any>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const client = getGeminiClient();
      if (client && canCallGemini()) {
        try {
          const prompt = `You are an expert environmental scientist and public health specialist.
Analyze the following air quality telemetry:
City: ${cityName}
Current AQI: ${aqi} (${category})
PM2.5: ${pm25} µg/m³
PM10: ${pm10} µg/m³
Dominant Pollutant: ${dominantPollutant}

Provide a concise, clear breakdown explaining:
1. whyHigh: 2-3 sentences explaining meteorological, vehicular, or seasonal dispersion factors for this city.
2. levelMeaning: 1-2 simple sentences explaining what this AQI score means for human health.
3. generalPrecautions: 3 actionable precautions.
4. whatToAvoid: 3 activities or habits to avoid.
5. safeToDo: 3 safe alternative activities.`;

          const response = await geminiQueue.enqueue(() =>
            client.models.generateContent({
              model: "gemini-3.8-flash",
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    whyHigh: {
                      type: Type.STRING,
                      description: "Explanation of why AQI is at this level.",
                    },
                    levelMeaning: {
                      type: Type.STRING,
                      description: "What this AQI score means for human health.",
                    },
                    generalPrecautions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of general precautions.",
                    },
                    whatToAvoid: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of activities to avoid.",
                    },
                    safeToDo: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of safe activities.",
                    },
                  },
                  required: ["whyHigh", "levelMeaning", "generalPrecautions", "whatToAvoid", "safeToDo"],
                },
              },
            })
          );

          recordGeminiCallSuccess();
          const rawText = response.text || "";
          const parsed = safeExtractJSON(rawText);
          if (parsed && parsed.whyHigh && parsed.levelMeaning) {
            const result = {
              ...parsed,
              source: "gemini-3.8-flash",
            };
            apiCache.set(cacheKey, result);
            return res.json(result);
          }
        } catch (apiErr: any) {
          if (apiErr?.status === 429 || `${apiErr}`.includes("429") || `${apiErr}`.includes("quota")) {
            recordGeminiRateLimitError();
          }
        }
      }

      // Local fallback for Smart AQI Analysis
      let whyHigh = "";
      let levelMeaning = "";
      let generalPrecautions: string[] = [];
      let whatToAvoid: string[] = [];
      let safeToDo: string[] = [];

      if (aqi <= 50) {
        whyHigh = `Air quality in ${cityName} is in the clean bracket due to favorable atmospheric ventilation, low local vehicular congestion, and effective dispersion of airborne particles.`;
        levelMeaning = `AQI ${aqi} (Good) indicates pristine, fresh air where particulate matter poses virtually zero health risk to residents.`;
        generalPrecautions = [
          "Enjoy open-air ventilation across homes and offices",
          "Maintain personal cardiovascular fitness in outdoor spaces",
          "Ensure vehicles remain tuned to prevent future pollution spikes",
        ];
        whatToAvoid = [
          "Avoid unnecessary burning of garden dry leaves or trash",
          "Avoid prolonged engine idling at intersections",
        ];
        safeToDo = [
          "Outdoor distance running, jogging, and cycling",
          "Unrestricted playground sessions and sports for children",
          "Natural whole-house cross ventilation",
        ];
      } else if (aqi <= 100) {
        whyHigh = `Moderate concentrations in ${cityName} stem from routine urban vehicle exhaust, ambient road dust, and mild wind stagnation.`;
        levelMeaning = `AQI ${aqi} (Moderate) represents acceptable air quality, though a small subset of hypersensitive respiratory patients may notice slight throat tickles.`;
        generalPrecautions = [
          "Keep inhalers handy if you suffer from diagnosed asthma",
          "Schedule strenuous outdoor activities away from peak rush hours",
          "Stay hydrated to help airway mucous membranes flush particles",
        ];
        whatToAvoid = [
          "Avoid heavy exercise right along high-traffic arterial highways",
          "Avoid indoor smoking or incense burning that adds to indoor load",
        ];
        safeToDo = [
          "Regular outdoor walks and recreational sports",
          "School recess and physical education classes",
          "Standard outdoor commuting with routine awareness",
        ];
      } else if (aqi <= 150) {
        whyHigh = `Elevated AQI in ${cityName} is driven by fine particulate accumulation (${dominantPollutant}), combined with traffic emissions and localized atmospheric thermal trapping.`;
        levelMeaning = `AQI ${aqi} (Unhealthy for Sensitive Groups) means children, elderly citizens, and people with heart/lung disease are susceptible to irritation, while healthy adults may experience mild discomfort.`;
        generalPrecautions = [
          "Sensitive individuals should wear an N95 mask when outdoors",
          "Keep windows closed during early morning temperature inversions",
          "Use air purifiers in bedrooms during nighttime rest",
        ];
        whatToAvoid = [
          "Avoid intense prolonged aerobic workouts outdoors",
          "Avoid exposing infants and toddlers to open roadway fumes",
          "Avoid outdoor barbecues, bonfires, or open burning",
        ];
        safeToDo = [
          "Indoor gym workouts, yoga, and stationary cycling",
          "Short walks during afternoon hours when wind speeds disperse smog",
          "Indoor study, desk work, and quiet recreational hobbies",
        ];
      } else if (aqi <= 200) {
        whyHigh = `Unhealthy air in ${cityName} is caused by significant accumulation of fine particulates (PM2.5: ${pm25} µg/m³), industrial emissions, and stagnant boundary layers preventing upward dispersion.`;
        levelMeaning = `AQI ${aqi} (Unhealthy) indicates that everyone may begin to experience adverse effects such as coughing, eye stinging, or fatigue, with serious impacts on vulnerable groups.`;
        generalPrecautions = [
          "Wear a well-fitted N95 or KN95 respirator outdoors",
          "Run HEPA air purifiers continuously in living and sleeping spaces",
          "Rinse eyes and gargle warm saline water after commuting outdoors",
        ];
        whatToAvoid = [
          "Avoid all outdoor cardio, running, cycling, and sports matches",
          "Avoid leaving balcony doors or windows open",
          "Avoid outdoor construction without dust suppression screens",
        ];
        safeToDo = [
          "Indoor fitness, core training, and home resistance exercises",
          "Indoor school activities and modified indoor recess",
          "Hydrating frequently with warm fluids and antioxidants",
        ];
      } else if (aqi <= 300) {
        whyHigh = `Very Unhealthy smog in ${cityName} is triggered by heavy particulate build-up (${dominantPollutant}), regional biomass/stubble smoke transport, dense diesel emissions, and low wind speeds under 5 km/h.`;
        levelMeaning = `AQI ${aqi} (Very Unhealthy) is a severe public health alert. The risk of respiratory infections, acute bronchospasms, and cardiovascular strain is heightened for all citizens.`;
        generalPrecautions = [
          "Mandatory N95/KN95 respirator if any outdoor excursion is required",
          "Seal perimeter window gaps and turn air purifiers to high mode",
          "Monitor high-risk family members for shortness of breath or dizziness",
        ];
        whatToAvoid = [
          "Avoid all non-essential outdoor travel and street walking",
          "Avoid outdoor playground time and physical sports for children",
          "Avoid driving with open vehicle windows",
        ];
        safeToDo = [
          "Strictly indoor home or office routines in filtered air",
          "Gentle indoor stretching and low-intensity indoor movement",
          "Using nasal saline sprays to soothe irritated nasal passages",
        ];
      } else {
        whyHigh = `Hazardous pollution crisis in ${cityName} (AQI ${aqi}) results from severe atmospheric inversion, regional biomass and crop burning plumes, trapped vehicle exhaust, and cold stagnant air blankets.`;
        levelMeaning = `AQI ${aqi} (Hazardous) represents an emergency condition where the entire population is likely to be affected by acute pulmonary and cardiac stress.`;
        generalPrecautions = [
          "Stay strictly indoors with sealed windows and HEPA filtration active",
          "Wear a certified N95 respirator tightly sealed if outdoors is unavoidable",
          "Keep emergency asthma inhalers and pulse oximeters within reach",
        ];
        whatToAvoid = [
          "Strictly avoid any outdoor physical activity, jogging, or sports",
          "Avoid opening windows even for short airing periods",
          "Avoid smoking, vacuuming without HEPA, or candle burning indoors",
        ];
        safeToDo = [
          "Resting indoors in clean-air sealed safe rooms",
          "Indoor sedentary work, reading, and gentle indoor stretching",
          "Contacting medical professionals immediately if wheezing or chest tightness occurs",
        ];
      }

      const fallbackResult = {
        whyHigh,
        levelMeaning,
        generalPrecautions,
        whatToAvoid,
        safeToDo,
        source: "airaware-smart-engine",
      };
      apiCache.set(cacheKey, fallbackResult);
      return res.json(fallbackResult);
    } catch (err: any) {
      console.error("Error in /api/analyze-aqi:", err);
      res.status(500).json({ error: "Failed to analyze AQI" });
    }
  });

  // 2. Smart Activity Recommendation Endpoint
  app.post("/api/activity-check", async (req, res) => {
    try {
      const {
        cityName = "Delhi",
        aqi = 250,
        category = "Very Unhealthy",
        pm25 = 150,
        activity = "jogging",
      } = req.body;

      const activityLabels: Record<string, string> = {
        jogging: "Jogging",
        cycling: "Cycling",
        walking: "Walking",
        outdoor_sports: "Outdoor Sports",
        running: "Running",
        indoor_exercise: "Indoor Exercise",
      };

      const label = activityLabels[activity] || "Outdoor Activity";

      const cacheKey = `activity:${cityName.toLowerCase()}:${activity}:${aqi}`;
      const cached = apiCache.get<any>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const client = getGeminiClient();
      if (client && canCallGemini()) {
        try {
          const prompt = `You are an environmental sports physiology advisor.
Current City: ${cityName}
Current AQI: ${aqi} (${category})
PM2.5: ${pm25} µg/m³
Requested Activity: ${label}

Provide a realistic activity safety recommendation with:
- status: "safe", "caution", or "not_recommended"
- statusLabel: "Safe & Recommended", "Proceed With Caution", or "Not Recommended Outdoors"
- recommendation: 1-2 sentences directly answering whether the user should do this activity in ${cityName} today given the AQI.
- alternativeIndoor: 1 sentence proposing a practical indoor alternative.`;

          const response = await geminiQueue.enqueue(() =>
            client.models.generateContent({
              model: "gemini-3.8-flash",
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    status: {
                      type: Type.STRING,
                      description: "Must be 'safe', 'caution', or 'not_recommended'.",
                    },
                    statusLabel: {
                      type: Type.STRING,
                      description: "Descriptive badge label.",
                    },
                    recommendation: {
                      type: Type.STRING,
                      description: "Safety recommendation for the user.",
                    },
                    alternativeIndoor: {
                      type: Type.STRING,
                      description: "Indoor workout alternative.",
                    },
                  },
                  required: ["status", "statusLabel", "recommendation", "alternativeIndoor"],
                },
              },
            })
          );

          recordGeminiCallSuccess();
          const raw = response.text || "";
          const parsed = safeExtractJSON(raw);
          if (parsed && parsed.recommendation) {
            const result = {
              activity,
              activityLabel: label,
              ...parsed,
              source: "gemini-3.8-flash",
            };
            apiCache.set(cacheKey, result);
            return res.json(result);
          }
        } catch (apiErr: any) {
          if (apiErr?.status === 429 || `${apiErr}`.includes("429") || `${apiErr}`.includes("quota")) {
            recordGeminiRateLimitError();
          }
        }
      }

      // Local fallback
      let status: "safe" | "caution" | "not_recommended" = "not_recommended";
      let statusLabel = "Not Recommended Outdoors";
      let recommendation = "";
      let alternativeIndoor = "Consider home bodyweight exercises or treadmill training in a HEPA-purified space.";

      if (activity === "indoor_exercise") {
        status = "safe";
        statusLabel = "Safe & Highly Recommended";
        recommendation = `Indoor exercise is the safest way to stay active in ${cityName} today. Running a HEPA air purifier while exercising protects your lungs from ambient PM2.5.`;
        alternativeIndoor = "Opt for Pilates, yoga, dumbbell strength training, or stationary cycling indoors.";
      } else if (aqi <= 50) {
        status = "safe";
        statusLabel = "Safe & Recommended";
        recommendation = `Air quality in ${cityName} is Good (AQI ${aqi}). ${label} is completely safe and beneficial for your cardiopulmonary health today.`;
        alternativeIndoor = "Indoor exercise is always an option, but today's fresh air is ideal for outdoor training.";
      } else if (aqi <= 100) {
        if (activity === "walking") {
          status = "safe";
          statusLabel = "Safe & Recommended";
          recommendation = `Walking in ${cityName} is safe with an AQI of ${aqi} (Moderate). Pick green parks away from heavy traffic corridors.`;
        } else {
          status = "caution";
          statusLabel = "Proceed With Caution";
          recommendation = `AQI is ${aqi} (Moderate). ${label} is acceptable for healthy individuals, but pace yourself and avoid peak rush-hour smog.`;
        }
        alternativeIndoor = "A brisk workout on an indoor treadmill or gym elliptical is a great substitute.";
      } else if (aqi <= 150) {
        if (activity === "walking") {
          status = "caution";
          statusLabel = "Proceed With Caution";
          recommendation = `Walking is manageable for healthy adults, but sensitive individuals should reduce duration or wear a protective mask.`;
        } else {
          status = "not_recommended";
          statusLabel = "Not Recommended Outdoors";
          recommendation = `With an AQI of ${aqi} (${category}), vigorous outdoor ${label.toLowerCase()} causes deep inhalation of fine particulate matter.`;
        }
        alternativeIndoor = "Switch to indoor gym cardio, stationary spinning, or resistance band workouts.";
      } else {
        status = "not_recommended";
        statusLabel = "Not Recommended Outdoors";
        recommendation = `Not recommended outdoors in ${cityName}. Current AQI is ${aqi} (${category}, PM2.5: ${pm25} µg/m³). Inhaling high particulate concentrations during ${label.toLowerCase()} can cause bronchial irritation and cardiovascular distress.`;
        alternativeIndoor = "Shift your entire workout indoors with closed windows and active air filtration.";
      }

      const fallbackResult = {
        activity,
        activityLabel: label,
        status,
        statusLabel,
        recommendation,
        alternativeIndoor,
        source: "airaware-activity-engine",
      };
      apiCache.set(cacheKey, fallbackResult);
      return res.json(fallbackResult);
    } catch (err: any) {
      console.error("Error in /api/activity-check:", err);
      res.status(500).json({ error: "Failed to evaluate activity" });
    }
  });

  // 3. AI Trend Summary Endpoint
  app.post("/api/trend-summary", async (req, res) => {
    try {
      const {
        cityName = "Delhi",
        currentAQI = 324,
        avgAQI = 295,
        highestAQI = 335,
        lowestAQI = 240,
        trendStatus = "Worsening",
        days = [],
      } = req.body;

      const cacheKey = `trend:${cityName.toLowerCase()}:${currentAQI}:${trendStatus}`;
      const cached = apiCache.get<any>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const client = getGeminiClient();
      if (client && canCallGemini()) {
        try {
          const prompt = `You are an atmospheric trend analyst for AirAware.
Analyze the 7-day AQI trend for ${cityName}:
- Current AQI: ${currentAQI}
- 7-Day Average: ${avgAQI}
- Peak (Highest) AQI: ${highestAQI}
- Lowest AQI: ${lowestAQI}
- Direction: ${trendStatus}
- Recent daily values: ${JSON.stringify(days)}

Write a concise 2-sentence summary in simple, clear language explaining what happened to air quality over the past week and what residents should do now.
Example tone: "Air quality has worsened over the last 3 days due to seasonal smog accumulation. Outdoor activities should be limited when AQI remains high."
Do not use complicated meteorological jargon.`;

          const response = await geminiQueue.enqueue(() =>
            client.models.generateContent({
              model: "gemini-3.8-flash",
              contents: [{ role: "user", parts: [{ text: prompt }] }],
            })
          );

          recordGeminiCallSuccess();
          const summaryText = response.text || "";
          if (summaryText.trim()) {
            const result = {
              summary: summaryText.trim(),
              source: "gemini-3.8-flash",
            };
            apiCache.set(cacheKey, result);
            return res.json(result);
          }
        } catch (apiErr: any) {
          if (apiErr?.status === 429 || `${apiErr}`.includes("429") || `${apiErr}`.includes("quota")) {
            recordGeminiRateLimitError();
          }
        }
      }

      // Local fallback
      let summary = "";
      if (trendStatus === "Worsening") {
        summary = `Air quality in ${cityName} has worsened over the last 3 to 4 days, peaking at an AQI of ${highestAQI}. Outdoor activities and heavy workouts should be strictly limited while particulate levels remain elevated.`;
      } else if (trendStatus === "Improving") {
        summary = `Air quality in ${cityName} has improved over recent days, dropping towards ${lowestAQI} AQI. While the weekly average is ${avgAQI}, residents can take advantage of cleaner morning and afternoon windows.`;
      } else {
        summary = `Air quality in ${cityName} has remained relatively stable throughout the week, hovering near an average AQI of ${avgAQI}. Consistent precautions should remain in place until sustained dispersion winds arrive.`;
      }

      const fallbackResult = {
        summary,
        source: "airaware-trend-engine",
      };
      apiCache.set(cacheKey, fallbackResult);
      return res.json(fallbackResult);
    } catch (err: any) {
      console.error("Error in /api/trend-summary:", err);
      res.status(500).json({ error: "Failed to generate trend summary" });
    }
  });

  // 4. School Safety Mode Endpoint
  app.post("/api/school-safety", async (req, res) => {
    try {
      const { cityName = "Delhi", aqi = 250, category = "Very Unhealthy" } = req.body;

      const cacheKey = `school:${cityName.toLowerCase()}:${aqi}`;
      const cached = apiCache.get<any>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const client = getGeminiClient();
      if (client && canCallGemini()) {
        try {
          const prompt = `You are a school public health safety officer.
City: ${cityName}
AQI: ${aqi} (${category})

Generate clear, age-appropriate school safety recommendations.
Provide:
- outdoorRecess: Recommendation for outdoor recess and playground breaks (1-2 sentences).
- sportsRecommendation: Recommendation for sports, PE classes, and athletic training (1-2 sentences).
- studentExplanation: Simple explanation of today's air quality written for elementary/middle school students using a friendly, reassuring tone (1-2 sentences).
- teacherParentMessage: Actionable awareness notice for teachers, school administrators, and parents (2 sentences).`;

          const response = await geminiQueue.enqueue(() =>
            client.models.generateContent({
              model: "gemini-3.8-flash",
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    outdoorRecess: {
                      type: Type.STRING,
                      description: "Recommendation for outdoor recess and playground breaks.",
                    },
                    sportsRecommendation: {
                      type: Type.STRING,
                      description: "Recommendation for sports and PE classes.",
                    },
                    studentExplanation: {
                      type: Type.STRING,
                      description: "Kid-friendly explanation of today's air quality.",
                    },
                    teacherParentMessage: {
                      type: Type.STRING,
                      description: "Actionable advisory for teachers and parents.",
                    },
                  },
                  required: ["outdoorRecess", "sportsRecommendation", "studentExplanation", "teacherParentMessage"],
                },
              },
            })
          );

          recordGeminiCallSuccess();
          const raw = response.text || "";
          const parsed = safeExtractJSON(raw);
          if (parsed && parsed.outdoorRecess) {
            const result = {
              ...parsed,
              source: "gemini-3.8-flash",
            };
            apiCache.set(cacheKey, result);
            return res.json(result);
          }
        } catch (apiErr: any) {
          if (apiErr?.status === 429 || `${apiErr}`.includes("429") || `${apiErr}`.includes("quota")) {
            recordGeminiRateLimitError();
          }
        }
      }

      // Local fallback
      let outdoorRecess = "";
      let sportsRecommendation = "";
      let studentExplanation = "";
      let teacherParentMessage = "";

      if (aqi <= 50) {
        outdoorRecess = `Outdoor recess is fully approved in ${cityName}. Children can play freely across playgrounds and fields in clean, healthy air.`;
        sportsRecommendation = `All physical education classes, football, cricket, and athletic tournaments can proceed at full intensity outdoors.`;
        studentExplanation = `The air today is sparkling clean and fresh! Take deep breaths and enjoy running around with your friends outside.`;
        teacherParentMessage = `Conditions are ideal for outdoor learning, nature walks, and sports. Encourage hydration and outdoor play.`;
      } else if (aqi <= 100) {
        outdoorRecess = `Outdoor recess is permitted. Teachers should keep an eye on students with diagnosed asthma or seasonal allergies.`;
        sportsRecommendation = `PE classes can run normally outdoors, but provide frequent water breaks and avoid excessive midday heat.`;
        studentExplanation = `The air is okay today, but take water breaks while playing and tell a teacher if you feel tired or cough.`;
        teacherParentMessage = `Maintain standard monitoring. Ensure students who use rescue inhalers carry them during physical education.`;
      } else if (aqi <= 150) {
        outdoorRecess = `Limit outdoor recess to 15-20 minutes of gentle play. Move prolonged play sessions to indoor auditoriums or classrooms.`;
        sportsRecommendation = `Postpone high-exertion outdoor athletic trials. Shift PE to indoor stretching, table tennis, or skill drills.`;
        studentExplanation = `There is a little bit of dust and smoke in the sky today. It's best to play fun indoor games so our lungs stay happy and healthy!`;
        teacherParentMessage = `Advise sensitive students to wear N95 masks when moving between buildings. Keep classroom windows closed during peak morning traffic.`;
      } else if (aqi <= 200) {
        outdoorRecess = `Suspend outdoor recess. All student breaks should take place inside classrooms, libraries, or air-conditioned multi-purpose halls.`;
        sportsRecommendation = `Cancel outdoor competitive sports practices. Substitute with indoor yoga, wellness talks, or board games.`;
        studentExplanation = `The air outside is dirty today with invisible tiny dust specks. We are keeping recess indoors today to protect our breathing!`;
        teacherParentMessage = `Ensure school air purifiers are operating at full capacity. Request parents send children with certified particulate masks for school bus commutes.`;
      } else {
        outdoorRecess = `Strictly cancel all outdoor activities, assemblies, and recess. Keep all exterior school doors and windows securely closed.`;
        sportsRecommendation = `All outdoor physical training is cancelled. Strictly prohibit students from running or exerting outdoors.`;
        studentExplanation = `Today is a heavy smog day. The air is not safe to breathe outdoors, so we are having a cozy indoor day with clean filtered air!`;
        teacherParentMessage = `High alert: School administration should consider hybrid or online classes if smog persists. Ensure emergency medical protocols and oxygen support kits are accessible on campus.`;
      }

      const fallbackResult = {
        outdoorRecess,
        sportsRecommendation,
        studentExplanation,
        teacherParentMessage,
        source: "airaware-school-engine",
      };
      apiCache.set(cacheKey, fallbackResult);
      return res.json(fallbackResult);
    } catch (err: any) {
      console.error("Error in /api/school-safety:", err);
      res.status(500).json({ error: "Failed to generate school safety advice" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AirAware server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
