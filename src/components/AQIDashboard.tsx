import React, { useState } from 'react';
import { CityAirData } from '../types';
import { CITIES_LIST, CITIES_DATA } from '../data/mockData';
import { AQIGauge } from './AQIGauge';
import { getAQICategory } from '../data/aqiGuideData';
import {
  MapPin,
  Clock,
  RefreshCw,
  Thermometer,
  Droplets,
  Wind,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';

interface AQIDashboardProps {
  currentCity: CityAirData;
  onSelectCity: (cityId: string) => void;
  onAskAIQuestion: (question: string) => void;
}

export const AQIDashboard: React.FC<AQIDashboardProps> = ({
  currentCity,
  onSelectCity,
  onAskAIQuestion,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  const category = getAQICategory(currentCity.currentAQI);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshNotice('Fetching latest telemetry...');
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotice('Data updated just now');
      setTimeout(() => setRefreshNotice(null), 3000);
    }, 600);
  };

  // WHO Reference guidelines
  // PM2.5: WHO 24-hr guideline is 15 µg/m³
  // PM10: WHO 24-hr guideline is 45 µg/m³
  const pm25Multiple = (currentCity.pm25 / 15).toFixed(1);
  const pm10Multiple = (currentCity.pm10 / 45).toFixed(1);

  return (
    <section id="dashboard" className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <Activity className="w-3.5 h-3.5" />
            Live Environmental Telemetry
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
            City AQI Dashboard
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            Real-time atmospheric pollutants, health safety ratings, and actionable guidelines.
          </p>
        </div>

        {/* Refresh & Last Updated indicator */}
        <div className="flex items-center gap-3">
          {refreshNotice && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
              {refreshNotice}
            </span>
          )}
          <button
            id="btn-refresh-aqi"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors border border-neutral-200 dark:border-neutral-700 disabled:opacity-60 cursor-pointer"
            title="Refresh AQI Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* City Selector Pills */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
          Select City
        </label>
        <div id="city-selector-list" className="flex flex-wrap gap-2.5">
          {CITIES_LIST.map((city) => {
            const isSelected = city.id === currentCity.id;
            const cityCat = getAQICategory(city.currentAQI);
            return (
              <button
                key={city.id}
                id={`city-tab-${city.id}`}
                onClick={() => onSelectCity(city.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-md'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                <MapPin className={`w-4 h-4 ${isSelected ? 'text-emerald-400 dark:text-emerald-600' : 'text-neutral-400'}`} />
                <span>{city.name}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cityCat.bgColor,
                    color: isSelected ? 'white' : cityCat.color,
                  }}
                >
                  {city.currentAQI}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Gauge on Left, Metrics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Gauge Card */}
        <div
          id="aqi-main-gauge-card"
          className="lg:col-span-5 bg-white dark:bg-neutral-900/90 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center justify-between relative overflow-hidden"
        >
          {/* Ambient Glow Accent */}
          <div
            className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: category.color }}
          />

          {/* Location & Time Info */}
          <div className="w-full flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-base text-neutral-900 dark:text-white">
                {currentCity.name}, {currentCity.state}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentCity.lastUpdated}</span>
            </div>
          </div>

          {/* Radial Gauge */}
          <div className="py-2 z-10">
            <AQIGauge aqi={currentCity.currentAQI} size={250} />
          </div>

          {/* Dominant Pollutant */}
          <div className="w-full mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs z-10">
            <span className="text-neutral-500 dark:text-neutral-400">Dominant Pollutant:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {currentCity.dominantPollutant}
            </span>
          </div>
        </div>

        {/* Right Column: Detailed Atmospheric Metrics */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PM2.5 Card */}
            <div
              id="metric-pm25-card"
              className="bg-white dark:bg-neutral-900/90 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  PM2.5 Concentration
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                  WHO: 15 µg/m³
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white font-sans">
                  {currentCity.pm25}
                </span>
                <span className="text-sm font-semibold text-neutral-500">µg/m³</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                <strong className={Number(pm25Multiple) > 1 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}>
                  {pm25Multiple}x
                </strong>{' '}
                times the WHO recommended 24-hour safe threshold.
              </p>
              {/* Progress bar */}
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((currentCity.pm25 / 150) * 100, 100)}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
            </div>

            {/* PM10 Card */}
            <div
              id="metric-pm10-card"
              className="bg-white dark:bg-neutral-900/90 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  PM10 Concentration
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                  WHO: 45 µg/m³
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white font-sans">
                  {currentCity.pm10}
                </span>
                <span className="text-sm font-semibold text-neutral-500">µg/m³</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                <strong className={Number(pm10Multiple) > 1 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}>
                  {pm10Multiple}x
                </strong>{' '}
                times the WHO recommended 24-hour safe threshold.
              </p>
              {/* Progress bar */}
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((currentCity.pm10 / 250) * 100, 100)}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
            </div>

            {/* Weather / Temperature */}
            <div
              id="metric-temperature-card"
              className="bg-white dark:bg-neutral-900/90 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                  Temperature
                </span>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {currentCity.temperature}°C
                </div>
                <span className="text-xs text-neutral-500">Local ambient conditions</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                <Thermometer className="w-5 h-5" />
              </div>
            </div>

            {/* Humidity & Wind */}
            <div
              id="metric-wind-humidity-card"
              className="bg-white dark:bg-neutral-900/90 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                  Atmospheric Dispersion
                </span>
                <div className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-semibold">
                    <Wind className="w-3.5 h-3.5 text-sky-500" /> {currentCity.windSpeed} km/h
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> {currentCity.humidity}%
                  </span>
                </div>
                <span className="text-xs text-neutral-500">Humidity & wind speed</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Wind className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Health Recommendation Card */}
          <div
            id="health-recommendation-banner"
            className="rounded-2xl p-5 border shadow-sm transition-all duration-300"
            style={{
              backgroundColor: category.bgColor,
              borderColor: category.borderColor,
            }}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-neutral-900/80 shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" style={{ color: category.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    Official Health Recommendation ({category.label})
                  </h4>
                  <span className="text-xs font-mono font-bold" style={{ color: category.color }}>
                    AQI {currentCity.currentAQI}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                  {currentCity.healthRecommendation}
                </p>

                {/* Prompt trigger to AI Assistant */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    id="btn-ask-ai-from-dashboard"
                    onClick={() => {
                      onAskAIQuestion(`What should I do right now in ${currentCity.name} with an AQI of ${currentCity.currentAQI}?`);
                      const el = document.getElementById('ai-assistant');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    Consult AirAware AI about this reading
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
