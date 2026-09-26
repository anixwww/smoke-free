// Procedural Meditative Audio Synthesizer for the Cozy Forest and Tree Sanctuary
class ForestAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private lastPopTime: number = 0;

  private initContext() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {}
  }

  /**
   * Realistic Acoustic Bubble Wrap / Air Pocket Pop
   * @param radius - Size of the popped bubble (approx 3.0 to 8.5)
   * Smaller bubbles: Higher pitch, lighter and thinner sound
   * Larger bubbles: Deep, rich, punchy, juicy bass pop
   */
  playBubbleWrapPop(radius: number = 5.5) {
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const nowMs = Date.now();
      if (nowMs - this.lastPopTime < 20) return;
      this.lastPopTime = nowMs;

      const t = this.ctx.currentTime;

      // Normalize radius: 0.0 (smallest ~3.0px) to 1.0 (largest ~8.0px)
      const norm = Math.max(0, Math.min(1, (radius - 3.0) / 5.0));

      // 1. Pitch: small = 840Hz (тонший), large = 320Hz (глибокий/соковитий)
      const jitter = (Math.random() - 0.5) * 35;
      const fundamental = 840 - norm * 520 + jitter;

      // 2. Volume & Gain scaling: small = softer (слабший), large = punchier/juicier (соковитіший)
      const airGainPeak = 0.22 + norm * 0.45;    // 0.22 -> 0.67
      const lowGainPeak = 0.08 + norm * 0.52;    // 0.08 -> 0.60
      const noiseGainPeak = 0.18 + norm * 0.32;  // 0.18 -> 0.50
      const duration = 0.024 + norm * 0.028;     // 24ms -> 52ms

      // --- LAYER 1: Air Chamber Pressure Pop (Sine Pitch Dive) ---
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();

      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(fundamental * 1.7, t);
      popOsc.frequency.exponentialRampToValueAtTime(Math.max(60, fundamental * 0.22), t + duration * 0.7);

      popGain.gain.setValueAtTime(airGainPeak, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      popOsc.connect(popGain);
      popGain.connect(this.ctx.destination);

      popOsc.start(t);
      popOsc.stop(t + duration + 0.01);

      // --- LAYER 2: Resonant Low Chamber Thud (Meaty & Juicy for Larger Bubbles) ---
      if (norm > 0.15) {
        const lowOsc = this.ctx.createOscillator();
        const lowGain = this.ctx.createGain();

        lowOsc.type = 'triangle';
        lowOsc.frequency.setValueAtTime(fundamental * 0.75, t);
        lowOsc.frequency.exponentialRampToValueAtTime(75, t + duration * 0.9);

        lowGain.gain.setValueAtTime(lowGainPeak, t);
        lowGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 1.1);

        lowOsc.connect(lowGain);
        lowGain.connect(this.ctx.destination);

        lowOsc.start(t);
        lowOsc.stop(t + duration * 1.15);
      }

      // --- LAYER 3: Crisp Polymer Film Snap (Filtered Transient Noise Burst) ---
      const sampleRate = this.ctx.sampleRate;
      const noiseDuration = 0.012 + norm * 0.008; // 12ms -> 20ms
      const bufferLength = Math.max(64, Math.floor(sampleRate * noiseDuration));
      const noiseBuffer = this.ctx.createBuffer(1, bufferLength, sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferLength; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferLength * 0.32));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      // Small bubbles snap higher (2.4kHz), large bubbles have warmer membrane snap (1.2kHz)
      filter.frequency.setValueAtTime(2400 - norm * 1200, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(noiseGainPeak, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + noiseDuration);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noiseSource.start(t);
      noiseSource.stop(t + noiseDuration + 0.005);
    } catch {}
  }

  // Warm radiant sun chime
  playSun() {
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const t = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C-major warm chord
      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + idx * 0.04);

        gain.gain.setValueAtTime(0.04, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.5);
      });
    } catch {}
  }
}

export const forestAudio = new ForestAudioSynthesizer();
