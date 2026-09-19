import React, { useState, useRef, useEffect } from 'react';
import { CityAirData, ChatMessage } from '../types';
import { getAQICategory } from '../data/aqiGuideData';
import {
  Bot,
  User,
  Send,
  Sparkles,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  Check,
  Copy,
  Info,
  ExternalLink,
} from 'lucide-react';

interface ChatbotProps {
  currentCity: CityAirData;
  prefilledQuestion?: string;
  onClearPrefilledQuestion?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'Can I go jogging today?',
  'Is it safe for children to play outside?',
  'Should I wear a mask?',
  "What does today's AQI mean?",
  "Is today's air quality improving?",
];

export const Chatbot: React.FC<ChatbotProps> = ({
  currentCity,
  prefilledQuestion,
  onClearPrefilledQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I am AirAware AI, your environmental and public health advisor. I am actively tracking conditions for **${currentCity.name}** (Current AQI: ${currentCity.currentAQI} – ${getAQICategory(currentCity.currentAQI).label}). How can I assist you with outdoor plans or air safety today?`,
      timestamp: 'Just now',
      cityContext: currentCity.name,
      aqiContext: currentCity.currentAQI,
      categoryContext: getAQICategory(currentCity.currentAQI).label,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages update or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle external prefilled questions (e.g. from dashboard click)
  useEffect(() => {
    if (prefilledQuestion) {
      setInputQuery(prefilledQuestion);
      inputRef.current?.focus();
      if (onClearPrefilledQuestion) {
        onClearPrefilledQuestion();
      }
    }
  }, [prefilledQuestion, onClearPrefilledQuestion]);

  // Notice when city changes, add contextual system insight if requested
  const prevCityIdRef = useRef(currentCity.id);
  useEffect(() => {
    if (prevCityIdRef.current !== currentCity.id) {
      prevCityIdRef.current = currentCity.id;
      const cat = getAQICategory(currentCity.currentAQI);
      const systemContextMessage: ChatMessage = {
        id: `city-switch-${Date.now()}`,
        sender: 'assistant',
        text: `Switched active monitoring to **${currentCity.name}**. Current AQI is **${currentCity.currentAQI}** (${cat.label}), with PM2.5 at ${currentCity.pm25} µg/m³. I am ready to answer any safety or activity questions for ${currentCity.name}.`,
        timestamp: 'Just now',
        cityContext: currentCity.name,
        aqiContext: currentCity.currentAQI,
        categoryContext: cat.label,
      };
      setMessages((prev) => [...prev, systemContextMessage]);
    }
  }, [currentCity]);

  // Local fallback response generator if network fails
  const generateDirectFallback = (userText: string): string => {
    const q = userText.toLowerCase();
    const aqi = currentCity.currentAQI;
    const cat = getAQICategory(aqi).label;

    if (q.includes('jog') || q.includes('run') || q.includes('exercise') || q.includes('workout')) {
      if (aqi <= 50) {
        return `Outdoor jogging in **${currentCity.name}** is completely safe today! The current AQI is **${aqi}** (${cat}) and PM2.5 is low at ${currentCity.pm25} µg/m³. Great time for cardio.`;
      } else if (aqi <= 100) {
        return `Outdoor jogging in **${currentCity.name}** is generally fine (AQI is **${aqi}** – ${cat}). If you have sensitive airways or asthma, consider avoiding rush-hour traffic routes.`;
      } else if (aqi <= 150) {
        return `Jogging in **${currentCity.name}** requires caution today (AQI **${aqi}**, ${cat}). High-intensity aerobic breathing pulls fine particulates deep into your airways. Sensitive individuals should opt for indoor exercise.`;
      } else {
        return `Outdoor jogging is NOT recommended right now because the current AQI in **${currentCity.name}** is high (**${aqi}** – ${cat}, PM2.5: ${currentCity.pm25} µg/m³). Deep aerobic inhalation exposes lung alveoli to heavy particulate matter. Consider indoor exercise or a home workout instead.`;
      }
    }

    if (q.includes('child') || q.includes('kid') || q.includes('play')) {
      if (aqi <= 50) {
        return `Yes, it is completely safe for children to play outside in **${currentCity.name}** today! The AQI is **${aqi}** (${cat}), well within clean air thresholds.`;
      } else if (aqi <= 100) {
        return `Children can safely play outside in **${currentCity.name}** (AQI **${aqi}** – ${cat}). Ensure children with known asthma stay hydrated and take rest breaks.`;
      } else {
        return `Outdoor play is NOT advised for children in **${currentCity.name}** right now due to elevated pollution (AQI **${aqi}** – ${cat}). Children have developing lungs and breathe significantly more air per pound of body weight. Encourage indoor creative games instead.`;
      }
    }

    if (q.includes('mask') || q.includes('n95')) {
      if (aqi <= 100) {
        return `A protective mask is not typically required in **${currentCity.name}** today with an AQI of **${aqi}** (${cat}), unless you are unusually sensitive or commuting directly through heavy traffic dust.`;
      } else if (aqi <= 150) {
        return `Wearing an N95 or KN95 particulate mask is recommended in **${currentCity.name}** for cyclists and sensitive groups (AQI **${aqi}** – ${cat}). Cloth masks cannot adequately filter microscopic PM2.5.`;
      } else {
        return `Yes, wearing a certified N95 or KN95 respirator is strongly advised when stepping outside in **${currentCity.name}** (AQI **${aqi}** – ${cat}). Microscopic PM2.5 particulates (${currentCity.pm25} µg/m³) penetrate standard cloth or surgical masks.`;
      }
    }

    if (q.includes('mean') || q.includes('explain') || q.includes('what does')) {
      return `In **${currentCity.name}**, today's AQI of **${aqi}** places air quality in the **${cat}** category. This means ${currentCity.healthRecommendation} The dominant pollutant is ${currentCity.dominantPollutant}.`;
    }

    if (q.includes('improv') || q.includes('trend') || q.includes('better') || q.includes('worse')) {
      return `The 7-day trend for **${currentCity.name}** is currently **${currentCity.trendDirection}**. Current AQI is **${aqi}** (${cat}). Check the 7-day trend chart below to observe daily fluctuations and atmospheric patterns.`;
    }

    return `Regarding **${currentCity.name}** (AQI **${aqi}**, ${cat}): The current PM2.5 level is ${currentCity.pm25} µg/m³. ${currentCity.healthRecommendation} Let me know if you would like specific guidance for sports, seniors, children, or masks!`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    try {
      // Call backend API /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          cityName: currentCity.name,
          aqi: currentCity.currentAQI,
          category: getAQICategory(currentCity.currentAQI).label,
          pm25: currentCity.pm25,
          pm10: currentCity.pm10,
          temperature: currentCity.temperature,
          trend: currentCity.trendDirection,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || generateDirectFallback(query);

        // Add assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: replyText,
            timestamp: 'Just now',
            cityContext: currentCity.name,
            aqiContext: currentCity.currentAQI,
            categoryContext: getAQICategory(currentCity.currentAQI).label,
          },
        ]);
      } else {
        throw new Error('API status not ok');
      }
    } catch {
      // Graceful local fallback
      const fallbackText = generateDirectFallback(query);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          timestamp: 'Just now',
          cityContext: currentCity.name,
          aqiContext: currentCity.currentAQI,
          categoryContext: getAQICategory(currentCity.currentAQI).label,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    const cat = getAQICategory(currentCity.currentAQI);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. I am ready to advise you on air safety for **${currentCity.name}** (AQI: ${currentCity.currentAQI} – ${cat.label}).`,
        timestamp: 'Just now',
        cityContext: currentCity.name,
        aqiContext: currentCity.currentAQI,
        categoryContext: cat.label,
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCategory = getAQICategory(currentCity.currentAQI);

  return (
    <section id="ai-assistant" className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title & Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          AI Environmental Health Assistant
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
          AirAware AI Chat
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl mx-auto">
          Ask questions about your daily outdoor activities, running, children’s play, or respiratory precautions.
          Responses automatically adapt to current atmospheric data.
        </p>
      </div>

      {/* Main Chatbot Box */}
      <div
        id="chatbot-interface-box"
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden flex flex-col h-[640px]"
      >
        {/* Chatbot Header */}
        <div className="px-5 py-4 bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">AirAware AI</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <span>Context:</span>
                <strong className="text-neutral-800 dark:text-neutral-200">{currentCity.name}</strong>
                <span>• AQI</span>
                <span
                  className="font-bold px-1.5 py-0.2 rounded text-[11px]"
                  style={{ backgroundColor: activeCategory.bgColor, color: activeCategory.color }}
                >
                  {currentCity.currentAQI} ({activeCategory.label})
                </span>
              </div>
            </div>
          </div>

          {/* Chat Actions */}
          <div className="flex items-center gap-2">
            <button
              id="btn-reset-chat"
              onClick={handleClearChat}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div
          id="chat-message-stream"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/50"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[80%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="group relative">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-tr-none'
                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-700/80 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {/* Render basic bold formatting */}
                    <div className="whitespace-pre-wrap">
                      {msg.text.split('**').map((part, index) =>
                        index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                      )}
                    </div>
                  </div>

                  {/* Context and timestamp */}
                  <div
                    className={`flex items-center gap-2 mt-1 text-[11px] text-neutral-400 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white shrink-0 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-neutral-400 ml-2">AirAware AI is analyzing air quality...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Carousel / Chips */}
        <div className="p-3 bg-neutral-100/70 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_QUESTIONS.map((question, i) => (
              <button
                key={i}
                id={`btn-suggested-q-${i}`}
                onClick={() => {
                  setInputQuery(question);
                  handleSendMessage(question);
                }}
                disabled={isTyping}
                className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-300 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          id="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3"
        >
          <input
            ref={inputRef}
            id="chat-user-input"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask about running, masks, children, or AQI in ${currentCity.name}...`}
            disabled={isTyping}
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm px-4 py-3 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none transition-all placeholder:text-neutral-400"
          />

          <button
            id="btn-chat-send"
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        {/* Medical & Awareness Disclaimer */}
        <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              <strong>Disclaimer:</strong> Environmental awareness tool for general public guidance. Not a substitute for medical diagnosis or clinical treatment.
            </span>
          </div>
          <span className="hidden md:inline font-mono">SDG 11 &amp; 13</span>
        </div>
      </div>
    </section>
  );
};
