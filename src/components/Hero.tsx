import React from 'react';
import { CityAirData } from '../types';
import { getAQICategory } from '../data/aqiGuideData';
import {
  Wind,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Globe2,
  TreePine,
  CheckCircle2,
} from 'lucide-react';

interface HeroProps {
  currentCity: CityAirData;
  onCheckAirQuality: () => void;
  onAskAI: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentCity,
  onCheckAirQuality,
  onAskAI,
}) => {
  const category = getAQICategory(currentCity.currentAQI);

  return (
    <section id="home" className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Decorative Gradient Rings */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline, Tagline, CTAs */}
        <div className="lg:col-span-7 text-left z-10">
          {/* SDG Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 mb-6">
            <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>UN SDG 11 (Sustainable Cities) &amp; SDG 13 (Climate Action)</span>
          </div>

          {/* Logo Brand Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Wind className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white font-sans">
              Air<span className="text-emerald-600 dark:text-emerald-400">Aware</span>
            </h1>
          </div>

          {/* Tagline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight leading-[1.1] mb-6">
            Breathe Smarter.{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
              Live Healthier.
            </span>
          </h2>

          {/* Short Description */}
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 max-w-2xl">
            AirAware empowers citizens, families, and outdoor enthusiasts to understand air quality in simple language.
            Track real-time AQI across major cities, analyze 7-day smog trends, and receive personalized safety guidance from our contextual AI assistant.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              id="btn-hero-check-aqi"
              onClick={onCheckAirQuality}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              Check Air Quality
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-hero-ask-ai"
              onClick={onAskAI}
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Ask AI Assistant
            </button>
          </div>

          {/* Micro Trust Points */}
          <div className="mt-8 pt-6 border-t border-neutral-200/80 dark:border-neutral-800/80 flex flex-wrap items-center gap-6 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real-time EPA &amp; WHO Standards</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Contextual AI Health Safety Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Medical Jargon</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Environmental Air Quality Showcase Card */}
        <div className="lg:col-span-5 z-10">
          <div className="relative bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden">
            {/* Ambient Background Accent Glow */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-20 pointer-events-none"
              style={{ backgroundColor: category.color }}
            />

            {/* Header pill */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Live Snapshot
                </span>
              </div>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                {currentCity.name}, {currentCity.country}
              </span>
            </div>

            {/* Big AQI Number & Category */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Current Air Quality Index
              </span>
              <div className="flex items-baseline justify-center gap-2">
                <span
                  className="text-6xl font-black font-sans tracking-tight"
                  style={{ color: category.color }}
                >
                  {currentCity.currentAQI}
                </span>
                <span className="text-sm font-bold text-neutral-500">AQI</span>
              </div>
              <div className="mt-2">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: category.bgColor,
                    borderColor: category.borderColor,
                    color: category.color,
                  }}
                >
                  {category.label}
                </span>
              </div>
            </div>

            {/* 3 Micro Stats */}
            <div className="grid grid-cols-3 gap-2.5 text-center mb-6">
              <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50">
                <span className="text-[11px] text-neutral-500 block">PM2.5</span>
                <strong className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {currentCity.pm25} µg
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50">
                <span className="text-[11px] text-neutral-500 block">Temp</span>
                <strong className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {currentCity.temperature}°C
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50">
                <span className="text-[11px] text-neutral-500 block">7-Day</span>
                <strong className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {currentCity.trendDirection}
                </strong>
              </div>
            </div>

            {/* Direct Quick Recommendation */}
            <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              <strong className="text-emerald-700 dark:text-emerald-300 block mb-0.5">
                AI Health Advisory:
              </strong>
              {currentCity.healthRecommendation.length > 130
                ? `${currentCity.healthRecommendation.substring(0, 130)}...`
                : currentCity.healthRecommendation}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
