/**
 * Web Audio API synthesizer for the AirAware AQI Warning Alert System.
 * Generates alert tones entirely client-side without external audio files.
 * Handles browser autoplay restrictions, single-play triggers, and instant stopping.
 */

class AlertSoundManager {
  private audioCtx: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGainNodes: GainNode[] = [];
  private isMuted: boolean = false;
  private currentTimeout: number | null = null;

  constructor() {
    // Check localStorage for muted preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('airaware-audio-muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  public setAudioMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('airaware-audio-muted', String(muted));
    }
    if (muted) {
      this.stopAlert();
    }
  }

  public isAudioContextSuspended(): boolean {
    return !!this.audioCtx && this.audioCtx.state === 'suspended';
  }

  public async resumeAudioContext(): Promise<boolean> {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
        return true;
      } catch (err) {
        console.warn('Unable to resume Web Audio context:', err);
        return false;
      }
    }
    return true;
  }

  /**
   * Plays a warning chime/beeps according to severity:
   * 'warning' (AQI 151-200) -> 2 soft pulses
   * 'high' (AQI 201-300) -> 3 distinct warning pulses
   * 'critical' (AQI 301+) -> 3 urgent two-tone pulses
   *
   * Automatically terminates after ~1.4 - 1.8 seconds.
   * Can be aborted anytime with stopAlert().
   */
  public playAlert(severity: 'caution' | 'warning' | 'high' | 'critical' = 'warning'): boolean {
    if (this.isMuted) return false;

    const ctx = this.getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      // Browser autoplay restriction prevents playing until user interacts
      return false;
    }

    // Stop any existing playing sound
    this.stopAlert();

    const now = ctx.currentTime;
    const pulseCount = severity === 'critical' ? 3 : severity === 'high' ? 3 : severity === 'warning' ? 2 : 1;
    const baseFreq = severity === 'critical' ? 780 : severity === 'high' ? 660 : 540;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, now);
    masterGain.connect(ctx.destination);
    this.activeGainNodes.push(masterGain);

    for (let i = 0; i < pulseCount; i++) {
      const startTime = now + i * 0.42;
      const duration = 0.28;

      const osc = ctx.createOscillator();
      const pulseGain = ctx.createGain();

      osc.type = severity === 'critical' ? 'sawtooth' : 'sine';
      
      // Dual-tone or modulated frequency
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, startTime + duration * 0.7);

      // Envelope: attack, hold, quick decay
      pulseGain.gain.setValueAtTime(0.001, startTime);
      pulseGain.gain.linearRampToValueAtTime(0.2, startTime + 0.04);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(pulseGain);
      pulseGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);

      this.activeOscillators.push(osc);
      this.activeGainNodes.push(pulseGain);
    }

    // Cleanup after sound finishes
    const totalDurationMs = (pulseCount * 0.42 + 0.2) * 1000;
    this.currentTimeout = window.setTimeout(() => {
      this.cleanup();
    }, totalDurationMs);

    return true;
  }

  /**
   * Immediately stops all active sound oscillators and releases nodes
   */
  public stopAlert(): void {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    });
    this.activeOscillators = [];

    this.activeGainNodes.forEach((gain) => {
      try {
        gain.disconnect();
      } catch {
        // Already disconnected
      }
    });
    this.activeGainNodes = [];
  }

  private cleanup(): void {
    this.activeOscillators = [];
    this.activeGainNodes = [];
    this.currentTimeout = null;
  }
}

export const alertSound = new AlertSoundManager();
