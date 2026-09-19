import React, { useState, useEffect } from 'react';
import { CityAirData } from '../types';
import { getAQICategory } from '../data/aqiGuideData';
import {
  Wind,
  Moon,
  Sun,
  Menu,
  X,
  Sparkles,
  Activity,
  BookOpen,
  BarChart3,
  Globe,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

interface NavbarProps {
  currentCity: CityAirData;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectNavSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  isDarkMode,
  onToggleDarkMode,
  onSelectNavSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Wind },
    { id: 'dashboard', label: 'AQI Dashboard', icon: Activity },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Sparkles },
    { id: 'activity-check', label: 'Activity Check', icon: Activity },
    { id: 'trends', label: 'Trends', icon: BarChart3 },
    { id: 'school-safety', label: 'School Safety', icon: ShieldCheck },
    { id: 'ai-assistant', label: 'AI Chat', icon: Sparkles },
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'climate', label: 'Climate', icon: Globe },
    { id: 'safety', label: 'Tips', icon: ShieldCheck },
  ];

  const handleNavClick = (id: string) => {
    onSelectNavSection(id);
    setMobileMenuOpen(false);
  };

  const category = getAQICategory(currentCity.currentAQI);

  return (
    <header
      id="main-navbar-header"
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-xs border-b border-neutral-200 dark:border-neutral-800'
          : 'bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-neutral-900 dark:text-white font-sans">
                Air<span className="text-emerald-600 dark:text-emerald-400">Aware</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-2">
                SDG 11 &amp; 13
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Live City Air Status Pill */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
              style={{
                backgroundColor: category.bgColor,
                borderColor: category.borderColor,
                color: category.color,
              }}
              title="Click to view city dashboard"
            >
              <MapPin className="w-3 h-3" />
              <span>{currentCity.name}:</span>
              <span className="font-bold">{currentCity.currentAQI} AQI</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 pt-2 pb-6 space-y-1.5 shadow-xl animate-fade-in"
        >
          {/* Quick city pill in mobile */}
          <div className="p-3 mb-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Active Monitoring:</span>
            <span className="font-bold" style={{ color: category.color }}>
              {currentCity.name} — {currentCity.currentAQI} ({category.label})
            </span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-emerald-600 transition-colors text-left cursor-pointer"
              >
                <Icon className="w-4 h-4 text-emerald-500" />
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
