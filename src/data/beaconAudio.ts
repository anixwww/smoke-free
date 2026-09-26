// Web Audio API Synthesizer for Lighthouse (Маяк) Harmonic Physics Simulator
// 432 Hz Pythagorean harmonic scale: pitch inversely proportional to beam length/radius

export interface BeaconNode {
  id: number;
  x: number;
  y: number;
  radius: number;        // Beam length / sweep radius
  beamAngle: number;     // Current angle in radians
  angularSpeed: number;  // Radians per second
  beamWidth: number;     // Beam spread in radians (e.g. 0.15 rad)
  color: string;
  glow: string;
  harmonicFreq: number;  // Calculated frequency based on radius
  lastTriggerAngle: number;
  active: boolean;
}

export interface ResonantBuoy {
  id: number;
  x: number;
  y: number;
  radius: number;
  pitchOffset: number;
  lastHitTime: number;
  color: string;
}

// 432 Hz Harmonic scale pitches (from deep bass 108Hz to crystal bells 864Hz)
const HARMONIC_PITCHES = [
  108.0, // Sub-bass gong (A2)
  144.0, // Deep ocean drone (D3)
  162.0, // Warm resonant cello (E3)
  216.0, // Fundamental singing bowl (A3)
  243.0, // Crystal bowl (B3)
  288.0, // Tibetan chime (D4)
  324.0, // Pure fifth (E4)
  384.0, // Meditation bell (G4)
  432.0, // Golden harmonic center (A4)
  486.0, // High crystal bowl (B4)
  576.0, // Celestial chime (D5)
  648.0, // High resonance (E5)
  864.0  // Starlight chime (A5)
];

/**
 * Maps physical beam radius (40px to 800px) to precise 432Hz harmonic pitch
 * Longer radius = deeper, lower resonant gong
 * Shorter radius = higher, crystalline chime
 */
export function calculateBeaconFrequency(radius: number): number {
  const minR = 60;
  const maxR = 650;
  const clamped = Math.max(minR, Math.min(maxR, radius));
  // Inverse ratio: larger radius => smaller index (lower pitch)
  const ratio = 1 - (clamped - minR) / (maxR - minR);
  const index = Math.min(HARMONIC_PITCHES.length - 1, Math.floor(ratio * HARMONIC_PITCHES.length));
  return HARMONIC_PITCHES[index];
}

class BeaconHarmonicAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private lastTriggerMap: Map<string, number> = new Map();

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        // Master dynamics compressor to keep 50 polyphonic beacons smooth and velvety
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.01, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.3, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.12, this.ctx.currentTime);
    }
  }

  /**
   * Play meditative harmonic bell/gong when beam passes trigger point / buoy
   */
  playBeamSweepSound(freq: number, totalBeaconsCount: number = 1, isDeepGong: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.compressor) return;

      const now = this.ctx.currentTime;
      // Volume scaling according to density of beacons (so 50 beacons don't clip)
      const densityDamp = Math.max(0.15, 1 / Math.sqrt(Math.max(1, totalBeaconsCount)));

      // Warm lowpass filter to ensure zero harsh clicks or sharp noise
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const cutoff = freq < 250 ? 550 : 1200;
      filter.frequency.setValueAtTime(cutoff, now);
      filter.connect(this.compressor);

      // Primary sine oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Velvet smooth attack (50ms) and peaceful resonant decay (1.5s - 3.5s)
      const decayTime = isDeepGong || freq < 220 ? 3.2 : 1.8;
      const peakVol = (isDeepGong ? 0.08 : 0.05) * densityDamp;

      gain.gain.setValueAtTime(0.00001, now);
      gain.gain.linearRampToValueAtTime(peakVol, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + decayTime);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + decayTime + 0.05);

      // Subtle sub-octave overtone for rich singing bowl effect
      if (freq >= 216 && totalBeaconsCount <= 12) {
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq * 0.5, now);

        subGain.gain.setValueAtTime(0.00001, now);
        subGain.gain.linearRampToValueAtTime(peakVol * 0.4, now + 0.06);
        subGain.gain.exponentialRampToValueAtTime(0.00001, now + decayTime * 1.2);

        subOsc.connect(subGain);
        subGain.connect(filter);

        subOsc.start(now);
        subOsc.stop(now + decayTime * 1.25);
      }
    } catch {}
  }

  /**
   * Soothing water droplet note on placing or moving buoy/beacon
   */
  playWaterTouch() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.compressor) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now);
      osc.frequency.exponentialRampToValueAtTime(288, now + 0.15);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }
}

export const beaconAudio = new BeaconHarmonicAudio();
