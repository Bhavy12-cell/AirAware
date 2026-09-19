import React, { useState, useEffect } from 'react';
import { CityAirData, ActivityType, ActivityRecommendationData } from '../types';
import { getAQICategory } from '../data/aqiGuideData';
import {
  Activity,
  Bike,
  Footprints,
  Trophy,
  Flame,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ActivityCheckProps {
  currentCity: CityAirData;
  onAskAIQuestion?: (question: string) => void;
}

const ACTIVITIES: { id: ActivityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'jogging', label: 'Jogging', icon: Activity },
  { id: 'cycling', label: 'Cycling', icon: Bike },
  { id: 'walking', label: 'Walking', icon: Footprints },
  { id: 'outdoor_sports', label: 'Outdoor Sports', icon: Trophy },
  { id: 'running', label: 'Running', icon: Flame },
  { id: 'indoor_exercise', label: 'Indoor Exercise', icon: Dumbbell },
];

export const ActivityCheck: React.FC<ActivityCheckProps> = ({ currentCity, onAskAIQuestion }) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('jogging');
  const [recommendation, setRecommendation] = useState<ActivityRecommendationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const category = getAQICategory(currentCity.currentAQI);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecommendation() {
      setLoading(true);
      try {
        const response = await fetch('/api/activity-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityName: currentCity.name,
            aqi: currentCity.currentAQI,
            category: category.label,
            pm25: currentCity.pm25,
            activity: selectedActivity,
          }),
        });

        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        if (isMounted) {
          setRecommendation(data);
        }
      } catch (err) {
        if (isMounted) {
          // Fallback logic
          const activeItem = ACTIVITIES.find((a) => a.id === selectedActivity) || ACTIVITIES[0];
          const aqi = currentCity.currentAQI;
          let status: 'safe' | 'caution' | 'not_recommended' = 'not_recommended';
          let statusLabel = 'Not Recommended Outdoors';
          let rec = '';

          if (selectedActivity === 'indoor_exercise') {
            status = 'safe';
            statusLabel = 'Safe & Recommended';
            rec = `Indoor exercise in a clean-air environment is ideal for ${currentCity.name} today.`;
          } else if (aqi <= 50) {
            status = 'safe';
            statusLabel = 'Safe & Recommended';
            rec = `${activeItem.label} is completely safe and encouraged in ${currentCity.name} today.`;
          } else if (aqi <= 100) {
            status = selectedActivity === 'walking' ? 'safe' : 'caution';
            statusLabel = selectedActivity === 'walking' ? 'Safe & Recommended' : 'Proceed With Caution';
            rec = `Air quality is Moderate (AQI ${aqi}). ${activeItem.label} is acceptable for healthy individuals.`;
          } else {
            status = 'not_recommended';
            statusLabel = 'Not Recommended Outdoors';
            rec = `Not recommended outdoors. Consider indoor exercise until air quality improves.`;
          }

          setRecommendation({
            activity: selectedActivity,
            activityLabel: activeItem.label,
            status,
            statusLabel,
            recommendation: rec,
            alternativeIndoor: 'Consider stationary cycling, yoga, or indoor bodyweight training.',
            source: 'airaware-activity-engine',
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecommendation();

    return () => {
      isMounted = false;
    };
  }, [selectedActivity, currentCity.id, currentCity.currentAQI]);

  const activeActivityObj = ACTIVITIES.find((a) => a.id === selectedActivity) || ACTIVITIES[0];

  const getStatusBadge = (status: 'safe' | 'caution' | 'not_recommended') => {
    switch (status) {
      case 'safe':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Safe &amp; Recommended
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Proceed With Caution
          </span>
        );
      case 'not_recommended':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Not Recommended Outdoors
          </span>
        );
    }
  };

  return (
    <section id="activity-check" className="scroll-mt-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
              <Activity className="w-3.5 h-3.5" />
              Smart Activity Recommendation
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white font-sans">
              Activity Check
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Select an activity to get a personalized safety evaluation based on <strong>{currentCity.name}</strong>&apos;s current AQI of <strong>{currentCity.currentAQI}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            <span>Location: {currentCity.name}</span>
            <span>•</span>
            <span style={{ color: category.color }}>{currentCity.currentAQI} AQI</span>
          </div>
        </div>

        {/* 6 Activity Selection Chips */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
            Choose Activity to Evaluate:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {ACTIVITIES.map((act) => {
              const isSelected = act.id === selectedActivity;
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  id={`activity-btn-${act.id}`}
                  onClick={() => setSelectedActivity(act.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-md'
                      : 'bg-white dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-emerald-400 dark:text-emerald-600' : 'text-neutral-500 dark:text-neutral-400'}`} />
                  <span className="text-xs font-bold">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Recommendation Card (matches user request example) */}
        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          {loading ? (
            <div className="py-6 flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                Evaluating respiratory safety for {activeActivityObj.label}...
              </span>
            </div>
          ) : recommendation ? (
            <div className="space-y-4">
              {/* Header pill & specs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    AQI: <strong className="text-neutral-900 dark:text-white font-mono">{currentCity.currentAQI}</strong>
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Activity: <strong className="text-neutral-900 dark:text-white">{recommendation.activityLabel}</strong>
                  </span>
                </div>
                {getStatusBadge(recommendation.status)}
              </div>

              {/* Exact statement representation */}
              <div className="space-y-1.5">
                <p className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white leading-snug">
                  &ldquo;{recommendation.recommendation}&rdquo;
                </p>
                {recommendation.alternativeIndoor && (
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 pt-1">
                    <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Indoor Alternative:</strong> {recommendation.alternativeIndoor}</span>
                  </p>
                )}
              </div>

              {/* Consult AI Assistant button */}
              {onAskAIQuestion && (
                <div className="pt-2">
                  <button
                    id="btn-ask-ai-activity"
                    onClick={() => {
                      onAskAIQuestion(
                        `In ${currentCity.name}, the AQI is ${currentCity.currentAQI}. What are safe precautions or specific indoor routines if I want to do ${recommendation.activityLabel}?`
                      );
                    }}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask AirAware AI for personalized workout intervals
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
