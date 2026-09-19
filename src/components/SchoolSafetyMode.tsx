import React, { useState, useEffect } from 'react';
import { CityAirData, SchoolSafetyData } from '../types';
import { getAQICategory } from '../data/aqiGuideData';
import {
  GraduationCap,
  Sparkles,
  Sun,
  Trophy,
  Smile,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Bell,
  HeartHandshake,
} from 'lucide-react';

interface SchoolSafetyModeProps {
  currentCity: CityAirData;
}

export const SchoolSafetyMode: React.FC<SchoolSafetyModeProps> = ({ currentCity }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [data, setData] = useState<SchoolSafetyData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const category = getAQICategory(currentCity.currentAQI);

  useEffect(() => {
    let isMounted = true;

    async function fetchSchoolSafety() {
      if (!isEnabled) return;
      setLoading(true);

      try {
        const response = await fetch('/api/school-safety', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityName: currentCity.name,
            aqi: currentCity.currentAQI,
            category: category.label,
          }),
        });

        if (!response.ok) throw new Error('Network error');
        const json = await response.json();
        if (isMounted) {
          setData(json);
        }
      } catch (err) {
        if (isMounted) {
          // Local fallback
          const aqi = currentCity.currentAQI;
          let outdoorRecess = '';
          let sportsRecommendation = '';
          let studentExplanation = '';
          let teacherParentMessage = '';

          if (aqi <= 50) {
            outdoorRecess = `Outdoor recess is fully approved in ${currentCity.name}. Children can play freely across school playgrounds.`;
            sportsRecommendation = `All physical education classes and outdoor sports tournaments can proceed at full intensity.`;
            studentExplanation = `The air today is sparkling clean! Take big deep breaths and have fun running outside with your friends.`;
            teacherParentMessage = `Ideal conditions for outdoor education and sports. Encourage plenty of water intake.`;
          } else if (aqi <= 100) {
            outdoorRecess = `Outdoor recess is permitted. Teachers should monitor students with asthma or sensitive airways.`;
            sportsRecommendation = `PE classes can run normally outdoors with regular water breaks.`;
            studentExplanation = `The air is okay today, but drink water when playing and tell your teacher if you cough or feel tired.`;
            teacherParentMessage = `Maintain standard supervision. Ensure students who need inhalers have them readily available.`;
          } else if (aqi <= 150) {
            outdoorRecess = `Limit outdoor recess to 15-20 minutes of light play. Shift prolonged activities into gymnasiums or classrooms.`;
            sportsRecommendation = `Postpone heavy cardiovascular athletic trials. Substitute with indoor skill drills or gentle stretching.`;
            studentExplanation = `There is a bit of dust and smoke in the sky today. It is best to enjoy fun indoor games so our lungs stay healthy!`;
            teacherParentMessage = `Advise sensitive students to wear N95 masks when walking between campus buildings. Keep classroom windows closed.`;
          } else if (aqi <= 200) {
            outdoorRecess = `Suspend outdoor recess. All student break periods must take place indoors in filtered classrooms or auditoriums.`;
            sportsRecommendation = `Cancel outdoor competitive sports practice. Move PE to indoor wellness routines or educational health games.`;
            studentExplanation = `The air outside is dirty today with invisible tiny dust specks. Recess is staying inside today to keep our breathing easy!`;
            teacherParentMessage = `Run school air purifiers continuously. Advise parents to provide certified particulate masks for school bus commutes.`;
          } else {
            outdoorRecess = `Strictly cancel all outdoor assemblies and outdoor recess. Keep all school doors and windows shut.`;
            sportsRecommendation = `Prohibit all outdoor athletics. Only indoor sedentary or light movement activities are permitted.`;
            studentExplanation = `Today is a heavy smog day. The air is not safe to breathe outdoors, so we are staying inside in clean filtered air!`;
            teacherParentMessage = `Urgent advisory: Consider hybrid or online schooling if heavy smog persists. Review emergency medical inhaler protocols.`;
          }

          setData({
            outdoorRecess,
            sportsRecommendation,
            studentExplanation,
            teacherParentMessage,
            source: 'airaware-school-engine',
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSchoolSafety();

    return () => {
      isMounted = false;
    };
  }, [isEnabled, currentCity.id, currentCity.currentAQI]);

  return (
    <section id="school-safety" className="scroll-mt-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Header with Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-sans tracking-tight">
                  School Safety Mode
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Students • Teachers • Parents
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Simplified guidance tailored for school administrations, outdoor recess, and physical education in {currentCity.name}.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
              {isEnabled ? 'Safety Mode Active' : 'Safety Mode Off'}
            </span>
            <button
              id="toggle-school-safety"
              role="switch"
              aria-checked={isEnabled}
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors cursor-pointer focus:outline-hidden ${
                isEnabled ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isEnabled ? (
          <div className="py-10 text-center space-y-3">
            <GraduationCap className="w-12 h-12 text-neutral-400 mx-auto" />
            <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              School Safety Mode is currently disabled
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Enable School Safety Mode to unlock child-safe recess thresholds, PE activity modifications, student explanations, and teacher advisories.
            </p>
            <button
              id="btn-enable-school-safety-mode"
              onClick={() => setIsEnabled(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              Turn On School Safety Mode
            </button>
          </div>
        ) : loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              Formulating school safety directives for {currentCity.name}...
            </p>
          </div>
        ) : data ? (
          <div className="pt-6 space-y-6">
            {/* Current City & AQI Context Strip */}
            <div className="flex flex-wrap items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Active City: <strong>{currentCity.name}</strong> • Current AQI: <strong>{currentCity.currentAQI}</strong> ({category.label})
                </span>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">
                Children inhale 50% more air per pound than adults; thresholds are calibrated accordingly.
              </span>
            </div>

            {/* 4 Cards Required:
                1. Outdoor Activity (recess, breaks)
                2. Sports Activity (PE, training)
                3. Simple AQI explanation for students
                4. Awareness message for teachers and parents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Outdoor Activity (Recess) */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                    <Sun className="w-4 h-4" />
                  </div>
                  <h4>Outdoor Activity &amp; Recess</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed flex-1">
                  {data.outdoorRecess}
                </p>
              </div>

              {/* 2. Sports Activity */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h4>Sports &amp; Physical Education</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed flex-1">
                  {data.sportsRecommendation}
                </p>
              </div>

              {/* 3. Simple AQI Explanation for Students */}
              <div className="p-5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 flex flex-col">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-sm mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Smile className="w-4 h-4" />
                  </div>
                  <h4>What Today&apos;s Air Means (For Students)</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed flex-1 italic">
                  &ldquo;{data.studentExplanation}&rdquo;
                </p>
              </div>

              {/* 4. Awareness Message for Teachers and Parents */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4>Action Checklist for Teachers &amp; Parents</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed flex-1">
                  {data.teacherParentMessage}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
