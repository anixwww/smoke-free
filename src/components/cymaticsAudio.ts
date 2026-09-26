// Web Audio API for Cymatics (Water Standing Wave Resonance)
// Solfeggio / Natural Harmonic frequencies (108 Hz, 432 Hz, 528 Hz, 639 Hz)

export interface CymaticsFrequencyPreset {
  id: string;
  name: string;
  hz: number;
  description: string;
  waveDensity: number;
  symmetry: number;
}

export const CYMATICS_PRESETS: CymaticsFrequencyPreset[] = [
  {
    id: '108',
    name: '108 Гц • Океанський Ом',
    hz: 108,
    description: 'Глибока первинна вібрація спокою. Створює широкі концентричні хвилі.',
    waveDensity: 1.0,
    symmetry: 4
  },
  {
    id: '432',
    name: '432 Гц • Золотий Перетин',
    hz: 432,
    description: 'Природний резонанс Всесвіту. Візерунок сакральної геометрії.',
    waveDensity: 1.6,
    symmetry: 6
  },
  {
    id: '528',
    name: '528 Гц • Частота Зцілення',
    hz: 528,
    description: 'Трансформація та зняття внутрішньої тривоги. Спіральні хвилі Хладні.',
    waveDensity: 2.2,
    symmetry: 8
  },
  {
    id: '639',
    name: '639 Гц • Гармонія Серця',
    hz: 639,
    description: 'Високий кришталевий резонанс цілісності та внутрішнього балансу.',
    waveDensity: 2.8,
    symmetry: 12
  }
];

class CymaticsAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bowlOsc: OscillatorNode | null = null;
  private bowlGain: GainNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bowlGain = this.ctx.createGain();
        this.bowlGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        this.bowlGain.connect(this.ctx.destination);

        this.subGain = this.ctx.createGain();
        this.subGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        this.subGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bowlGain && this.ctx) {
      this.bowlGain.gain.setTargetAtTime(muted ? 0 : 0.04, this.ctx.currentTime, 0.1);
    }
    if (this.subGain && this.ctx) {
      this.subGain.gain.setTargetAtTime(muted ? 0 : 0.03, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Set continuous singing bowl harmonic frequency
   */
  public setHarmonicFrequency(hz: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.bowlGain || !this.subGain) return;

      const now = this.ctx.currentTime;

      if (!this.bowlOsc) {
        this.bowlOsc = this.ctx.createOscillator();
        this.subOsc = this.ctx.createOscillator();

        this.bowlOsc.type = 'sine';
        this.subOsc.type = 'sine';

        this.bowlOsc.frequency.setValueAtTime(hz, now);
        this.subOsc.frequency.setValueAtTime(hz * 0.5, now);

        this.bowlOsc.connect(this.bowlGain);
        this.subOsc.connect(this.subGain);

        this.bowlOsc.start();
        this.subOsc.start();
      } else {
        this.bowlOsc.frequency.setTargetAtTime(hz, now, 0.15);
        this.subOsc?.frequency.setTargetAtTime(hz * 0.5, now, 0.15);
      }

      this.bowlGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.045, now, 0.1);
      this.subGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.03, now, 0.1);
    } catch {}
  }

  /**
   * Water ripple drop chime on touch
   */
  public playWaterChime(hz: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(hz * 1.5, now);
      osc.frequency.exponentialRampToValueAtTime(hz, now + 0.18);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch {}
  }

  public stop() {
    if (this.bowlGain && this.ctx) {
      this.bowlGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    if (this.subGain && this.ctx) {
      this.subGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }
}

export const cymaticsAudio = new CymaticsAudioSynthesizer();
