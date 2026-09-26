// Procedural Meditative Audio Synthesizer for the Sleeping Cat Sanctuary
// Pure, delicate, harmonic sounds without any electronic drone, buzzing, or low-frequency hum.

class CatAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private lastStrokeSoundTime: number = 0;
  private strokeChordIndex: number = 0;

  // Meditative pentatonic frequencies (432Hz based, peaceful and gentle)
  private readonly notes = [288, 324, 384, 432, 486, 576, 648, 768];

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
   * Gentle, whisper-soft harmonic ripple when stroking the cat
   * Completely replaces the low-frequency drone/humming with pure, soothing, crystal-warm tones.
   */
  playStrokeRipple(sleepLevel: number = 50) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const nowMs = Date.now();
      // Throttle stroke sound intervals for a relaxing trickle effect (~140ms)
      if (nowMs - this.lastStrokeSoundTime < 130) return;
      this.lastStrokeSoundTime = nowMs;

      const t = this.ctx.currentTime;
      const freq = this.notes[this.strokeChordIndex % this.notes.length];
      this.strokeChordIndex = (this.strokeChordIndex + 1) % this.notes.length;

      // Soft volume (0.015 to 0.035, never loud or harsh)
      const sleepNorm = Math.max(0, Math.min(1, sleepLevel / 100));
      const peakGain = 0.014 + sleepNorm * 0.018;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm lowpass filter to remove any sharpness
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 - sleepNorm * 180, t);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Gentle attack and soft exponential release
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(peakGain, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35 + sleepNorm * 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.55);
    } catch {}
  }

  // Compatibility stubs so existing callers don't throw
  startPurr() {}
  setPurrIntensity(_strokeActivity: number, _sleepLevel: number) {}
  stopPurr() {}

  // Gentle soft sleepy chirp when waking up
  playSleepyMeow() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, t);

      osc.type = 'sine';
      // Sleepy gentle chirp
      osc.frequency.setValueAtTime(390, t);
      osc.frequency.exponentialRampToValueAtTime(480, t + 0.14);
      osc.frequency.exponentialRampToValueAtTime(340, t + 0.38);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.025, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.42);
    } catch {}
  }

  // Sweet ethereal dream chime (зоряний дзвіночок сну)
  playDreamChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const freqs = [432, 576, 648, 864]; // Ethereal 432Hz harmonic dream
      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + idx * 0.09);

        gain.gain.setValueAtTime(0.0001, t + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.012, t + idx * 0.09 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.09 + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.09);
        osc.stop(t + idx * 0.09 + 0.75);
      });
    } catch {}
  }

  // Eating sound effect (soft crunching munch)
  playEatSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220 + Math.random() * 80, t + i * 0.12);
        osc.frequency.exponentialRampToValueAtTime(120, t + i * 0.12 + 0.08);

        gain.gain.setValueAtTime(0.0001, t + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.02, t + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.1);
      }
    } catch {}
  }

  // Drinking sound effect (soft lap / bubble)
  playDrinkSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520 + Math.random() * 120, t + i * 0.1);
        osc.frequency.exponentialRampToValueAtTime(840 + Math.random() * 100, t + i * 0.1 + 0.05);

        gain.gain.setValueAtTime(0.0001, t + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.018, t + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.1 + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.08);
      }
    } catch {}
  }

  // Toy play sound (cheerful jingle bell chime)
  playToySound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chord = [587, 880, 1174];
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.0001, t + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.02, t + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.45);
      });
    } catch {}
  }

  // Cleaning litter box sound (soft scoop rustle)
  playCleanLitterSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.Q.setValueAtTime(2.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.025, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.3);
    } catch {}
  }
}

export const catAudio = new CatAudioSynthesizer();
