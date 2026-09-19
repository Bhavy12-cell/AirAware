import React from 'react';
import { Wind, Heart, Globe, ShieldAlert, ArrowUp } from 'lucide-react';
import { CITIES_LIST } from '../data/mockData';

interface FooterProps {
  onSelectCity: (cityId: string) => void;
  onScrollToTop: () => void;
  onSelectNavSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCity,
  onScrollToTop,
  onSelectNavSection,
}) => {
  return (
    <footer id="main-footer" className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          {/* Column 1 & 2: Brand & Exact Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Wind className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight font-sans">
                Air<span className="text-emerald-400">Aware</span>
              </span>
            </div>

            {/* Exact Required Footer Slogan */}
            <p className="text-sm font-semibold text-emerald-400">
              AirAware – Promoting cleaner and healthier communities through technology.
            </p>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
              A modern environmental intelligence platform built on United Nations SDG 11: Sustainable Cities and Communities and SDG 13: Climate Action. Designed to translate raw particulate telemetry into simple, life-saving awareness.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                UN SDG 11
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">
                UN SDG 13
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                WHO AQ Guidelines
              </span>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Explore Sections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectNavSection('home')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Home &amp; Hero
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectNavSection('dashboard')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  AQI Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectNavSection('ai-assistant')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  AirAware AI Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectNavSection('guide')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  AQI Scale Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectNavSection('trends')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  7-Day Trends
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectNavSection('climate')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Climate Awareness
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectNavSection('safety')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Safety Tips
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Monitored Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Monitored Cities
            </h4>
            <ul className="space-y-2 text-xs">
              {CITIES_LIST.map((city) => (
                <li key={city.id}>
                  <button
                    onClick={() => {
                      onSelectCity(city.id);
                      onSelectNavSection('dashboard');
                    }}
                    className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center justify-between w-full"
                  >
                    <span>{city.name}</span>
                    <span className="font-mono text-neutral-400">{city.currentAQI} AQI</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Educational & Health Disclaimer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Public Health Notice
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              AirAware is an educational awareness prototype. Air quality recommendations are based on public health epidemiological models and do not constitute clinical diagnosis or individualized medical advice.
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <button
                onClick={onScrollToTop}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Back to Top
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()} AirAware Initiative. Aligned with SDG 11 &amp; SDG 13.
          </div>
          <div className="flex items-center gap-1 text-neutral-400">
            <span>Built for community air quality resilience</span>
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
