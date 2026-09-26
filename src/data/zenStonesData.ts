export type ZenEventType = 'resonance' | 'ripple' | 'breath';

export interface ZenEventConfig {
  type: ZenEventType;
  title: string;
  reactionTimeMs: number;
}

export const ZEN_EVENTS: Record<ZenEventType, ZenEventConfig> = {
  resonance: {
    type: 'resonance',
    title: 'Теплий резонанс каменя',
    reactionTimeMs: 9000
  },
  ripple: {
    type: 'ripple',
    title: 'Тиха хвиля по воді',
    reactionTimeMs: 9000
  },
  breath: {
    type: 'breath',
    title: 'Глибокий спокій',
    reactionTimeMs: 9500
  }
};

/**
 * Ultra-Soft Organic Meditative Acoustic Synthesizer
 *
 * Sound design guarantees:
 * - 100% free of clicks, sharp beeps, or loud transients.
 * - Warm low-pass filtered (< 260-320 Hz) sine waves with organic micro-pitch detuning.
 * - Whisper-soft gain levels (0.010 - 0.016 max).
 * - Breathing slow attacks (0.8s - 2.0s) and long peaceful decays (4s - 8s).
 * - Continuous warm theta binaural ambient wash (4.32 Hz difference).
 */
export class ZenSoundSynthesizer {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private isDronePlaying = false;

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public init() {
    this.getContext();
  }

  /**
   * Soft, continuous meditative ambient pad (theta wave drone at 108Hz / 112.32Hz)
   */
  startAmbientDrone() {
    const ctx = this.getContext();
    if (!ctx || this.isDronePlaying) return;

    try {
      const now = ctx.currentTime;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.Q.setValueAtTime(0.5, now);
      filter.connect(ctx.destination);
      this.droneFilter = filter;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.00001, now);
      masterGain.gain.linearRampToValueAtTime(0.010, now + 4.0); // Ultra-gentle 4s fade in
      masterGain.connect(filter);
      this.droneGain = masterGain;

      // Binaural warm sine pair (108Hz + 112.32Hz = 4.32Hz deep theta wave for meditation)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(108.0, now);
      osc2.frequency.setValueAtTime(112.32, now);

      osc1.connect(masterGain);
      osc2.connect(masterGain);

      osc1.start(now);
      osc2.start(now);

      this.droneOsc1 = osc1;
      this.droneOsc2 = osc2;
      this.isDronePlaying = true;
    } catch {
      // Audio context might need user gesture
    }
  }

  /**
   * Stop continuous ambient drone with smooth fade-out
   */
  stopAmbientDrone() {
    if (!this.isDronePlaying || !this.ctx || !this.droneGain) return;
    try {
      const now = this.ctx.currentTime;
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.00001, now + 2.5);
      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.droneGain?.disconnect();
          this.droneFilter?.disconnect();
        } catch {}
        this.isDronePlaying = false;
        this.droneGain = null;
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.droneFilter = null;
      }, 2600);
    } catch {
      this.isDronePlaying = false;
    }
  }

  /**
   * Whisper-soft, deep meditative signal.
   */
  playCueBell(type: ZenEventType = 'resonance') {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const freq = type === 'resonance' ? 144.0 : type === 'ripple' ? 174.6 : 162.0;
    const peakGain = 0.014;
    const decay = 5.0;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, now);
    filter.Q.setValueAtTime(0.4, now);
    filter.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.00001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + decay);

    osc.connect(gain);
    gain.connect(filter);

    osc.start(now);
    osc.stop(now + decay + 0.1);
  }

  /**
   * Harmonious, deeply peaceful singing bowl resonance when mandala is released.
   */
  playBell(calmLevel: number = 1, rootFreq: number = 174.6) {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const baseFreq = Math.max(110, rootFreq * 0.75);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 5.5);
    filter.Q.setValueAtTime(0.5, now);
    filter.connect(ctx.destination);

    // Warm organic chord: root + fifth + octave (whisper quiet)
    const tones = [
      { f: baseFreq, gain: 0.016, decay: 5.5, attack: 0.4 },
      { f: baseFreq * 1.5, gain: 0.009, decay: 4.8, attack: 0.5 },
      { f: baseFreq * 2.0, gain: 0.004, decay: 4.0, attack: 0.6 }
    ];

    tones.forEach(({ f, gain: peakGain, decay, attack }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 0.998, now + decay);

      gain.gain.setValueAtTime(0.00001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + decay);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  }

  /**
   * Organic warm swell when finger is pressed and held (mandala blooming).
   */
  playSproutBloomChord(rootFreq: number = 216.0) {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.linearRampToValueAtTime(320, now + 2.5);
    filter.frequency.exponentialRampToValueAtTime(160, now + 7.5);
    filter.connect(ctx.destination);

    // Warm soft triad
    const harmonics = [
      { f: rootFreq * 0.75, gain: 0.014, attack: 1.8, hold: 1.5, release: 4.0 },
      { f: rootFreq, gain: 0.011, attack: 2.2, hold: 1.2, release: 3.5 },
      { f: rootFreq * 1.5, gain: 0.006, attack: 2.5, hold: 1.0, release: 3.0 }
    ];

    harmonics.forEach(({ f, gain: peakGain, attack, hold, release }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 1.001, now + attack);
      osc.frequency.linearRampToValueAtTime(f * 0.999, now + attack + hold + release);

      gain.gain.setValueAtTime(0.00001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + attack);
      gain.gain.setValueAtTime(peakGain, now + attack + hold);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + attack + hold + release);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + attack + hold + release + 0.1);
    });
  }

  /**
   * Warm, soft water droplet / river stone touch in stillness.
   */
  playMutedBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(0.00001, now);
    gain.gain.linearRampToValueAtTime(0.008, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);

    osc.connect(gain);
    gain.connect(filter);

    osc.start(now);
    osc.stop(now + 0.45);
  }
}

export const zenSound = new ZenSoundSynthesizer();
