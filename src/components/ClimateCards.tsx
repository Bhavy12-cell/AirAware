import React, { useState } from 'react';
import { CLIMATE_TOPICS } from '../data/climateData';
import {
  Globe,
  Wind,
  Factory,
  Building2,
  Flame,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Leaf,
  Target,
} from 'lucide-react';

export const ClimateCards: React.FC = () => {
  const [expandedTopicId, setExpandedTopicId] = useState<string>('what-is-air-pollution');
  const [pledgedActions, setPledgedActions] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTopicId((prev) => (prev === id ? '' : id));
  };

  const togglePledge = (actionId: string) => {
    setPledgedActions((prev) => ({
      ...prev,
      [actionId]: !prev[actionId],
    }));
  };

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wind':
        return <Wind className="w-5 h-5 text-sky-500" />;
      case 'Factory':
        return <Factory className="w-5 h-5 text-amber-500" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-emerald-500" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-5 h-5 text-teal-500" />;
    }
  };

  const pledgeList = [
    { id: 'transit', label: 'Use public transit or cycling for trips under 5km twice weekly' },
    { id: 'waste', label: 'Never burn leaves or open garbage; compost garden waste' },
    { id: 'plants', label: 'Cultivate indoor air-purifying plants (Areca Palm, Snake Plant)' },
    { id: 'efficiency', label: 'Maintain home AC filters and conserve thermal power usage' },
  ];

  const totalPledged = Object.values(pledgedActions).filter(Boolean).length;

  return (
    <section id="climate" className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
          <Globe className="w-3.5 h-3.5" />
          SDG 11 &amp; SDG 13 Global Framework
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
          Climate &amp; Air Quality Awareness
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
          Discover how airborne particulates interconnect with urban growth, human health, and planetary heating.
          Explore the five pillars of environmental action.
        </p>
      </div>

      {/* SDG Highlight Banner */}
      <div className="mb-10 bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-sky-950/30 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Targeting UN Sustainable Development Goals
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
              <strong>SDG 11.6:</strong> Reducing the adverse environmental impact of cities through cleaner air.{' '}
              <br className="hidden sm:inline" />
              <strong>SDG 13.2:</strong> Integrating air pollution and climate mitigation into community policies.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs">
            SDG 11: Cities
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs shadow-xs">
            SDG 13: Climate
          </span>
        </div>
      </div>

      {/* 5 Educational Information Cards */}
      <div className="space-y-4 mb-12">
        {CLIMATE_TOPICS.map((topic) => {
          const isExpanded = expandedTopicId === topic.id;
          return (
            <div
              key={topic.id}
              id={`climate-card-${topic.id}`}
              className={`bg-white dark:bg-neutral-900 rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs ${
                isExpanded
                  ? 'border-emerald-500/50 dark:border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Card Header (Clickable Toggle) */}
              <button
                onClick={() => toggleExpand(topic.id)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
                    {getTopicIcon(topic.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono">
                        {topic.sdgTag}
                      </span>
                      <span className="text-xs text-neutral-400">•</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{topic.subtitle}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                      {topic.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline-block text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {isExpanded ? 'Collapse' : 'Explore'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Card Expanded Content */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 animate-fade-in">
                  <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
                    {topic.overview}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="md:col-span-2 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Critical Mechanisms &amp; Insights
                      </h4>
                      {topic.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                          <Leaf className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                          Key Statistic
                        </span>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                          {topic.impactStat}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <strong>Action:</strong> {topic.actionableStep}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Individual Action Pledge */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 gap-2">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Your Clean Air Action Pledge
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Select the sustainable micro-habits you pledge to practice this month to support cleaner city skies.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">Actions Committed</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
              {totalPledged} / {pledgeList.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pledgeList.map((item) => {
            const isPledged = !!pledgedActions[item.id];
            return (
              <button
                key={item.id}
                onClick={() => togglePledge(item.id)}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  isPledged
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                    : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                    isPledged
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  {isPledged && <CheckCircle className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
