import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  X
} from 'lucide-react';

export interface SandTabProps {
  daysCount: number; // total elapsed smoke-free time in seconds
  onSwitchTab?: (tab: any) => void;
}

// 6-LEVEL TIER DEFINITIONS
export interface SandTier {
  level: number;
  name: string;
  subname: string;
  equivalentMinutes: number;
  color: string;
  glow: string;
  size: number;
  shape: 'circle' | 'hexagon' | 'diamond' | 'star' | 'plasma' | 'monad';
}

export const TIERS: SandTier[] = [
  {
    level: 1,
    name: 'Піщинка',
    subname: '1 хв чистого дихання',
    equivalentMinutes: 1,
    color: '#FFB84D',
    glow: '#FF9225',
    size: 2.4,
    shape: 'circle'
  },
  {
    level: 2,
    name: 'Зерно',
    subname: '10 хв (10 піщинок)',
    equivalentMinutes: 10,
    color: '#FF8A00',
    glow: '#E65100',
    size: 4.6,
    shape: 'hexagon'
  },
  {
    level: 3,
    name: 'Кристал',
    subname: '100 хв (~1.6 год)',
    equivalentMinutes: 100,
    color: '#FFD700',
    glow: '#FFA000',
    size: 7.2,
    shape: 'diamond'
  },
  {
    level: 4,
    name: 'Самоцвіт',
    subname: '1,000 хв (~16.6 год)',
    equivalentMinutes: 1000,
    color: '#FF4D26',
    glow: '#D81B60',
    size: 10.4,
    shape: 'star'
  },
  {
    level: 5,
    name: 'Ефірний Плазмоїд',
    subname: '10,000 хв (~7 днів)',
    equivalentMinutes: 10000,
    color: '#FFE082',
    glow: '#FF8F00',
    size: 14.5,
    shape: 'plasma'
  },
  {
    level: 6,
    name: 'Квантова Монада',
    subname: '100,000 хв (~70 днів)',
    equivalentMinutes: 100000,
    color: '#FFFFFF',
    glow: '#FFD54F',
    size: 19.0,
    shape: 'monad'
  }
];

// LIVING PHASES OF THE QUANTUM ENTITY
export type QuantumPhase =
  | 'nebula'       // Organic breathing cloud
  | 'vortex_cw'    // Clockwise golden swirl
  | 'weightless'   // Zero-gravity still suspension
  | 'vortex_ccw'   // Counter-clockwise swirl
  | 'rings'        // Concentric resonant orbital rings
  | 'infinity';    // Figure-eight lemniscate flow

const PHASE_NAMES: Record<QuantumPhase, string> = {
  nebula: 'Дихаюча хмара',
  vortex_cw: 'Вир за годинниковою',
  weightless: 'Невагомість',
  vortex_ccw: 'Вир проти годинникової',
  rings: 'Резонансні кільця',
  infinity: 'Стрічка нескінченності'
};

const PHASE_CYCLE: QuantumPhase[] = [
  'nebula',
  'vortex_cw',
  'weightless',
  'vortex_ccw',
  'rings',
  'weightless',
  'infinity'
];

// LIVING QUANTUM PARTICLE
interface QuantumParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;

  // Base spherical/orbital coordinates
  baseRadius: number;
  angle: number;
  orbitSpeed: number;
  radialJitter: number;
  verticalOffset: number;

  // Dynamic Structure Target Coordinates (smoothly morphed)
  targetX: number;
  targetY: number;

  // Visuals & Tier
  tier: number;
  size: number;
  color: string;
  glow: string;
  shape: 'circle' | 'hexagon' | 'diamond' | 'star' | 'plasma' | 'monad';
  rotation: number;
  alpha: number;
}

// ========================================================
// PURE PROCEDURAL SAND RUSTLE AUDIO (Zero drone, zero hum)
// ========================================================
class PureSandRustleAudio {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private isStarted: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('quit-smoking:sand-rustle-audio');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }
    } catch {}
  }

  get enabled() {
    return this.isEnabled;
  }

  setEnabled(val: boolean) {
    this.isEnabled = val;
    try {
      localStorage.setItem('quit-smoking:sand-rustle-audio', String(val));
    } catch {}
    if (!val && this.noiseGain && this.ctx) {
      this.noiseGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    }
  }

  public init() {
    if (this.ctx && this.isStarted) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      const now = this.ctx.currentTime;

      // Soft pink noise buffer (fine sand grain friction)
      const bufferSize = this.ctx.sampleRate * 2.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.055;
        b1 = 0.99332 * b1 + white * 0.075;
        b2 = 0.96900 * b2 + white * 0.153;
        data[i] = (b0 + b1 + b2 + white * 0.536) * 0.11;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      // Bandpass 2150 Hz: soft acoustic sand friction
      const bandFilter = this.ctx.createBiquadFilter();
      bandFilter.type = 'bandpass';
      bandFilter.frequency.setValueAtTime(2150, now);
      bandFilter.Q.setValueAtTime(2.0, now);

      // Highpass 850 Hz: strictly strips away all low frequencies (NO HUM, NO DRONE)
      const highFilter = this.ctx.createBiquadFilter();
      highFilter.type = 'highpass';
      highFilter.frequency.setValueAtTime(850, now);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.0001, now);

      this.noiseSource.connect(bandFilter);
      bandFilter.connect(highFilter);
      highFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.ctx.destination);

      this.noiseSource.start(now);
      this.isStarted = true;
    } catch {}
  }

  setFrictionIntensity(intensity: number) {
    if (!this.ctx || !this.noiseGain || !this.isEnabled) {
      if (this.isEnabled && intensity > 0.05 && !this.isStarted) {
        this.init();
      }
      return;
    }

    try {
      // Extremely smooth, soft exponential envelope without clicks
      const target = Math.min(0.042, Math.max(0.0001, intensity * 0.038));
      this.noiseGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.14);
    } catch {}
  }
}

const sandAudio = new PureSandRustleAudio();

// ========================================================
// COMPONENT
// ========================================================
export const SandTab: React.FC<SandTabProps> = ({ daysCount, onSwitchTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sandAudio.enabled);
  const [isTiersOpen, setIsTiersOpen] = useState<boolean>(false);
  const [simulatedMinutes, setSimulatedMinutes] = useState<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState<QuantumPhase>('nebula');

  // Exact real minutes without smoking
  const realMinutes = useMemo(() => Math.max(0, Math.floor(daysCount / 60)), [daysCount]);
  const activeMinutes = simulatedMinutes !== null ? simulatedMinutes : realMinutes;
  const secondsToNextMinute = 60 - (Math.floor(daysCount) % 60);

  // 10-to-1 Hierarchical synthesis breakdown
  const tierCounts = useMemo(() => {
    let m = activeMinutes;
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 6; i++) {
      counts[i] = m % 10;
      m = Math.floor(m / 10);
    }
    if (m > 0) counts[5] += m * 10;
    return counts;
  }, [activeMinutes]);

  const synthesizedTotalCount = useMemo(() => {
    return tierCounts.reduce((acc, c) => acc + c, 0);
  }, [tierCounts]);

  const topTierIndex = useMemo(() => {
    for (let i = 5; i >= 0; i--) {
      if (tierCounts[i] > 0) return i;
    }
    return 0;
  }, [tierCounts]);

  const topTier = TIERS[topTierIndex];

  // Particle and rotation references
  const particlesRef = useRef<QuantumParticle[]>([]);
  const phaseCycleIndexRef = useRef<number>(0);
  const phaseTimerRef = useRef<number>(0);
  const phaseTransitionProgressRef = useRef<number>(1.0);

  const cloudRotationRef = useRef<{
    angle: number;
    speed: number;
    targetSpeed: number;
  }>({
    angle: 0,
    speed: 0.003,
    targetSpeed: 0.003
  });

  // Smoothed pointer for ultra-smooth fluid gesture reactions
  const pointerRef = useRef<{
    rawX: number;
    rawY: number;
    smoothX: number;
    smoothY: number;
    vx: number;
    vy: number;
    isDown: boolean;
    lastTouch: number;
    ripples: { x: number; y: number; radius: number; maxRadius: number; strength: number }[];
  }>({
    rawX: -9999,
    rawY: -9999,
    smoothX: -9999,
    smoothY: -9999,
    vx: 0,
    vy: 0,
    isDown: false,
    lastTouch: 0,
    ripples: []
  });

  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sandAudio.setEnabled(next);
  }, [soundEnabled]);

  // BUILD THE EXACT SYNTHESIZED PARTICLES ONLY (No lag, 60 FPS)
  useEffect(() => {
    const particles: QuantumParticle[] = [];
    let id = 0;
    for (let t = 5; t >= 0; t--) {
      const count = tierCounts[t];
      const tierDef = TIERS[t];
      for (let c = 0; c < count; c++) {
        const baseRadius = 28 + t * 26 + (c % 4) * 10;
        const angle = (c * (Math.PI * 2)) / Math.max(1, count) + t * 0.45;

        particles.push({
          id: id++,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          baseRadius,
          angle,
          orbitSpeed: (0.12 + (6 - t) * 0.06) * (c % 2 === 0 ? 1 : -0.85),
          radialJitter: Math.random() * Math.PI * 2,
          verticalOffset: (Math.random() - 0.5) * 20,
          targetX: 0,
          targetY: 0,
          tier: t + 1,
          size: tierDef.size,
          color: tierDef.color,
          glow: tierDef.glow,
          shape: tierDef.shape,
          rotation: Math.random() * Math.PI * 2,
          alpha: 0.95
        });
      }
    }

    particlesRef.current = particles;
  }, [tierCounts]);

  // MAIN SIMULATION & RENDERING LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Pointer events with ultra-smooth lerp interpolation
    const updateRawPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const p = pointerRef.current;
      p.rawX = clientX - rect.left;
      p.rawY = clientY - rect.top;
      p.lastTouch = performance.now();

      if (p.smoothX < -9000) {
        p.smoothX = p.rawX;
        p.smoothY = p.rawY;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      sandAudio.init();
      pointerRef.current.isDown = true;
      updateRawPointer(e.clientX, e.clientY);

      // Add a gentle soft ripple wave (smooth dispersion)
      pointerRef.current.ripples.push({
        x: pointerRef.current.rawX,
        y: pointerRef.current.rawY,
        radius: 10,
        maxRadius: 160,
        strength: 95 // Soft, not harsh
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      updateRawPointer(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      pointerRef.current.isDown = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    let animId: number;
    let lastTime = performance.now();

    // RENDER ANIMATION FRAME
    const render = (timeMs: number) => {
      const dt = Math.min(0.045, (timeMs - lastTime) / 1000);
      lastTime = timeMs;
      const t = timeMs * 0.001;

      const cx = width / 2;
      const cy = height / 2;

      // 1. AUTONOMOUS LIVING PATTERN CYCLE (Morphs every ~16 seconds smoothly)
      phaseTimerRef.current += dt;
      if (phaseTimerRef.current > 16.0) {
        phaseTimerRef.current = 0;
        phaseCycleIndexRef.current = (phaseCycleIndexRef.current + 1) % PHASE_CYCLE.length;
        const nextPhase = PHASE_CYCLE[phaseCycleIndexRef.current];
        setCurrentPhase(nextPhase);
        phaseTransitionProgressRef.current = 0.0;
      }

      // Smooth phase crossfade (over ~3.5 seconds for dreamlike transitions)
      if (phaseTransitionProgressRef.current < 1.0) {
        phaseTransitionProgressRef.current = Math.min(
          1.0,
          phaseTransitionProgressRef.current + dt * 0.3
        );
      }

      // 2. SINUSOIDAL CALM BREATHING PULSATION (~5.2s breathing cycle)
      const breathPhase = (t / 5.2) * Math.PI * 2;
      const breathScale = 1.0 + 0.14 * Math.sin(breathPhase);
      const corePulse = 0.82 + 0.18 * Math.sin(breathPhase);

      // 3. ORGANIC ROTATION & SPEED CHOREOGRAPHY BASED ON PHASE
      const rot = cloudRotationRef.current;
      const activePhase = PHASE_CYCLE[phaseCycleIndexRef.current];

      if (activePhase === 'vortex_cw') {
        // Rotates clockwise
        rot.targetSpeed = 0.012;
      } else if (activePhase === 'vortex_ccw') {
        // Rotates counter-clockwise
        rot.targetSpeed = -0.012;
      } else if (activePhase === 'weightless') {
        // Stops smoothly in zero-gravity
        rot.targetSpeed = 0.0005;
      } else if (activePhase === 'rings') {
        // Smooth steady orbital speed
        rot.targetSpeed = 0.006;
      } else if (activePhase === 'infinity') {
        rot.targetSpeed = 0.004;
      } else {
        // Nebula: gentle natural breathing drift
        rot.targetSpeed = 0.0035;
      }

      // Very soft, gradual acceleration/deceleration between rotational speeds
      rot.speed += (rot.targetSpeed - rot.speed) * (dt * 0.7);
      rot.angle += rot.speed;

      // 4. LERP-SMOOTHED POINTER TRACKING (Ensures gestures are smooth, never snappy)
      const p = pointerRef.current;
      if (p.rawX > 0) {
        const smoothLerp = dt * 8.5; // Soft fluid response
        const prevSmoothX = p.smoothX;
        const prevSmoothY = p.smoothY;

        p.smoothX += (p.rawX - p.smoothX) * smoothLerp;
        p.smoothY += (p.rawY - p.smoothY) * smoothLerp;

        p.vx = (p.smoothX - prevSmoothX) / Math.max(0.001, dt);
        p.vy = (p.smoothY - prevSmoothY) / Math.max(0.001, dt);

        // Fluid drag velocity transfer to cloud rotation
        if (p.isDown) {
          const dx = p.smoothX - cx;
          const dy = p.smoothY - cy;
          const dragAngular = (dx * p.vy - dy * p.vx) * 0.000003;
          rot.speed += dragAngular * (dt * 5);
        }
      }

      // Gentle shockwave ripple propagation
      for (let s = p.ripples.length - 1; s >= 0; s--) {
        const r = p.ripples[s];
        r.radius += dt * 180; // Slower, softer wave
        if (r.radius >= r.maxRadius) {
          p.ripples.splice(s, 1);
        }
      }

      // 5. BACKGROUND: WARM DEEP OBSIDIAN-BROWN ATMOSPHERE
      ctx.fillStyle = '#080503';
      ctx.fillRect(0, 0, width, height);

      // Ambient radial radiant light halo behind the central quantum entity
      const haloRadius = Math.max(180, Math.min(width, height) * 0.46);
      const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, haloRadius);
      halo.addColorStop(0, 'rgba(46, 25, 10, 0.42)');
      halo.addColorStop(0.45, 'rgba(22, 12, 5, 0.22)');
      halo.addColorStop(1, 'rgba(8, 5, 3, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      // Subtle resonant structure guides
      ctx.save();
      ctx.lineWidth = 1;
      if (activePhase === 'rings') {
        const ringDistances = [50, 90, 135, 185, 240];
        ringDistances.forEach((rd, idx) => {
          ctx.strokeStyle = `rgba(255, 185, 70, ${0.05 + 0.03 * Math.sin(breathPhase + idx)})`;
          ctx.beginPath();
          ctx.arc(cx, cy, rd * breathScale, 0, Math.PI * 2);
          ctx.stroke();
        });
      } else if (activePhase === 'infinity') {
        // Soft glowing figure-eight contour
        ctx.strokeStyle = 'rgba(255, 185, 70, 0.04)';
        ctx.beginPath();
        const loopW = 140 * breathScale;
        for (let a = 0; a <= Math.PI * 2; a += 0.08) {
          const infX = cx + (loopW * Math.cos(a)) / (1 + Math.sin(a) * Math.sin(a));
          const infY = cy + (loopW * Math.sin(a) * Math.cos(a)) / (1 + Math.sin(a) * Math.sin(a));
          if (a === 0) ctx.moveTo(infX, infY);
          else ctx.lineTo(infX, infY);
        }
        ctx.stroke();
      } else {
        // Calm concentric orbit guidelines
        const rings = [60, 110, 165, 225];
        rings.forEach((r, idx) => {
          ctx.strokeStyle = `rgba(255, 185, 70, ${0.025 + 0.015 * Math.sin(breathPhase + idx)})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r * breathScale, 0, Math.PI * 2);
          ctx.stroke();
        });
      }
      ctx.restore();

      // 6. MULTI-PHASE TARGET CALCULATION & SMOOTH GRAVITY ATTRACTOR
      const particles = particlesRef.current;
      let totalKineticEnergy = 0;

      // In weightlessness phase, damping increases so particles float still
      const isWeightless = activePhase === 'weightless';
      const dampingFactor = isWeightless ? 0.88 : 0.94; // Gentle viscous damping

      for (let i = 0; i < particles.length; i++) {
        const grain = particles[i];

        // Autonomous pattern trajectory calculations based on active phase:
        let structX = 0;
        let structY = 0;

        if (activePhase === 'rings') {
          // STRUCTURE 1: Concentric Resonant Bohr Rings
          const ringIndex = (grain.id % 4) + 1;
          const ringRadius = (ringIndex * 46 + 18) * breathScale;
          const a = grain.angle + rot.angle;
          structX = cx + Math.cos(a) * ringRadius;
          structY = cy + Math.sin(a) * (ringRadius * 0.9);
        } else if (activePhase === 'infinity') {
          // STRUCTURE 2: 3D Lemniscate of Bernoulli (Figure-eight flow)
          const infT = grain.angle * 0.6 + t * 0.4;
          const scaleInf = (130 + (grain.id % 3) * 20) * breathScale;
          const denom = 1 + Math.sin(infT) * Math.sin(infT);
          structX = cx + (scaleInf * Math.cos(infT)) / denom;
          structY = cy + (scaleInf * Math.sin(infT) * Math.cos(infT)) / denom;
        } else if (activePhase === 'vortex_cw' || activePhase === 'vortex_ccw') {
          // STRUCTURE 3: Logarithmic Spiral Vortex arms
          const armOffset = ((grain.id % 3) * (Math.PI * 2)) / 3;
          const rSpiral = (grain.baseRadius * 0.85 + 20) * breathScale;
          const a = grain.angle * 0.8 + rot.angle + armOffset;
          structX = cx + Math.cos(a) * rSpiral;
          structY = cy + Math.sin(a) * (rSpiral * 0.88);
        } else {
          // STRUCTURE 4: Nebula Cloud (Organic breathing sphere)
          grain.angle += grain.orbitSpeed * dt * 0.75;
          const targetRadius =
            (grain.baseRadius + 8 * Math.sin(t * 1.6 + grain.radialJitter)) * breathScale;
          structX = cx + Math.cos(grain.angle + rot.angle) * targetRadius;
          structY = cy + Math.sin(grain.angle + rot.angle) * (targetRadius * 0.88) + grain.verticalOffset;
        }

        // Initialize particle position softly on first frame
        if (grain.x === 0 && grain.y === 0) {
          grain.x = structX + (Math.random() - 0.5) * 10;
          grain.y = structY + (Math.random() - 0.5) * 10;
        }

        // Smoothly morph target position across phase transitions
        grain.targetX = structX;
        grain.targetY = structY;

        // 7. ULTRA-SMOOTH GESTURE REACTION (Soft fluid displacement, NO harsh kicks)
        if (p.smoothX > 0 && p.smoothY > 0) {
          const dx = grain.x - p.smoothX;
          const dy = grain.y - p.smoothY;
          const dist = Math.hypot(dx, dy) + 1;
          const interactRadius = 140;

          if (dist < interactRadius) {
            // Smooth bell-shaped cubic falloff: forces taper to zero gently at edges
            const norm = dist / interactRadius;
            const smoothBell = Math.max(0, 1 - norm * norm);
            const falloff = smoothBell * smoothBell; // (1 - r^2)^2

            // Soft fluid displacement away from finger
            const softPush = 140 * falloff;
            grain.vx += (dx / dist) * softPush * dt;
            grain.vy += (dy / dist) * softPush * dt;

            // Gentle circular wake/swirl around the finger
            const tangentX = -dy / dist;
            const tangentY = dx / dist;
            const softSwirl = 90 * falloff;
            grain.vx += tangentX * softSwirl * dt;
            grain.vy += tangentY * softSwirl * dt;

            // Very subtle momentum transfer from gentle drags
            if (p.isDown) {
              grain.vx += p.vx * 0.18 * falloff * dt;
              grain.vy += p.vy * 0.18 * falloff * dt;
            }
          }
        }

        // Ripple waves from taps
        for (let s = 0; s < p.ripples.length; s++) {
          const rip = p.ripples[s];
          const dx = grain.x - rip.x;
          const dy = grain.y - rip.y;
          const dist = Math.hypot(dx, dy) + 1;
          const waveDiff = Math.abs(dist - rip.radius);
          if (waveDiff < 28) {
            const waveFalloff = Math.cos((waveDiff / 28) * (Math.PI / 2));
            const push = rip.strength * waveFalloff * dt;
            grain.vx += (dx / dist) * push;
            grain.vy += (dy / dist) * push;
          }
        }

        // 8. CENTRAL ATTRACTOR: ASYMPTOTIC SOFT GRAVITY SPRING
        // Asymptotic tanh ensures far particles glide back with gentle terminal velocity (no slingshot snapping!)
        const diffX = grain.targetX - grain.x;
        const diffY = grain.targetY - grain.y;
        const diffDist = Math.hypot(diffX, diffY) + 1;

        // Attractor strength adapts smoothly: calmer during weightlessness
        const springK = isWeightless ? 1.6 : 3.2;
        const asymptoticForce = Math.tanh(diffDist / 90) * 110 * springK;

        grain.vx += (diffX / diffDist) * asymptoticForce * dt;
        grain.vy += (diffY / diffDist) * asymptoticForce * dt;

        // Fluid Viscous Damping
        grain.vx *= dampingFactor;
        grain.vy *= dampingFactor;

        // Update position
        grain.x += grain.vx * dt * 60;
        grain.y += grain.vy * dt * 60;
        grain.rotation += dt * (isWeightless ? 0.2 : 0.6);

        totalKineticEnergy += Math.abs(grain.vx) + Math.abs(grain.vy);

        // 9. RENDER PARTICLE WITH RADIANT BLOOM
        ctx.save();
        ctx.translate(grain.x, grain.y);

        const currentSize = grain.size * (grain.tier > 1 ? corePulse : 1.0);
        const glowRadius = currentSize * 3.4 + 4;

        // Soft Radial Glow Halo
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(0.24, grain.color);
        g.addColorStop(0.65, `${grain.glow}66`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Distinct Tier Shapes
        ctx.rotate(grain.rotation);
        ctx.fillStyle = grain.color;

        if (grain.shape === 'hexagon') {
          // Tier 2: Hexagonal grain
          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const a = (s * Math.PI) / 3;
            const px = Math.cos(a) * currentSize;
            const py = Math.sin(a) * currentSize;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else if (grain.shape === 'diamond') {
          // Tier 3: Radiant diamond crystal
          ctx.beginPath();
          ctx.moveTo(0, -currentSize * 1.35);
          ctx.lineTo(currentSize * 0.9, 0);
          ctx.lineTo(0, currentSize * 1.35);
          ctx.lineTo(-currentSize * 0.9, 0);
          ctx.closePath();
          ctx.fill();
        } else if (grain.shape === 'star') {
          // Tier 4: Solar 4-point star
          ctx.beginPath();
          for (let s = 0; s < 8; s++) {
            const r = s % 2 === 0 ? currentSize * 1.5 : currentSize * 0.45;
            const a = (s * Math.PI) / 4;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else if (grain.shape === 'plasma' || grain.shape === 'monad') {
          // Tier 5 & 6: Glowing core with specular ring
          ctx.beginPath();
          ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, currentSize * 1.6, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Tier 1: Soft circular grain
          ctx.beginPath();
          ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Specular core dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.8, currentSize * 0.35), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 10. CENTRAL LIVING NUCLEUS GLOW
      ctx.save();
      const nucR = (particles.length > 0 ? 15 : 22) * breathScale;

      const nucGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucR * 3.8);
      nucGlow.addColorStop(0, `rgba(255, 235, 180, ${0.45 * corePulse})`);
      nucGlow.addColorStop(0.35, `rgba(255, 160, 40, ${0.22 * corePulse})`);
      nucGlow.addColorStop(1, 'rgba(255, 120, 0, 0)');
      ctx.fillStyle = nucGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, nucR * 3.8, 0, Math.PI * 2);
      ctx.fill();

      // Solid central core starlet
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucR);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.4, '#FFE5A3');
      coreGrad.addColorStop(0.8, '#FFA000');
      coreGrad.addColorStop(1, '#FF6F00');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, nucR * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // If user has 0 minutes, show gentle birth countdown ring
      if (activeMinutes === 0) {
        ctx.strokeStyle = 'rgba(255, 180, 60, 0.45)';
        ctx.lineWidth = 2;
        const progressAngle = ((60 - secondsToNextMinute) / 60) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, nucR * 1.5, -Math.PI / 2, -Math.PI / 2 + progressAngle);
        ctx.stroke();
      }
      ctx.restore();

      // 11. PURE ASMR SAND RUSTLE AUDIO FEEDBACK
      const kineticFactor = totalKineticEnergy / Math.max(1, particles.length * 28);
      const isInteracting = p.isDown || performance.now() - p.lastTouch < 450;
      const rustleTarget = isInteracting
        ? Math.min(1.0, kineticFactor + 0.28)
        : Math.min(0.12, kineticFactor * 0.5);

      sandAudio.setFrictionIntensity(rustleTarget);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [synthesizedTotalCount]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#080503] text-amber-100 select-none overflow-hidden font-sans touch-none"
    >
      {/* Quantum Entity Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP FLOATING MINIMAL HEADER (Back & Table Icon Only) */}
      <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Back to Tracker */}
        <button
          type="button"
          onClick={() => onSwitchTab?.('counter')}
          className="pointer-events-auto w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-800/80 active:scale-95 border border-amber-500/20 backdrop-blur-md flex items-center justify-center text-amber-200 hover:text-white transition-all cursor-pointer shadow-lg"
          title="Повернутися до лічильника"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Table of Synthesized Time Icon Only */}
        <button
          type="button"
          onClick={() => setIsTiersOpen(true)}
          className="pointer-events-auto w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-800/80 active:scale-95 border border-amber-500/20 backdrop-blur-md flex items-center justify-center text-amber-200 hover:text-white transition-all cursor-pointer shadow-lg"
          title="Таблиця синтезованого часу"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </header>

      {/* MODAL: 6 TIERS & TIME SIMULATOR */}
      {isTiersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-stone-950/95 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800/70">
              <div>
                <h2 className="text-base font-semibold text-amber-200">Таблиця синтезованого часу</h2>
                <p className="text-xs text-stone-400">
                  {activeMinutes} хв чистоти • {synthesizedTotalCount} часток
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Audio toggle inside modal */}
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    soundEnabled
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-stone-900 border-stone-800 text-stone-500'
                  }`}
                  title={soundEnabled ? 'Вимкнути звук' : 'Увімкнути шурхіт піску'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsTiersOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of 6 Tiers (Only Name and Count) */}
            <div className="my-4 space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {TIERS.map((tier, idx) => {
                const count = tierCounts[idx];
                const isCurrent = idx === topTierIndex;
                return (
                  <div
                    key={tier.name}
                    className={`py-3 px-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/50'
                        : 'bg-stone-900/40 border-stone-800/60'
                    }`}
                  >
                    <span className="text-sm font-medium text-amber-100">{tier.name}</span>
                    <span className="text-sm font-mono font-bold text-amber-300">×{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Test Time Explorer */}
            <div className="pt-2 border-t border-stone-800/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-400 font-medium">Тестовий вимір часу</span>
                {simulatedMinutes !== null && (
                  <button
                    type="button"
                    onClick={() => setSimulatedMinutes(null)}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Реальний час ({realMinutes} хв)</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '5 хв', min: 5 },
                  { label: '25 хв', min: 25 },
                  { label: '2 год', min: 120 },
                  { label: '1 день', min: 1440 }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSimulatedMinutes(item.min)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer ${
                      simulatedMinutes === item.min
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-amber-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
