import React, { useEffect, useState, useRef } from 'react';
import { CityAirData, AlertSeverity } from '../types';
import { alertSound } from '../utils/alertSound';
import {
  AlertTriangle,
  ShieldAlert,
  Volume2,
  VolumeX,
  XCircle,
  CheckCircle2,
  BellRing,
  AlertOctagon,
  Info,
  RotateCcw,
} from 'lucide-react';

interface AQIAlertBannerProps {
  currentCity: CityAirData;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
}

export const AQIAlertBanner: React.FC<AQIAlertBannerProps> = ({
  currentCity,
  isAudioMuted,
  onToggleAudioMute,
}) => {
  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);
  const [needsUserAudioGesture, setNeedsUserAudioGesture] = useState<boolean>(false);
  const previousCityIdRef = useRef<string>('');

  const aqi = currentCity.currentAQI;

  // Determine Severity based on strict logical categories:
  // Good (0-50) -> No alert ('none')
  // Moderate (51-100) -> Normal information ('normal')
  // Unhealthy for Sensitive Groups (101-150) -> Caution ('caution')
  // Unhealthy (151-200) -> Warning alert ('warning')
  // Very Unhealthy (201-300) -> High alert ('high')
  // Hazardous (301+) -> Critical alert ('critical')
  let severity: AlertSeverity = 'none';
  let severityLabel = 'No Alert';
  let isDangerous = false;

  if (aqi <= 50) {
    severity = 'none';
    severityLabel = 'Good (No Alert)';
  } else if (aqi <= 100) {
    severity = 'normal';
    severityLabel = 'Normal Information';
  } else if (aqi <= 150) {
    severity = 'caution';
    severityLabel = 'Caution (Sensitive Groups)';
  } else if (aqi <= 200) {
    severity = 'warning';
    severityLabel = 'Warning Alert (Unhealthy)';
    isDangerous = true;
  } else if (aqi <= 300) {
    severity = 'high';
    severityLabel = 'High Alert (Very Unhealthy)';
    isDangerous = true;
  } else {
    severity = 'critical';
    severityLabel = 'Critical Alert (Hazardous)';
    isDangerous = true;
  }

  // Trigger sound once when a dangerous city is selected or when city changes
  useEffect(() => {
    if (previousCityIdRef.current !== currentCity.id) {
      previousCityIdRef.current = currentCity.id;
      setIsAlertDismissed(false);

      if (isDangerous && !isAudioMuted) {
        // Attempt single-shot alert playback
        const audioResumed = !alertSound.isAudioContextSuspended();
        if (audioResumed) {
          const soundType = severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'warning';
          const success = alertSound.playAlert(soundType);
          if (!success) {
            setNeedsUserAudioGesture(true);
          } else {
            setNeedsUserAudioGesture(false);
          }
        } else {
          setNeedsUserAudioGesture(true);
        }
      } else {
        alertSound.stopAlert();
        setNeedsUserAudioGesture(false);
      }
    }

    return () => {
      // Cleanup on unmount
      alertSound.stopAlert();
    };
  }, [currentCity.id, isDangerous, isAudioMuted, severity]);

  const handleStopAlert = () => {
    alertSound.stopAlert();
    setIsAlertDismissed(true);
    setNeedsUserAudioGesture(false);
  };

  const handleEnableAudio = async () => {
    await alertSound.resumeAudioContext();
    setNeedsUserAudioGesture(false);
    if (isDangerous && !isAudioMuted) {
      const soundType = severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'warning';
      alertSound.playAlert(soundType);
    }
  };

  const handleReopenAlert = () => {
    setIsAlertDismissed(false);
  };

  // Severity visual styles
  const getSeverityStyles = () => {
    switch (severity) {
      case 'critical':
        return {
          bannerBg: 'bg-rose-950/40 dark:bg-rose-950/60',
          border: 'border-rose-600',
          badgeBg: 'bg-rose-600 text-white',
          textColor: 'text-rose-600 dark:text-rose-400',
          pulseColor: 'bg-rose-500',
          headline: 'CRITICAL AIR QUALITY ALERT',
          severityName: 'hazardous and critical',
        };
      case 'high':
        return {
          bannerBg: 'bg-red-950/30 dark:bg-red-950/50',
          border: 'border-red-500',
          badgeBg: 'bg-red-600 text-white',
          textColor: 'text-red-600 dark:text-red-400',
          pulseColor: 'bg-red-500',
          headline: 'HIGH AIR QUALITY ALERT',
          severityName: 'very unhealthy',
        };
      case 'warning':
        return {
          bannerBg: 'bg-orange-500/10 dark:bg-orange-950/40',
          border: 'border-orange-500',
          badgeBg: 'bg-orange-500 text-white',
          textColor: 'text-orange-600 dark:text-orange-400',
          pulseColor: 'bg-orange-500',
          headline: 'AIR QUALITY ALERT',
          severityName: 'unhealthy',
        };
      case 'caution':
        return {
          bannerBg: 'bg-amber-500/10 dark:bg-amber-950/30',
          border: 'border-amber-400',
          badgeBg: 'bg-amber-500 text-white',
          textColor: 'text-amber-600 dark:text-amber-400',
          pulseColor: 'bg-amber-400',
          headline: 'AIR QUALITY CAUTION',
          severityName: 'unhealthy for sensitive groups',
        };
      case 'normal':
        return {
          bannerBg: 'bg-blue-500/5 dark:bg-blue-950/20',
          border: 'border-blue-300 dark:border-blue-800',
          badgeBg: 'bg-blue-600 text-white',
          textColor: 'text-blue-600 dark:text-blue-400',
          pulseColor: 'bg-blue-400',
          headline: 'NORMAL AIR QUALITY CONDITIONS',
          severityName: 'moderate',
        };
      case 'none':
      default:
        return {
          bannerBg: 'bg-emerald-500/5 dark:bg-emerald-950/20',
          border: 'border-emerald-300 dark:border-emerald-800',
          badgeBg: 'bg-emerald-600 text-white',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          pulseColor: 'bg-emerald-400',
          headline: 'CLEAN AIR CONDITIONS',
          severityName: 'good and clean',
        };
    }
  };

  const style = getSeverityStyles();

  // If dismissed or non-dangerous, we show a clean compact status bar so AQI info remains 100% visible
  if (isAlertDismissed && isDangerous) {
    return (
      <div
        id="aqi-alert-minimized"
        className="w-full mb-8 rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Alert Acknowledged
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                {currentCity.name}: {currentCity.currentAQI} AQI ({currentCity.category})
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Warning audio stopped. High particulate precautions still apply.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mute toggle */}
          <button
            id="btn-alert-mute-toggle-min"
            onClick={onToggleAudioMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
            title={isAudioMuted ? 'Unmute alert audio' : 'Mute alert audio'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{isAudioMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          <button
            id="btn-reopen-alert"
            onClick={handleReopenAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Expand Alert
          </button>
        </div>
      </div>
    );
  }

  // Non-dangerous information strip (Good / Moderate / Caution)
  if (!isDangerous) {
    return (
      <div
        id="aqi-status-strip"
        className={`w-full mb-8 rounded-2xl border p-4 sm:p-5 shadow-sm transition-all ${style.bannerBg} ${style.border}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 shadow-xs shrink-0">
              {severity === 'caution' ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${style.textColor}`}>
                  {style.headline}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/80 dark:bg-neutral-900/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                  {currentCity.name}: {currentCity.currentAQI} AQI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                Air quality in <strong>{currentCity.name}</strong> is currently <strong>{style.severityName}</strong>.{' '}
                {severity === 'caution'
                  ? 'Sensitive individuals should limit prolonged outdoor exertion.'
                  : 'No active health hazard alerts for the general population.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <button
              id="btn-alert-mute-strip"
              onClick={onToggleAudioMute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{isAudioMuted ? 'Alert Sound: Muted' : 'Alert Sound: Ready'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Large Real-time style AQI Alert Banner/Modal for Unhealthy, Very Unhealthy, or Hazardous
  return (
    <div
      id="aqi-prominent-alert-banner"
      className={`w-full mb-8 rounded-3xl border-2 p-6 sm:p-7 shadow-xl relative overflow-hidden transition-all animate-fade-in ${style.bannerBg} ${style.border}`}
      role="alert"
    >
      {/* Visual Pulsing Ambient Glow */}
      <div
        className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none ${style.pulseColor}`}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left info block with exact required copy */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-md flex items-center justify-center">
              <AlertOctagon className={`w-8 h-8 ${style.textColor} animate-pulse`} />
            </div>
            <span
              className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${style.pulseColor} animate-ping`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-base sm:text-lg font-black tracking-tight font-sans text-neutral-900 dark:text-white flex items-center gap-2">
                <span>⚠️</span> {style.headline}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${style.badgeBg}`}>
                {severityLabel}
              </span>
            </div>

            {/* Exact required sentences:
                "Air quality in [City] is currently [severity text]."
                "Current AQI: [AQI]" */}
            <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              Air quality in {currentCity.name} is currently {style.severityName}.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-neutral-900 dark:text-neutral-100 font-mono">
                Current AQI: <span className={style.textColor}>{currentCity.currentAQI}</span>
              </span>
              <span className="text-neutral-400 dark:text-neutral-600">•</span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                PM2.5: {currentCity.pm25} µg/m³
              </span>
              <span className="text-neutral-400 dark:text-neutral-600">•</span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Dominant: {currentCity.dominantPollutant}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl pt-1">
              {currentCity.healthRecommendation}
            </p>
          </div>
        </div>

        {/* Right controls: STOP ALERT button & Audio Controls */}
        <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-3 shrink-0">
          {/* Autoplay blocked notification button */}
          {needsUserAudioGesture && (
            <button
              id="btn-enable-alert-sound"
              onClick={handleEnableAudio}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <BellRing className="w-4 h-4 animate-bounce" />
              Enable Alert Sound
            </button>
          )}

          {/* STOP ALERT Button: Clearly visible, immediately stops sound and minimizes banner */}
          <button
            id="btn-stop-alert"
            onClick={handleStopAlert}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            title="Stop warning alert sound and acknowledge alert"
          >
            <XCircle className="w-5 h-5 text-rose-500" />
            <span>STOP ALERT</span>
          </button>

          {/* Small mute/unmute control in the dashboard */}
          <button
            id="btn-toggle-audio-mute"
            onClick={onToggleAudioMute}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {isAudioMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <span>Audio Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Audio Alert Enabled</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
