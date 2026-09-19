import React, { useState, useEffect } from 'react';
import { CityAirData } from '../types';
import { Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, Quote } from 'lucide-react';

interface AITrendSummaryProps {
  currentCity: CityAirData;
}

export const AITrendSummary: React.FC<AITrendSummaryProps> = ({ currentCity }) => {
  const [summary, setSummary] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const trendData = currentCity.weeklyTrend;
  const aqiValues = trendData.map((d) => d.aqi);
  const avgAQI = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const highestAQI = Math.max(...aqiValues);
  const lowestAQI = Math.min(...aqiValues);

  // Dynamic Trend Indicator: Compare first 3 days average vs last 3 days average
  const earlyAvg = (trendData[0].aqi + trendData[1].aqi) / 2;
  const recentAvg = (trendData[trendData.length - 1].aqi + trendData[trendData.length - 2].aqi) / 2;
  const diff = recentAvg - earlyAvg;

  let trendStatus: 'Improving' | 'Worsening' | 'Stable' = 'Stable';
  if (diff < -15) trendStatus = 'Improving';
  else if (diff > 15) trendStatus = 'Worsening';

  useEffect(() => {
    let isMounted = true;

    async function fetchTrendSummary() {
      setLoading(true);
      try {
        const response = await fetch('/api/trend-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityName: currentCity.name,
            currentAQI: currentCity.currentAQI,
            avgAQI,
            highestAQI,
            lowestAQI,
            trendStatus,
            days: trendData,
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch trend summary');
        const data = await response.json();
        if (isMounted) {
          setSummary(data.summary);
          setSource(data.source);
        }
      } catch (err) {
        if (isMounted) {
          // Local fallback matching requested example tone
          if (trendStatus === 'Worsening') {
            setSummary(
              `Air quality in ${currentCity.name} has worsened over the last 3 days. Outdoor activities should be limited when AQI remains high.`
            );
          } else if (trendStatus === 'Improving') {
            setSummary(
              `Air quality in ${currentCity.name} has improved over the last 3 days, dropping to an AQI of ${lowestAQI}. Outdoor activities can be scheduled during cleaner morning windows.`
            );
          } else {
            setSummary(
              `Air quality in ${currentCity.name} has remained relatively stable this week with an average AQI of ${avgAQI}. Continue observing standard air-quality precautions.`
            );
          }
          setSource('airaware-trend-engine');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTrendSummary();

    return () => {
      isMounted = false;
    };
  }, [currentCity.id, currentCity.currentAQI]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trend-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: currentCity.name,
          currentAQI: currentCity.currentAQI,
          avgAQI,
          highestAQI,
          lowestAQI,
          trendStatus,
          days: trendData,
        }),
      });
      const data = await response.json();
      setSummary(data.summary);
      setSource(data.source);
    } catch {
      // Retain existing
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-trend-summary" className="scroll-mt-20 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-6 mb-8">
      <div className="bg-emerald-500/5 dark:bg-emerald-950/20 rounded-3xl border border-emerald-500/20 dark:border-emerald-800/40 p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/15 dark:border-emerald-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white font-sans tracking-tight">
                  AI Trend Summary
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {source === 'gemini-2.5-flash' ? 'Gemini AI' : 'Smart Engine'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Natural-language trajectory summary for {currentCity.name}&apos;s 7-day environmental metrics
              </p>
            </div>
          </div>

          <button
            id="btn-refresh-trend-summary"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 cursor-pointer self-start sm:self-center transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            <span>{loading ? 'Summarizing...' : 'Regenerate'}</span>
          </button>
        </div>

        <div className="pt-4">
          {loading ? (
            <div className="py-4 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Gemini is synthesizing the 7-day AQI trend...
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Quote className="w-5 h-5 text-emerald-500/60 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  &ldquo;{summary}&rdquo;
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>
                    7-Day Avg: <strong className="text-neutral-800 dark:text-neutral-200 font-mono">{avgAQI}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Peak: <strong className="text-rose-600 dark:text-rose-400 font-mono">{highestAQI}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Low: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{lowestAQI}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Slope: <strong className="text-neutral-800 dark:text-neutral-200">{trendStatus}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
