import React, { useState } from 'react';
import { CityAirData } from '../types';
import { CITIES_LIST, CITIES_DATA } from '../data/mockData';
import { getAQICategory } from '../data/aqiGuideData';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Award,
  AlertOctagon,
  BarChart3,
  MapPin,
  Info,
} from 'lucide-react';

interface TrendChartProps {
  currentCity: CityAirData;
  onSelectCity: (cityId: string) => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  currentCity,
  onSelectCity,
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const trendData = currentCity.weeklyTrend;

  // Calculate statistics
  const aqiValues = trendData.map((d) => d.aqi);
  const sum = aqiValues.reduce((acc, curr) => acc + curr, 0);
  const avgAQI = Math.round(sum / aqiValues.length);

  // Best day (lowest AQI is cleanest)
  const bestDay = [...trendData].sort((a, b) => a.aqi - b.aqi)[0];
  // Worst day (highest AQI is most polluted)
  const worstDay = [...trendData].sort((a, b) => b.aqi - a.aqi)[0];

  // Dynamic Trend Indicator: Compare first 3 days average vs last 3 days average
  const earlyAvg = (trendData[0].aqi + trendData[1].aqi) / 2;
  const recentAvg = (trendData[trendData.length - 1].aqi + trendData[trendData.length - 2].aqi) / 2;
  const diff = recentAvg - earlyAvg;

  let trendStatus = currentCity.trendDirection;
  if (diff < -15) trendStatus = 'Improving';
  else if (diff > 15) trendStatus = 'Worsening';
  else trendStatus = 'Stable';

  // SVG Chart Dimensions
  const width = 800;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Determine scale maximum (at least 350 for room, or higher if hazardous)
  const maxDataVal = Math.max(...aqiValues, 250);
  const yMax = Math.ceil(maxDataVal / 50) * 50;

  // Coordinate mapping functions
  const getX = (index: number) => {
    if (trendData.length <= 1) return paddingLeft;
    return paddingLeft + (index / (trendData.length - 1)) * chartWidth;
  };

  const getY = (aqi: number) => {
    const fraction = aqi / yMax;
    return height - paddingBottom - fraction * chartHeight;
  };

  // Build SVG Path
  const points = trendData.map((d, i) => ({
    x: getX(i),
    y: getY(d.aqi),
    data: d,
  }));

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Area path closing down to bottom
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  const hoveredData = hoveredPointIndex !== null ? trendData[hoveredPointIndex] : null;
  const hoveredCategory = hoveredData ? getAQICategory(hoveredData.aqi) : null;

  return (
    <section id="trends" className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            7-Day Historical Analytics
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
            AQI Trend Analysis
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            Track daily pollution shifts, compare air quality trends, and identify clean-air windows across Indian metropolitan centers.
          </p>
        </div>

        {/* City Switch Buttons directly on Trend section */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CITIES_LIST.map((c) => (
            <button
              key={c.id}
              id={`trend-city-${c.id}`}
              onClick={() => onSelectCity(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 border ${
                c.id === currentCity.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Trend Indicator */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              7-Day Trajectory
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
              {trendStatus}
            </span>
            <span className="text-xs text-neutral-500 block mt-0.5">Based on slope</span>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
              trendStatus === 'Improving'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : trendStatus === 'Worsening'
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}
          >
            {trendStatus === 'Improving' ? (
              <TrendingDown className="w-5 h-5 text-emerald-500" />
            ) : trendStatus === 'Worsening' ? (
              <TrendingUp className="w-5 h-5 text-rose-500" />
            ) : (
              <Minus className="w-5 h-5 text-amber-500" />
            )}
          </div>
        </div>

        {/* 7-Day Average */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              7-Day Average AQI
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-sans">
              {avgAQI}
            </span>
            <span className="text-xs text-neutral-500 block mt-0.5">
              Category: {getAQICategory(avgAQI).label}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Best Day */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              Best Day (Cleanest)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
                {bestDay.aqi}
              </span>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                {bestDay.day} ({bestDay.date})
              </span>
            </div>
            <span className="text-xs text-neutral-500 block mt-0.5">
              PM2.5: {bestDay.pm25} µg/m³
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* Worst Day */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              Worst Day (Peak Smog)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-sans">
                {worstDay.aqi}
              </span>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                {worstDay.day} ({worstDay.date})
              </span>
            </div>
            <span className="text-xs text-neutral-500 block mt-0.5">
              PM2.5: {worstDay.pm25} µg/m³
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Main Responsive SVG Line Chart */}
      <div
        id="trend-chart-container"
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-md relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              {currentCity.name} — Past 7 Days Air Quality Progression
            </h3>
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Hover over points to inspect daily metrics
          </span>
        </div>

        {/* Chart SVG Canvas */}
        <div className="w-full overflow-x-auto">
          <svg
            id="weekly-trend-svg"
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[600px] select-none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>

              <filter id="pointShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Horizontal Grid & Threshold Lines */}
            {[50, 100, 200, 300].map((threshold) => {
              if (threshold > yMax) return null;
              const y = getY(threshold);
              return (
                <g key={threshold}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-neutral-200 dark:text-neutral-800"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-neutral-400 dark:fill-neutral-500"
                  >
                    {threshold}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Main Trend Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((p, i) => {
              const cat = getAQICategory(p.data.aqi);
              const isHovered = hoveredPointIndex === i;
              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoveredPointIndex(i)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible larger hover hit area */}
                  <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

                  {/* Outer glow circle on hover */}
                  {isHovered && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="10"
                      fill={cat.color}
                      opacity="0.25"
                      className="animate-pulse"
                    />
                  )}

                  {/* Visible Point */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? '6' : '4.5'}
                    fill="white"
                    stroke={cat.color}
                    strokeWidth={isHovered ? '3' : '2.5'}
                    filter="url(#pointShadow)"
                    className="transition-all duration-150"
                  />

                  {/* Day Label on X Axis */}
                  <text
                    x={p.x}
                    y={height - paddingBottom + 20}
                    textAnchor="middle"
                    className={`text-xs font-semibold transition-colors ${
                      isHovered
                        ? 'fill-neutral-900 dark:fill-white font-bold'
                        : 'fill-neutral-500 dark:fill-neutral-400'
                    }`}
                  >
                    {p.data.day}
                  </text>

                  {/* Date sub-label */}
                  <text
                    x={p.x}
                    y={height - paddingBottom + 34}
                    textAnchor="middle"
                    className="text-[10px] fill-neutral-400 dark:fill-neutral-500"
                  >
                    {p.data.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Tooltip Bar */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 min-h-[48px] flex items-center justify-between text-xs">
          {hoveredData && hoveredCategory ? (
            <div className="flex flex-wrap items-center gap-3 animate-fade-in">
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {hoveredData.day} ({hoveredData.date}):
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full font-bold text-xs"
                style={{ backgroundColor: hoveredCategory.bgColor, color: hoveredCategory.color }}
              >
                AQI {hoveredData.aqi} — {hoveredCategory.label}
              </span>
              <span className="text-neutral-500">
                PM2.5: <strong className="text-neutral-800 dark:text-neutral-200">{hoveredData.pm25} µg/m³</strong>
              </span>
              <span className="text-neutral-500">
                PM10: <strong className="text-neutral-800 dark:text-neutral-200">{hoveredData.pm10} µg/m³</strong>
              </span>
            </div>
          ) : (
            <div className="text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Hover over any data dot to see specific PM2.5 concentrations and air category.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
