import React from 'react';
import { getAQICategory } from '../data/aqiGuideData';

interface AQIGaugeProps {
  aqi: number;
  maxAQI?: number;
  size?: number;
}

export const AQIGauge: React.FC<AQIGaugeProps> = ({
  aqi,
  maxAQI = 500,
  size = 260,
}) => {
  const category = getAQICategory(aqi);

  // Gauge angles (semi-circle with extended arc: -210 deg to 30 deg, total 240 deg)
  const startAngle = 150;
  const totalAngle = 240;
  const radius = 100;
  const strokeWidth = 16;
  const center = size / 2;

  // Normalized value (clamped between 0 and maxAQI)
  const clampedAQI = Math.min(Math.max(aqi, 0), maxAQI);
  const fraction = clampedAQI / maxAQI;
  const currentAngle = startAngle + fraction * totalAngle;

  // Convert polar coordinates to Cartesian
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startAng: number, endAng: number) => {
    const start = polarToCartesian(x, y, r, endAng);
    const end = polarToCartesian(x, y, r, startAng);
    const largeArcFlag = endAng - startAng <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Background full arc
  const bgArcPath = describeArc(center, center + 10, radius, startAngle, startAngle + totalAngle);
  // Active progress arc
  const activeArcPath = describeArc(center, center + 10, radius, startAngle, currentAngle);

  // Needle coordinates
  const needleAngle = startAngle + fraction * totalAngle;
  const needleLength = radius - 18;
  const needlePoint = polarToCartesian(center, center + 10, needleLength, needleAngle);

  return (
    <div id="aqi-gauge-container" className="flex flex-col items-center justify-center relative select-none">
      <svg
        id="aqi-gauge-svg"
        width={size}
        height={size * 0.85}
        viewBox={`0 0 ${size} ${size * 0.85}`}
        className="overflow-visible"
        aria-label={`AQI Gauge showing ${aqi} - ${category.label}`}
      >
        <defs>
          <linearGradient id="aqiGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="20%" stopColor="#EAB308" />
            <stop offset="40%" stopColor="#F97316" />
            <stop offset="65%" stopColor="#EF4444" />
            <stop offset="85%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={category.color} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Background Track */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="currentColor"
          className="text-neutral-200 dark:text-neutral-800"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active Arc */}
        <path
          d={activeArcPath}
          fill="none"
          stroke={category.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter="url(#glowFilter)"
          className="transition-all duration-700 ease-out"
        />

        {/* Scale Tick Markers */}
        {[0, 50, 100, 150, 200, 300, 500].map((val) => {
          const valFraction = val / maxAQI;
          const valAngle = startAngle + valFraction * totalAngle;
          const tickInner = polarToCartesian(center, center + 10, radius - 14, valAngle);
          const tickOuter = polarToCartesian(center, center + 10, radius - 22, valAngle);
          return (
            <line
              key={val}
              x1={tickInner.x}
              y1={tickInner.y}
              x2={tickOuter.x}
              y2={tickOuter.y}
              stroke="currentColor"
              className="text-neutral-400 dark:text-neutral-600"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Needle */}
        <line
          x1={center}
          y1={center + 10}
          x2={needlePoint.x}
          y2={needlePoint.y}
          stroke={category.color}
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Center Pivot Circle */}
        <circle
          cx={center}
          cy={center + 10}
          r="8"
          fill={category.color}
          className="transition-colors duration-500"
        />
        <circle
          cx={center}
          cy={center + 10}
          r="3"
          fill="white"
        />
      </svg>

      {/* Numerical AQI Value & Status display */}
      <div className="absolute top-[52%] flex flex-col items-center text-center pointer-events-none">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Air Quality Index
        </span>
        <span
          id="aqi-current-value-display"
          className="text-5xl font-extrabold tracking-tight font-sans transition-colors duration-500"
          style={{ color: category.color }}
        >
          {aqi}
        </span>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Scale: 0 - 500
        </span>
      </div>

      {/* Category Pill Tag */}
      <div className="mt-2 flex items-center gap-2">
        <span
          id="aqi-category-pill"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${category.badgeClass}`}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: category.color }}
          />
          {category.label}
        </span>
      </div>
    </div>
  );
};
