import React, { useState } from 'react';
import { AQI_SCALE_LIST, AQI_CATEGORIES } from '../data/aqiGuideData';
import { AQILevel } from '../types';
import {
  BookOpen,
  Activity,
  Heart,
  Baby,
  Users,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export const AQIGuide: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<AQILevel>('moderate');

  const activeCategory = AQI_CATEGORIES[selectedKey];

  return (
    <section id="guide" className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Interactive Standard Scale
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
          Air Quality Index (AQI) Guide
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
          Understand the six official air quality brackets defined by global environmental protection agencies.
          Click any tier to view detailed health thresholds and precautions.
        </p>
      </div>

      {/* Visual Continuous Spectrum Bar */}
      <div className="mb-8 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center justify-between">
          <span>Continuous Air Quality Spectrum (0 - 500+)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Interactive: Select a tier below</span>
        </div>

        {/* 6 Color Segment Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {AQI_SCALE_LIST.map((cat) => {
            const isSelected = cat.key === selectedKey;
            return (
              <button
                key={cat.key}
                id={`btn-aqi-scale-${cat.key}`}
                onClick={() => setSelectedKey(cat.key)}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'ring-2 shadow-md scale-[1.02]'
                    : 'opacity-85 hover:opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: cat.bgColor,
                  borderColor: isSelected ? cat.color : 'transparent',
                  // @ts-ignore
                  '--tw-ring-color': cat.color,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    {cat.min} - {cat.max === 500 ? '500+' : cat.max}
                  </span>
                </div>
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {cat.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Deep Dive Details */}
      <div
        id="aqi-guide-detail-card"
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg p-6 sm:p-8 transition-all duration-300"
      >
        {/* Category Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-white text-xl shadow-md shrink-0"
              style={{ backgroundColor: activeCategory.color }}
            >
              {activeCategory.min}+
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sans">
                  {activeCategory.label}
                </h3>
                <span
                  className="px-3 py-0.5 rounded-full text-xs font-bold font-mono border"
                  style={{
                    backgroundColor: activeCategory.bgColor,
                    borderColor: activeCategory.borderColor,
                    color: activeCategory.color,
                  }}
                >
                  AQI {activeCategory.min} - {activeCategory.max === 500 ? '500+' : activeCategory.max}
                </span>
              </div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-1">
                {activeCategory.shortDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Full Explanation */}
        <div className="py-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            Physiological &amp; Environmental Impact
          </h4>
          <p className="text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
            {activeCategory.detailedExplanation}
          </p>
        </div>

        {/* Recommended Precautions by Group */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
            Recommended Actionable Precautions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* General Public */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  General Public
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {activeCategory.precautions.general}
                </p>
              </div>
            </div>

            {/* Sensitive Individuals */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Sensitive Individuals
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {activeCategory.precautions.sensitive}
                </p>
              </div>
            </div>

            {/* Children */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  <Baby className="w-4 h-4 text-blue-500" />
                  Children &amp; Recess
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {activeCategory.precautions.children}
                </p>
              </div>
            </div>

            {/* Elderly */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  Elderly Citizens
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {activeCategory.precautions.elderly}
                </p>
              </div>
            </div>

            {/* Outdoor Exercise */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between md:col-span-2 lg:col-span-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Outdoor Sports &amp; Exercise
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {activeCategory.precautions.exercise}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
