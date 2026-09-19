import React, { useState, useEffect } from 'react';
import { CityAirData, AqiAnalysisData } from '../types';
import { getAQICategory } from '../data/aqiGuideData';
import {
  Sparkles,
  HelpCircle,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Info,
  ChevronRight,
  Flame,
  Wind,
} from 'lucide-react';

interface SmartAQIAnalysisProps {
  currentCity: CityAirData;
}

export const SmartAQIAnalysis: React.FC<SmartAQIAnalysisProps> = ({ currentCity }) => {
  const [analysis, setAnalysis] = useState<AqiAnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const category = getAQICategory(currentCity.currentAQI);

  // Automatically fetch AI analysis when currentCity changes
  useEffect(() => {
    let isMounted = true;

    async function fetchAnalysis() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/analyze-aqi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityName: currentCity.name,
            aqi: currentCity.currentAQI,
            category: category.label,
            pm25: currentCity.pm25,
            pm10: currentCity.pm10,
            dominantPollutant: currentCity.dominantPollutant,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setAnalysis(data);
        }
      } catch (err: any) {
        console.warn('Failed to load AI AQI analysis:', err);
        if (isMounted) {
          // Provide fallback analysis immediately
          setAnalysis({
            whyHigh: `Air quality in ${currentCity.name} is influenced by ambient ${currentCity.dominantPollutant}, local transport emissions, and current meteorological dispersion.`,
            levelMeaning: `An AQI of ${currentCity.currentAQI} falls under "${category.label}". ${category.shortDesc}`,
            generalPrecautions: [
              'Monitor local real-time AQI updates before outdoor trips',
              'Stay hydrated to support airway mucous clearing',
              'Keep residential windows closed during peak traffic times',
            ],
            whatToAvoid: [
              'Avoid high-intensity outdoor running or cycling during smog peaks',
              'Avoid open burning of garbage, leaves, or incense indoors',
            ],
            safeToDo: [
              'Engage in indoor fitness and treadmill workouts',
              'Maintain air filtration in enclosed workspaces',
              'Wear an N95 respirator if traveling along arterial roads',
            ],
            source: 'airaware-smart-engine',
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, [currentCity.id, currentCity.currentAQI, currentCity.pm25]);

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-aqi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: currentCity.name,
          aqi: currentCity.currentAQI,
          category: category.label,
          pm25: currentCity.pm25,
          pm10: currentCity.pm10,
          dominantPollutant: currentCity.dominantPollutant,
        }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch {
      // Keep existing analysis
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-analysis" className="scroll-mt-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle Ambient Background Tint */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: category.color }}
        />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-sans tracking-tight">
                  AI Air Quality Analysis
                </h3>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {analysis?.source === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : 'AirAware AI Engine'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Automated causal &amp; physiological breakdown for <strong>{currentCity.name}</strong> (AQI {currentCity.currentAQI} • {category.label})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              id="btn-refresh-ai-analysis"
              onClick={handleManualRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Re-analyze'}</span>
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && !analysis && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              Generating contextual air quality analysis for {currentCity.name}...
            </p>
          </div>
        )}

        {/* Analysis Body */}
        {analysis && (
          <div className="pt-6 space-y-6 animate-fade-in">
            {/* Top 2 Callout Panels: Why High & What It Means */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Why the AQI may be high */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm mb-2">
                  <Wind className="w-4 h-4 text-emerald-500" />
                  <h4>Why the AQI is at this level in {currentCity.name}</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {analysis.whyHigh}
                </p>
              </div>

              {/* 2. What the AQI level means */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm mb-2">
                  <Info className="w-4 h-4 text-sky-500" />
                  <h4>What this AQI level means</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {analysis.levelMeaning}
                </p>
              </div>
            </div>

            {/* 3 Columns: General Precautions | What to Avoid | What to Safely Consider Doing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* General Precautions */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3.5 pb-2.5 border-b border-neutral-200 dark:border-neutral-700">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>General Precautions</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {analysis.generalPrecautions.map((item, idx) => (
                    <li key={idx} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What users should avoid */}
              <div className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-3.5 pb-2.5 border-b border-rose-200 dark:border-rose-900/50">
                  <AlertOctagon className="w-4 h-4 text-rose-500" />
                  <span>What to Avoid</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {analysis.whatToAvoid.map((item, idx) => (
                    <li key={idx} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What users can safely consider doing */}
              <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3.5 pb-2.5 border-b border-emerald-200 dark:border-emerald-900/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Safe to Consider Doing</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {analysis.safeToDo.map((item, idx) => (
                    <li key={idx} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
