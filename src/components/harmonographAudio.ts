// Procedural Web Audio API for Harmonograph (Coupled Pendulums Physics)
// 432 Hz Solfeggio / Handpan meditation scale

class HarmonographAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(650, this.ctx.currentTime);

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

        this.filter.connect(this.droneGain);
        this.droneGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(muted ? 0 : 0.04, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Start soft ambient harmonic tone that breathes with pendulum speed
   */
  public updatePendulumHum(speedRatio: number, freqRatio: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.droneGain || !this.filter) return;

      const baseFreq = 216; // 432 / 2 = 216 Hz warm cello fundamental
      const targetGain = Math.min(0.045, Math.max(0.005, speedRatio * 0.04));

      if (!this.droneOsc1) {
        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc2 = this.ctx.createOscillator();

        this.droneOsc1.type = 'sine';
        this.droneOsc2.type = 'sine';

        this.droneOsc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
        this.droneOsc2.frequency.setValueAtTime(baseFreq * freqRatio, this.ctx.currentTime);

        this.droneOsc1.connect(this.filter);
        this.droneOsc2.connect(this.filter);

        this.droneOsc1.start();
        this.droneOsc2.start();
      } else {
        this.droneOsc2?.frequency.setTargetAtTime(
          baseFreq * Math.max(0.5, Math.min(3, freqRatio)),
          this.ctx.currentTime,
          0.2
        );
      }

      this.droneGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    } catch {}
  }

  /**
   * Handpan chime when releasing a new pendulum impulse
   */
  public playImpulseChime(ratioIndex: number = 0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [216, 288, 324, 384, 432, 486, 576];
      const freq = notes[ratioIndex % notes.length];

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 2.0);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + 2.1);
    } catch {}
  }

  public stop() {
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }
}

export const harmonographAudio = new HarmonographAudioSynthesizer();
