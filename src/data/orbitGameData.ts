// Web Audio API Synthesizer and Presets for Realistic Celestial Gravity Simulation
// Pure Ethereal 432 Hz Pythagorean / Pentatonic meditation tuning

export interface GravityConfigPreset {
  id: 'single' | 'binary' | 'triple';
  name: string;
  centersCount: number;
  description: string;
  icon: string;
}

export const GRAVITY_CENTER_PRESETS: GravityConfigPreset[] = [
  {
    id: 'single',
    name: '1 Зоря',
    centersCount: 1,
    description: 'Класична гравітація Кеплера. Стабільні еліптичні та колові орбіти.',
    icon: '☀️'
  },
  {
    id: 'binary',
    name: '2 Зорі',
    centersCount: 2,
    description: 'Подвійна зоряна система. Точки Лагранжа, вісімки та гравітаційні маневри.',
    icon: '✨'
  },
  {
    id: 'triple',
    name: '3 Зорі',
    centersCount: 3,
    description: 'Задача трьох тіл: хаотичний, але гармонійний космічний танець.',
    icon: '🌌'
  }
];

// Harmonic 432 Hz pentatonic celestial scale (pure ratios for soothing resonance)
export const CELESTIAL_NOTES = [
  216.0,  // A3 (deep resonant base)
  243.0,  // B3
  288.0,  // D4
  324.0,  // E4
  384.0,  // G4
  432.0,  // A4 (master tuning)
  486.0,  // B4
  576.0,  // D5
  648.0,  // E5
  768.0,  // G5
  864.0   // A5 (crystal overtone)
];

// Harmonic note mappings for each gravity center star
export const STAR_HARMONIC_PALETTES = [
  [216.0, 288.0, 432.0, 576.0, 864.0], // Golden Star: Warm fundamental 432Hz fifths & octaves
  [243.0, 324.0, 486.0, 648.0, 768.0], // Cyan Pulsar: Ethereal bell tones
  [288.0, 384.0, 432.0, 576.0, 768.0]  // Violet Star: Deep mystic singing bowl chords
];

class CelestialAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private lastTriggerTime: number = 0;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public init() {
    this.initCtx();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.12, this.ctx.currentTime);
    }
  }

  /**
   * Serene Tibetan Singing Bowl / Crystal Bell resonance
   * Plays ONLY when a celestial body swings close to a Gravity Center (Periapsis)
   */
  playPeriapsisChime(centerIndex: number = 0, distanceRatio: number = 0.5, speedRatio: number = 1.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      // Prevent audio overloading if too many bodies cross simultaneously
      if (now - this.lastTriggerTime < 0.04) return;
      this.lastTriggerTime = now;

      // Select frequency from star's harmonic palette
      const palette = STAR_HARMONIC_PALETTES[centerIndex % STAR_HARMONIC_PALETTES.length];
      const noteIndex = Math.floor(Math.min(palette.length - 1, (1 - distanceRatio) * palette.length));
      const baseFreq = palette[noteIndex] || 432.0;

      // Dynamic volume scaling based on distance (closer = richer, yet gentle)
      const volume = Math.min(0.09, Math.max(0.02, 0.04 + (1 - distanceRatio) * 0.05));

      // 1. Warm low-pass filter for cozy velvet resonance without digital click
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850 + speedRatio * 200, now);
      filter.Q.setValueAtTime(1.8, now);
      filter.connect(this.masterGain);

      // 2. Fundamental Tone (Sine)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(volume, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.00001, now + 2.8);

      osc1.connect(gain1);
      gain1.connect(filter);
      osc1.start(now);
      osc1.stop(now + 2.85);

      // 3. Ethereal Crystal Overtone (Octave + pure fifth shimmer)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 2.004, now); // subtle micro-detune for warm shimmering beat

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.linearRampToValueAtTime(volume * 0.35, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.00001, now + 1.8);

      osc2.connect(gain2);
      gain2.connect(filter);
      osc2.start(now);
      osc2.stop(now + 1.85);

    } catch {}
  }

  /**
   * Optional gentle tap feedback
   */
  playSoftTap() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(216, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }
}

export const celestialAudio = new CelestialAudioSynthesizer();
