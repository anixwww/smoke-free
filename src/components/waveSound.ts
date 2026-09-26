// Procedural Meditative Rain & Wave Audio Synthesizer for "Розчинення хвилі"
class WaveAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private rainNoiseNode: AudioBufferSourceNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;
  private isRainPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Continuous ambient rain noise (pink/brown noise with gentle low-pass filtering)
  startContinuousRain(intensity: number = 0.5, volume: number = 0.4) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.isRainPlaying) {
        this.setRainIntensity(intensity, volume);
        return;
      }

      const now = this.ctx.currentTime;
      // 5 seconds looping rain buffer
      const bufferSize = this.ctx.sampleRate * 5;
      const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let lastL = 0.0;
      let lastR = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;
        // Brown/pink noise filter
        lastL = (lastL + 0.02 * whiteL) / 1.02;
        lastR = (lastR + 0.02 * whiteR) / 1.02;
        left[i] = lastL * 2.5;
        right[i] = lastR * 2.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const cutoff = 200 + intensity * 450; // Extra soft rain tone
      filter.frequency.setValueAtTime(cutoff, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      const targetGain = 0.02 + intensity * 0.04 * volume;
      gain.gain.linearRampToValueAtTime(targetGain, now + 1.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      this.rainNoiseNode = noise;
      this.rainFilter = filter;
      this.rainGain = gain;
      this.isRainPlaying = true;
    } catch {}
  }

  setRainIntensity(intensity: number = 0.5, volume: number = 0.4) {
    if (!this.ctx || !this.rainFilter || !this.rainGain) return;
    try {
      const now = this.ctx.currentTime;
      const cutoff = 200 + intensity * 450;
      const targetGain = 0.02 + intensity * 0.04 * volume;
      this.rainFilter.frequency.setTargetAtTime(cutoff, now, 0.4);
      this.rainGain.gain.setTargetAtTime(targetGain, now, 0.4);
    } catch {}
  }

  stopContinuousRain() {
    if (!this.ctx || !this.rainNoiseNode || !this.rainGain) return;
    try {
      const now = this.ctx.currentTime;
      this.rainGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      setTimeout(() => {
        try {
          this.rainNoiseNode?.stop();
          this.rainNoiseNode?.disconnect();
        } catch {}
        this.isRainPlaying = false;
        this.rainNoiseNode = null;
        this.rainFilter = null;
        this.rainGain = null;
      }, 850);
    } catch {
      this.isRainPlaying = false;
    }
  }

  // Ultra gentle raindrop sound (soft warm lowpass sine wave with gentle pitch decay)
  playGentleRainDrop(pitchOffset: number = 1.0, vol: number = 0.7) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      // Delicate low-mid pentatonic pitches
      const baseFreqs = [280, 350, 420, 520, 600];
      const base = baseFreqs[Math.floor(Math.random() * baseFreqs.length)] * pitchOffset;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * 1.15, now);
      osc.frequency.exponentialRampToValueAtTime(base * 0.8, now + 0.14);

      // Lowpass filter for extra velvety smoothness
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      const maxGain = 0.016 * vol; // Very gentle and soft
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(maxGain, now + 0.025); // Zero click soft attack
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Soft, muted, gentle 432Hz chime bell drop ("приглушені лагідні дзвони")
  playResonantChimeDrop(noteIdx?: number, vol: number = 0.7) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Pythagorean 432Hz tuning scale
      const scale = [324, 388, 432, 540, 648, 720];
      const freq = noteIdx !== undefined ? scale[noteIdx % scale.length] : scale[Math.floor(Math.random() * scale.length)];

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Warm low-pass filter to make chimes soft, velvety, and muted
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);

      const maxGain = 0.035 * vol;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(maxGain, now + 0.08); // Silky long attack
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 2.4); // Soothing long decay

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.45);
    } catch {}
  }

  // Wave ocean swell / current surge
  playWaveSwell(intensity: number = 0.5) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 1.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.frequency.exponentialRampToValueAtTime(260 + intensity * 180, now + 0.8);
      filter.frequency.exponentialRampToValueAtTime(120, now + 1.7);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.03 * (0.4 + intensity * 0.6), now + 0.7);
      gain.gain.linearRampToValueAtTime(0.0001, now + 1.75);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 1.8);
    } catch {}
  }

  playStillnessChime() {
    this.playResonantChimeDrop(0, 0.8);
    setTimeout(() => this.playResonantChimeDrop(2, 0.6), 150);
  }

  playWaterDrop() {
    this.playGentleRainDrop(1.0, 0.7);
  }
}

export const waveAudio = new WaveAudioSynthesizer();
