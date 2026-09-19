import React, { useState } from 'react';
import { SAFETY_TIP_GROUPS } from '../data/safetyTipsData';
import { CityAirData } from '../types';
import { getAQICategory } from '../data/aqiGuideData';
import {
  ShieldAlert,
  Activity,
  Baby,
  HeartPulse,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface SafetyTipsProps {
  currentCity: CityAirData;
}

export const SafetyTips: React.FC<SafetyTipsProps> = ({ currentCity }) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('outdoor-exercise');

  const currentCategory = getAQICategory(currentCity.currentAQI);

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-5 h-5 text-amber-500" />;
      case 'Baby':
        return <Baby className="w-5 h-5 text-blue-500" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-purple-500" />;
      case 'Users':
      default:
        return <Users className="w-5 h-5 text-emerald-500" />;
    }
  };

  const activePersona =
    SAFETY_TIP_GROUPS.find((g) => g.id === selectedPersonaId) || SAFETY_TIP_GROUPS[0];

  // Helper to pick the relevant advice based on active city's AQI
  const getCitySpecificAdvice = (group: typeof activePersona) => {
    const aqi = currentCity.currentAQI;
    if (aqi <= 50) return { text: group.goodAdvice, tier: 'Good' };
    if (aqi <= 100) return { text: group.moderateAdvice, tier: 'Moderate' };
    if (aqi <= 200) return { text: group.unhealthyAdvice, tier: 'Unhealthy' };
    return { text: group.hazardousAdvice, tier: 'Hazardous' };
  };

  const currentAdvice = getCitySpecificAdvice(activePersona);

  return (
    <section id="safety" className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          Public Health Recommendations
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
          Safety Tips &amp; Preventive Guidance
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
          Practical precautions tailored for vulnerable demographics, athletes, and the general public.
          Awareness-based guidance to minimize particulate inhalation.
        </p>
      </div>

      {/* Persona Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {SAFETY_TIP_GROUPS.map((group) => {
          const isSelected = group.id === selectedPersonaId;
          return (
            <button
              key={group.id}
              id={`safety-tab-${group.id}`}
              onClick={() => setSelectedPersonaId(group.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-md'
                  : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              {getPersonaIcon(group.iconName)}
              <span>{group.title}</span>
            </button>
          );
        })}
      </div>

      {/* Persona Detail View */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
              {getPersonaIcon(activePersona.iconName)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {activePersona.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Target Demographic: <strong>{activePersona.targetAudience}</strong>
              </p>
            </div>
          </div>

          {/* Current City Context Badge */}
          <div
            className="px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-semibold self-start md:self-auto"
            style={{
              backgroundColor: currentCategory.bgColor,
              borderColor: currentCategory.borderColor,
              color: currentCategory.color,
            }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Real-time advice for {currentCity.name} (AQI {currentCity.currentAQI})
            </span>
          </div>
        </div>

        {/* Current City Alert Banner */}
        <div
          className="my-6 p-4 rounded-xl border text-sm leading-relaxed"
          style={{
            backgroundColor: currentCategory.bgColor,
            borderColor: currentCategory.borderColor,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 dark:bg-neutral-900/80 shrink-0 mt-0.5" style={{ color: currentCategory.color }}>
              Current Status: {currentAdvice.tier}
            </div>
            <p className="text-neutral-800 dark:text-neutral-200 font-medium">
              {currentAdvice.text}
            </p>
          </div>
        </div>

        {/* 4 General Practical Tips */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Core Health &amp; Prevention Principles
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePersona.generalTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800/80 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
