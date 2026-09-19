/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CITIES_DATA } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AQIDashboard } from './components/AQIDashboard';
import { AQIAlertBanner } from './components/AQIAlertBanner';
import { SmartAQIAnalysis } from './components/SmartAQIAnalysis';
import { ActivityCheck } from './components/ActivityCheck';
import { TrendChart } from './components/TrendChart';
import { AITrendSummary } from './components/AITrendSummary';
import { SchoolSafetyMode } from './components/SchoolSafetyMode';
import { ClimateCards } from './components/ClimateCards';
import { Chatbot } from './components/Chatbot';
import { AQIGuide } from './components/AQIGuide';
import { SafetyTips } from './components/SafetyTips';
import { Footer } from './components/Footer';
import { alertSound } from './utils/alertSound';

export default function App() {
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('airaware-theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => alertSound.isAudioMuted());
  const [prefilledAIQuestion, setPrefilledAIQuestion] = useState<string>('');

  // Sync dark class to root document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('airaware-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('airaware-theme', 'light');
    }
  }, [isDarkMode]);

  const currentCity = CITIES_DATA[selectedCityId] || CITIES_DATA.delhi;

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleAudioMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    alertSound.setAudioMuted(nextMuted);
  };

  const handleSelectCity = (cityId: string) => {
    if (CITIES_DATA[cityId]) {
      setSelectedCityId(cityId);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAskAIQuestion = (questionText: string) => {
    setPrefilledAIQuestion(questionText);
    scrollToSection('ai-assistant');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Navigation Bar */}
      <Navbar
        currentCity={currentCity}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onSelectNavSection={scrollToSection}
      />

      <main id="main-content">
        {/* Landing Hero Section */}
        <Hero
          currentCity={currentCity}
          onCheckAirQuality={() => scrollToSection('dashboard')}
          onAskAI={() => scrollToSection('ai-assistant')}
        />

        {/* =========================================================================
            Dashboard Core Sequence (per Requirement 8):
            1. Current AQI
            2. AQI Alert
            3. AI Air Quality Analysis
            4. Activity Check
            5. 7-Day AQI Trend
            6. AI Trend Summary
            7. School Safety Mode
            8. Climate Awareness
        ========================================================================= */}

        {/* 1. Current AQI */}
        <AQIDashboard
          currentCity={currentCity}
          onSelectCity={handleSelectCity}
          onAskAIQuestion={handleAskAIQuestion}
        />

        {/* 2. AQI Alert */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-4">
          <AQIAlertBanner
            currentCity={currentCity}
            isAudioMuted={isAudioMuted}
            onToggleAudioMute={handleToggleAudioMute}
          />
        </div>

        {/* 3. AI Air Quality Analysis */}
        <SmartAQIAnalysis currentCity={currentCity} />

        {/* 4. Activity Check */}
        <ActivityCheck
          currentCity={currentCity}
          onAskAIQuestion={handleAskAIQuestion}
        />

        {/* 5. 7-Day AQI Trend */}
        <TrendChart
          currentCity={currentCity}
          onSelectCity={handleSelectCity}
        />

        {/* 6. AI Trend Summary */}
        <AITrendSummary currentCity={currentCity} />

        {/* 7. School Safety Mode */}
        <SchoolSafetyMode currentCity={currentCity} />

        {/* 8. Climate Awareness (SDG 11 & SDG 13) */}
        <ClimateCards />

        {/* =========================================================================
            Preserved Platform Features (Full Ecosystem):
            - AirAware AI Chatbot
            - Interactive AQI Guide
            - Safety Tips
        ========================================================================= */}

        {/* AirAware AI Chatbot */}
        <Chatbot
          currentCity={currentCity}
          prefilledQuestion={prefilledAIQuestion}
          onClearPrefilledQuestion={() => setPrefilledAIQuestion('')}
        />

        {/* Interactive AQI Guide */}
        <AQIGuide />

        {/* Safety Tips */}
        <SafetyTips currentCity={currentCity} />
      </main>

      {/* Footer */}
      <Footer
        onSelectCity={handleSelectCity}
        onScrollToTop={scrollToTop}
        onSelectNavSection={scrollToSection}
      />
    </div>
  );
}
