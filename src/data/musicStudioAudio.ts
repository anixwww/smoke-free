// Procedural Web Audio API for Music Studio
// Multi-instrument Synthesizer & Pattern Sequencer Engine
// Tuned to 432 Hz Solfeggio & Harmonic Acoustics

export type InstrumentType = 'handpan' | 'piano' | 'kalimba' | 'synth' | 'flute' | 'harp';

export interface InstrumentInfo {
  id: InstrumentType;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const INSTRUMENTS: InstrumentInfo[] = [
  { id: 'handpan', name: 'Ханг', icon: '◎', description: 'Медитативний глюкофон 432 Гц', color: '#38bdf8' },
  { id: 'piano', name: 'Піаніно', icon: '🎹', description: 'Теплі резонансні клавіші', color: '#34d399' },
  { id: 'kalimba', name: 'Калімба', icon: '✨', description: 'Кришталеве дерев\'яне язичкове звучання', color: '#fbbf24' },
  { id: 'synth', name: 'Синтезатор', icon: '🌌', description: 'Космічний теплий ембієнт-лідер', color: '#c084fc' },
  { id: 'flute', name: 'Флейта', icon: '🎐', description: 'Бамбуковий вітер та обертони', color: '#2dd4bf' },
  { id: 'harp', name: 'Арфа', icon: '🪕', description: 'Струнні переливи зоряного спокою', color: '#f472b6' },
];

export interface NoteInfo {
  id: string;
  name: string;
  freq: number;
  label: string;
  key: string;
  color: string;
}

// 8 Harmonic Scale Notes (D-Minor Pentatonic & 432 Hz Golden harmonics)
export const PIANO_NOTES: NoteInfo[] = [
  { id: 'n_d3', name: 'D3', freq: 144.0, label: '144 Гц', key: '1', color: '#38bdf8' },
  { id: 'n_a3', name: 'A3', freq: 216.0, label: '216 Гц', key: '2', color: '#2dd4bf' },
  { id: 'n_c4', name: 'C4', freq: 256.0, label: '256 Гц', key: '3', color: '#34d399' },
  { id: 'n_d4', name: 'D4', freq: 288.0, label: '288 Гц', key: '4', color: '#a3e635' },
  { id: 'n_f4', name: 'F4', freq: 345.6, label: '345 Гц', key: '5', color: '#fbbf24' },
  { id: 'n_g4', name: 'G4', freq: 384.0, label: '384 Гц', key: '6', color: '#f97316' },
  { id: 'n_a4', name: 'A4', freq: 432.0, label: '432 Гц', key: '7', color: '#ec4899' },
  { id: 'n_c5', name: 'C5', freq: 512.0, label: '512 Гц', key: '8', color: '#c084fc' },
];

export type DrumType = 'kick' | 'snare' | 'hihat' | 'ding' | 'wood' | 'shaker';

export interface DrumInfo {
  type: DrumType;
  name: string;
  symbol: string;
  key: string;
  color: string;
}

export const DRUM_PADS: DrumInfo[] = [
  { type: 'kick', name: 'Бас', symbol: '●', key: 'Q', color: '#38bdf8' },
  { type: 'snare', name: 'Клап', symbol: '✕', key: 'W', color: '#34d399' },
  { type: 'hihat', name: 'Хет', symbol: '╵', key: 'E', color: '#fbbf24' },
  { type: 'ding', name: 'Ханг', symbol: '◎', key: 'R', color: '#c084fc' },
  { type: 'wood', name: 'Дерево', symbol: '◈', key: 'A', color: '#d97706' },
  { type: 'shaker', name: 'Шейкер', symbol: '∰', key: 'S', color: '#f472b6' },
];

// Presets for melodious random generation in 432 Hz scales
export const SCALES = {
  zenPentatonic: [144.0, 216.0, 256.0, 288.0, 345.6, 384.0, 432.0, 512.0],
  akebono: [216.0, 256.0, 288.0, 345.6, 432.0, 512.0],
  pygmy: [144.0, 216.0, 256.0, 345.6, 384.0, 432.0],
  solfeggio432: [216.0, 288.0, 345.6, 432.0, 512.0]
};

class MusicStudioAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private isMuted: boolean = false;
  private isDroneActive: boolean = false;

  public initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // Pre-create drone bus
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        this.droneGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsDroneActive(): boolean {
    return this.isDroneActive;
  }

  /**
   * Optional drone (OFF by default)
   */
  public toggleDrone(): boolean {
    this.initCtx();
    if (!this.ctx || !this.droneGain) return false;

    this.isDroneActive = !this.isDroneActive;

    if (this.isDroneActive) {
      if (!this.droneOsc1) {
        const now = this.ctx.currentTime;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, now);

        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc2 = this.ctx.createOscillator();

        this.droneOsc1.type = 'sine';
        this.droneOsc2.type = 'sine';

        // 216 Hz & 432 Hz warm subtle hum
        this.droneOsc1.frequency.setValueAtTime(216.0, now);
        this.droneOsc2.frequency.setValueAtTime(432.1, now);

        this.droneOsc1.connect(filter);
        this.droneOsc2.connect(filter);
        filter.connect(this.droneGain);

        this.droneOsc1.start();
        this.droneOsc2.start();
      }
      this.droneGain.gain.setTargetAtTime(0.025, this.ctx.currentTime, 0.5);
    } else {
      this.droneGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
    }

    return this.isDroneActive;
  }

  /**
   * Main Note Play method routed by Instrument type
   */
  public playNote(instrument: InstrumentType, freq: number, velocity: number = 1.0) {
    if (this.isMuted) return;
    switch (instrument) {
      case 'handpan':
        this.playHandpanNote(freq, velocity);
        break;
      case 'piano':
        this.playPianoSound(freq, velocity);
        break;
      case 'kalimba':
        this.playKalimbaNote(freq, velocity);
        break;
      case 'synth':
        this.playSynthNote(freq, velocity);
        break;
      case 'flute':
        this.playFluteNote(freq, velocity);
        break;
      case 'harp':
        this.playHarpNote(freq, velocity);
        break;
      default:
        this.playHandpanNote(freq, velocity);
    }
  }

  /**
   * Backward compatible alias
   */
  public playPianoNote(freq: number, velocity: number = 1.0) {
    this.playNote('handpan', freq, velocity);
  }

  /**
   * 1. HANDPAN (432 Hz Solfeggio Handpan / Singing Bell)
   */
  private playHandpanNote(freq: number, velocity: number = 1.0) {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(2200, freq * 3.4), now);
      filter.Q.setValueAtTime(2.2, now);

      const noteGain = this.ctx.createGain();
      const baseVol = Math.max(0.04, Math.min(0.24, 0.16 * velocity));

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc2Gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.003, now);
      osc2Gain.gain.setValueAtTime(0.22, now);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(baseVol, now + 0.007);
      noteGain.gain.exponentialRampToValueAtTime(baseVol * 0.45, now + 0.35);
      noteGain.gain.exponentialRampToValueAtTime(0.00001, now + 2.2);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.3);
      osc2.stop(now + 2.3);
    } catch {}
  }

  /**
   * 2. ACOUSTIC PIANO / RHODES KEYS
   */
  private playPianoSound(freq: number, velocity: number = 1.0) {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(3200, freq * 4.0), now);
      filter.frequency.exponentialRampToValueAtTime(Math.min(1200, freq * 1.5), now + 0.8);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this.ctx.createGain();
      const baseVol = Math.max(0.05, Math.min(0.26, 0.18 * velocity));

      // Fundamental triangle + gentle sine octave + subtle acoustic knock
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const osc2Gain = this.ctx.createGain();
      const osc3Gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.0, now);
      osc2Gain.gain.setValueAtTime(0.35, now);

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3.0, now);
      osc3Gain.gain.setValueAtTime(0.12, now);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      osc3.connect(osc3Gain);
      osc3Gain.connect(filter);

      filter.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(baseVol, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(baseVol * 0.5, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 1.8);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + 1.9);
      osc2.stop(now + 1.9);
      osc3.stop(now + 1.9);
    } catch {}
  }

  /**
   * 3. KALIMBA / MBIRA (Bright tine pluck & wooden resonance)
   */
  private playKalimbaNote(freq: number, velocity: number = 1.0) {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const gain = this.ctx.createGain();
      const baseVol = Math.max(0.04, Math.min(0.25, 0.17 * velocity));

      // Pure sine fundamental with high metallic overtone ping
      const osc = this.ctx.createOscillator();
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // 6th harmonic tine resonance
      ping.type = 'sine';
      ping.frequency.setValueAtTime(freq * 5.4, now);
      pingGain.gain.setValueAtTime(0.35, now);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, now);
      filter.Q.setValueAtTime(1.8, now);

      osc.connect(gain);
      ping.connect(pingGain);
      pingGain.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(baseVol, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(baseVol * 0.3, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 1.4);

      osc.start(now);
      ping.start(now);
      osc.stop(now + 1.5);
      ping.stop(now + 0.1);
    } catch {}
  }

  /**
   * 4. COSMIC SYNTH / NEBULA (Ethereal ambient pad lead)
   */
  private playSynthNote(freq: number, velocity: number = 1.0) {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 2.5, now);
      filter.frequency.linearRampToValueAtTime(freq * 5.5, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 1.5);
      filter.Q.setValueAtTime(3.5, now);

      const gain = this.ctx.createGain();
      const baseVol = Math.max(0.04, Math.min(0.22, 0.15 * velocity));

      // Sawtooth + detuned square for thick lush chorus
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc2Gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.006, now); // slight chorus detune
      osc2Gain.gain.setValueAtTime(0.6, now);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(baseVol, now + 0.035);
      gain.gain.exponentialRampToValueAtTime(baseVol * 0.6, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 2.0);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.1);
      osc2.stop(now + 2.1);
    } catch {}
  }

  /**
   * 5. ZEN FLUTE / SHAKUHACHI (Acoustic breath & woodwind overtone)
   */
  private playFluteNote(freq: number, velocity: number = 1.0) {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const gain = this.ctx.createGain();
      const baseVol = Math.max(0.04, Math.min(0.24, 0.16 * velocity));

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Breath vibrato LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, now); // 5.2 Hz gentle vibrato
      lfoGain.gain.setValueAtTime(3.5, now);
      lfo.connect(osc.frequency);

      // Breath noise puff at attack
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.1);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(freq * 2.2, now);
      noiseFilter.Q.setValueAtTime(3.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06 * velocity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(gain);

      osc.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(baseVol, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(baseVol * 0.65, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 1.7);

      lfo.start(now);
      osc.start(now);
      noise.start(now);

      lfo.stop(now + 1.8);
      osc.stop(now + 1.8);
      noise.stop(now + 0.12);
    } catch {}
  }

  /**
   * 6. CELESTIAL HARP (Plucked strings & ringing harmonics)
   */
  private playHarpNote(freq: number, velocity: number = 1.0) {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(4500, freq * 5.0), now);
      filter.frequency.exponentialRampToValueAtTime(Math.min(1600, freq * 2.0), now + 0.5);

      const gain = this.ctx.createGain();
      const baseVol = Math.max(0.04, Math.min(0.24, 0.16 * velocity));

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc2Gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.002, now);
      osc2Gain.gain.setValueAtTime(0.28, now);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(baseVol, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(baseVol * 0.4, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 1.9);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.0);
      osc2.stop(now + 2.0);
    } catch {}
  }

  /**
   * Play meditative organic percussion
   */
  public playDrum(type: DrumType, velocity: number = 1.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;

      if (type === 'kick') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(82, now);
        osc.frequency.exponentialRampToValueAtTime(36, now + 0.09);

        gain.gain.setValueAtTime(0.55 * velocity, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.34);
      } else if (type === 'snare') {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(175, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.05);

        oscGain.gain.setValueAtTime(0.25 * velocity, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1800, now);
        noiseFilter.Q.setValueAtTime(2.5, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.18 * velocity, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.1);
        noise.stop(now + 0.1);
      } else if (type === 'hihat') {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.045);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7500, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12 * velocity, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.05);
      } else if (type === 'ding') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(108, now);
        osc.frequency.exponentialRampToValueAtTime(104, now + 0.4);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.35 * velocity, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 1.6);
      } else if (type === 'wood') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(750, now);
        gain.gain.setValueAtTime(0.28 * velocity, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'shaker') {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4500, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1 * velocity, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.15);
      }
    } catch {}
  }

  public stop() {
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    this.isDroneActive = false;
  }
}

export const musicStudioAudio = new MusicStudioAudioEngine();
