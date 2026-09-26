import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType, OrbitVoyageState } from '../types';
import {
  GRAVITY_CENTER_PRESETS,
  celestialAudio
} from '../data/orbitGameData';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Minus,
  Maximize2,
  Trash2,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface OrbitVoyageTabProps {
  cigsAvoided?: number;
  orbitState: OrbitVoyageState;
  onUpdateOrbitState: (updater: (prev: OrbitVoyageState) => OrbitVoyageState) => void;
  onSwitchTab?: (tab: TabType) => void;
}

interface GravityCenter {
  id: string;
  x: number;
  y: number;
  mass: number;
  radius: number;
  color: string;
  glow: string;
  coreColor: string;
  name?: string;
  pulsePhase: number;
}

interface CelestialBody {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  trail: { x: number; y: number }[];
  laps: number;
  nearestCenterDist: number;
  prevDistToNearest: number;
  isMovingAway: boolean;
  active: boolean;
  lastChimeTime: number;
}

// Visual acoustic resonance wave produced when passing close to a gravity center
interface ResonancePulse {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

// Background twinkling cosmic star
interface CosmicStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

const G_CONSTANT = 3600; // Scaled gravitational constant for smooth, stable orbital physics
const SOFTENING = 450;   // Prevents mathematical singularity on close passes
const TRAIL_MAX_POINTS = 500; // Silky multi-revolution orbital trails
const PROXIMITY_SOUND_THRESHOLD = 230; // Maximum distance to star to trigger periapsis harmonic chime

const BODY_COLORS = [
  '#38BDF8', // Celestial Sky Cyan
  '#34D399', // Emerald Green
  '#FBBF24', // Radiant Amber
  '#A78BFA', // Nebula Purple
  '#F472B6', // Rose Quartz
  '#67E8F9', // Aquamarine
  '#E2E8F0'  // Starlight White
];

export const OrbitVoyageTab: React.FC<OrbitVoyageTabProps> = ({
  orbitState,
  onUpdateOrbitState,
  onSwitchTab
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(orbitState.soundEnabled ?? true);
  const [activeCenterPreset, setActiveCenterPreset] = useState<'single' | 'binary' | 'triple'>('single');
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Physics entities
  const [centers, setCenters] = useState<GravityCenter[]>([]);
  const [bodies, setBodies] = useState<CelestialBody[]>([]);
  const bodiesRef = useRef<CelestialBody[]>([]);
  const centersRef = useRef<GravityCenter[]>([]);
  const pulsesRef = useRef<ResonancePulse[]>([]);
  const bgStarsRef = useRef<CosmicStar[]>([]);

  // Drag-to-launch state
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
  } | null>(null);

  // Touch pinch zoom tracking
  const touchDistanceRef = useRef<number | null>(null);

  // Initialize audio mute
  useEffect(() => {
    celestialAudio.setMuted(!soundEnabled);
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    onUpdateOrbitState((prev) => ({ ...prev, soundEnabled: next }));
  };

  // Generate background starry cosmos once
  useEffect(() => {
    const stars: CosmicStar[] = [];
    for (let i = 0; i < 140; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 3200,
        y: (Math.random() - 0.5) * 3200,
        size: Math.random() * 1.8 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
    bgStarsRef.current = stars;
  }, []);

  // Apply Gravity Centers Presets (1, 2, or 3 Stars)
  const applyCentersPreset = useCallback((preset: 'single' | 'binary' | 'triple') => {
    setActiveCenterPreset(preset);

    if (preset === 'single') {
      const singleCenter: GravityCenter[] = [
        {
          id: 'sun',
          x: 0,
          y: 0,
          mass: 130,
          radius: 17,
          color: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.45)',
          coreColor: '#FFFBEB',
          name: 'Головна Зоря',
          pulsePhase: 0
        }
      ];
      setCenters(singleCenter);
      centersRef.current = singleCenter;

      // Spawn 2 initial graceful Keplerian orbits
      const initialBodies: CelestialBody[] = [
        {
          id: 1,
          x: 0,
          y: -140,
          vx: 1.55,
          vy: 0,
          radius: 4,
          color: '#38BDF8',
          trail: [],
          laps: 0,
          nearestCenterDist: 140,
          prevDistToNearest: 140,
          isMovingAway: false,
          active: true,
          lastChimeTime: 0
        },
        {
          id: 2,
          x: 0,
          y: 220,
          vx: -1.22,
          vy: 0,
          radius: 4.5,
          color: '#34D399',
          trail: [],
          laps: 0,
          nearestCenterDist: 220,
          prevDistToNearest: 220,
          isMovingAway: false,
          active: true,
          lastChimeTime: 0
        }
      ];
      setBodies(initialBodies);
      bodiesRef.current = initialBodies;
    } else if (preset === 'binary') {
      const binaryCenters: GravityCenter[] = [
        {
          id: 'star-a',
          x: -115,
          y: 0,
          mass: 95,
          radius: 15,
          color: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.45)',
          coreColor: '#FFFBEB',
          name: 'Альфа',
          pulsePhase: 0
        },
        {
          id: 'star-b',
          x: 115,
          y: 0,
          mass: 95,
          radius: 15,
          color: '#06B6D4',
          glow: 'rgba(6, 182, 212, 0.45)',
          coreColor: '#ECFEFF',
          name: 'Бета',
          pulsePhase: Math.PI
        }
      ];
      setCenters(binaryCenters);
      centersRef.current = binaryCenters;

      // Figure-8 orbital body
      const initialBodies: CelestialBody[] = [
        {
          id: 1,
          x: 0,
          y: -160,
          vx: 1.38,
          vy: 0,
          radius: 4,
          color: '#A78BFA',
          trail: [],
          laps: 0,
          nearestCenterDist: 160,
          prevDistToNearest: 160,
          isMovingAway: false,
          active: true,
          lastChimeTime: 0
        }
      ];
      setBodies(initialBodies);
      bodiesRef.current = initialBodies;
    } else if (preset === 'triple') {
      const dist = 135;
      const angleStep = (Math.PI * 2) / 3;
      const tripleCenters: GravityCenter[] = [
        {
          id: 't1',
          x: Math.cos(-Math.PI / 2) * dist,
          y: Math.sin(-Math.PI / 2) * dist,
          mass: 80,
          radius: 13,
          color: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.45)',
          coreColor: '#FFFBEB',
          name: 'Зоря I',
          pulsePhase: 0
        },
        {
          id: 't2',
          x: Math.cos(-Math.PI / 2 + angleStep) * dist,
          y: Math.sin(-Math.PI / 2 + angleStep) * dist,
          mass: 80,
          radius: 13,
          color: '#34D399',
          glow: 'rgba(52, 211, 153, 0.45)',
          coreColor: '#ECFDF5',
          name: 'Зоря II',
          pulsePhase: (Math.PI * 2) / 3
        },
        {
          id: 't3',
          x: Math.cos(-Math.PI / 2 + angleStep * 2) * dist,
          y: Math.sin(-Math.PI / 2 + angleStep * 2) * dist,
          mass: 80,
          radius: 13,
          color: '#A78BFA',
          glow: 'rgba(167, 139, 250, 0.45)',
          coreColor: '#F5F3FF',
          name: 'Зоря III',
          pulsePhase: (Math.PI * 4) / 3
        }
      ];
      setCenters(tripleCenters);
      centersRef.current = tripleCenters;

      const initialBodies: CelestialBody[] = [
        {
          id: 1,
          x: 0,
          y: -235,
          vx: 1.18,
          vy: 0.1,
          radius: 4,
          color: '#38BDF8',
          trail: [],
          laps: 0,
          nearestCenterDist: 235,
          prevDistToNearest: 235,
          isMovingAway: false,
          active: true,
          lastChimeTime: 0
        }
      ];
      setBodies(initialBodies);
      bodiesRef.current = initialBodies;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    applyCentersPreset('single');
  }, [applyCentersPreset]);

  // Keep refs updated
  useEffect(() => {
    centersRef.current = centers;
  }, [centers]);

  useEffect(() => {
    bodiesRef.current = bodies;
  }, [bodies]);

  // Handle Canvas Resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear all celestial bodies
  const clearAllBodies = () => {
    setBodies([]);
    bodiesRef.current = [];
    pulsesRef.current = [];
  };

  // Reset View
  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(2.8, z * 1.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.35, z / 1.25));

  // Realistic Gravitational Physics Loop
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const physicsStep = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Update resonance pulses
      for (let p = pulsesRef.current.length - 1; p >= 0; p--) {
        const pulse = pulsesRef.current[p];
        pulse.radius += (pulse.maxRadius - pulse.radius) * 0.08 + 1.2;
        pulse.alpha *= 0.94;
        if (pulse.alpha < 0.01 || pulse.radius >= pulse.maxRadius) {
          pulsesRef.current.splice(p, 1);
        }
      }

      if (!isPaused && centersRef.current.length > 0) {
        const currentCenters = centersRef.current;
        const currentBodies = [...bodiesRef.current];

        // Multi-substep numerical integration (Symplectic Verlet)
        const SUBSTEPS = 8;
        const subDt = (dt * 1.5) / SUBSTEPS;

        for (let step = 0; step < SUBSTEPS; step++) {
          for (let i = 0; i < currentBodies.length; i++) {
            const body = currentBodies[i];
            if (!body.active) continue;

            let ax = 0;
            let ay = 0;
            let nearestDist = Infinity;
            let nearestCenterIndex = 0;
            let nearestCenter: GravityCenter = currentCenters[0];

            for (let cIdx = 0; cIdx < currentCenters.length; cIdx++) {
              const center = currentCenters[cIdx];
              const dx = center.x - body.x;
              const dy = center.y - body.y;
              const distSq = dx * dx + dy * dy;
              const dist = Math.sqrt(distSq);

              if (dist < nearestDist) {
                nearestDist = dist;
                nearestCenterIndex = cIdx;
                nearestCenter = center;
              }

              // Direct collision with dense inner core
              if (dist < center.radius * 0.42) {
                body.active = false;
                continue;
              }

              // Newtonian Gravitational Acceleration with Softening
              const force = (G_CONSTANT * center.mass) / Math.pow(distSq + SOFTENING, 1.5);
              ax += dx * force;
              ay += dy * force;
            }

            if (!body.active) continue;

            // Update velocity and coordinates
            body.vx += ax * subDt;
            body.vy += ay * subDt;
            body.x += body.vx * subDt;
            body.y += body.vy * subDt;

            // Check periapsis (closest approach to gravity center)
            // SOUND PLAYS ONLY WHEN PASSING NEAR A GRAVITY CENTER!
            if (step === 0 && Number.isFinite(nearestDist)) {
              if (
                body.prevDistToNearest < nearestDist &&
                !body.isMovingAway &&
                nearestDist <= PROXIMITY_SOUND_THRESHOLD
              ) {
                // Just crossed Periapsis (closest encounter point)
                body.isMovingAway = true;
                const nowSec = performance.now() / 1000;

                if (nowSec - body.lastChimeTime > 0.25) {
                  body.lastChimeTime = nowSec;
                  const distRatio = Math.min(1.0, nearestDist / PROXIMITY_SOUND_THRESHOLD);
                  const speed = Math.hypot(body.vx, body.vy);

                  // Trigger meditative harmonic chime
                  celestialAudio.playPeriapsisChime(nearestCenterIndex, distRatio, speed / 2);

                  // Visual acoustic wave radiating from the star and body
                  pulsesRef.current.push({
                    id: Math.random(),
                    x: nearestCenter.x,
                    y: nearestCenter.y,
                    radius: nearestCenter.radius * 0.8,
                    maxRadius: Math.max(90, nearestDist * 1.3),
                    alpha: 0.85,
                    color: nearestCenter.color,
                    lineWidth: 2.2
                  });

                  pulsesRef.current.push({
                    id: Math.random(),
                    x: body.x,
                    y: body.y,
                    radius: 4,
                    maxRadius: 36,
                    alpha: 0.9,
                    color: body.color,
                    lineWidth: 1.5
                  });
                }
              } else if (body.prevDistToNearest > nearestDist && body.isMovingAway) {
                body.isMovingAway = false;
              }
              body.prevDistToNearest = nearestDist;
              body.nearestCenterDist = nearestDist;
            }
          }
        }

        // Update body trails
        for (const body of currentBodies) {
          if (!body.active) continue;
          body.trail.push({ x: body.x, y: body.y });
          if (body.trail.length > TRAIL_MAX_POINTS) {
            body.trail.shift();
          }
        }

        const activeBodies = currentBodies.filter((b) => b.active);
        bodiesRef.current = activeBodies;
        setBodies(activeBodies);
      }

      // Render the scene
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderScene(ctx, canvas.width, canvas.height, now);
        }
      }

      animFrame = requestAnimationFrame(physicsStep);
    };

    animFrame = requestAnimationFrame(physicsStep);
    return () => cancelAnimationFrame(animFrame);
  }, [isPaused, zoom, pan, dragState]);

  // Main Canvas Rendering Routine
  const renderScene = (
    ctx: CanvasRenderingContext2D,
    rawWidth: number,
    rawHeight: number,
    timeMs: number
  ) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = rawWidth / dpr;
    const height = rawHeight / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Deep Midnight Cosmic Background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Subtle radial nebula ambiance
    const nebulaGrad = ctx.createRadialGradient(
      width / 2, height / 2, 50,
      width / 2, height / 2, Math.max(width, height) * 0.75
    );
    nebulaGrad.addColorStop(0, 'rgba(15, 23, 42, 0.7)');
    nebulaGrad.addColorStop(0.5, 'rgba(10, 15, 30, 0.85)');
    nebulaGrad.addColorStop(1, '#030712');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Cosmic Background Starfield
    const stars = bgStarsRef.current;
    const timeSec = timeMs * 0.001;
    for (const star of stars) {
      const alpha = star.baseAlpha * (0.6 + 0.4 * Math.sin(timeSec * star.twinkleSpeed * 50 + star.phase));
      ctx.fillStyle = `rgba(226, 232, 240, ${alpha.toFixed(3)})`;
      const sx = ((star.x + width / 2 + pan.x * 0.15) % width + width) % width;
      const sy = ((star.y + height / 2 + pan.y * 0.15) % height + height) % height;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Transform coordinate system for celestial viewport
    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // 3. Subtle Gravitational Equipotential Distance Rings around Centers
    for (const center of centersRef.current) {
      const ringRadii = [60, 120, 200, 320, 480];
      for (const r of ringRadii) {
        ctx.strokeStyle = `${center.color}0E`;
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Proximity Sound Threshold Ring (Subtle meditative dashed zone)
      ctx.strokeStyle = `${center.color}20`;
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([4 / zoom, 6 / zoom]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, PROXIMITY_SOUND_THRESHOLD, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Render Acoustic Resonance Pulses
    for (const pulse of pulsesRef.current) {
      ctx.strokeStyle = pulse.color;
      ctx.globalAlpha = pulse.alpha;
      ctx.lineWidth = pulse.lineWidth / zoom;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // 5. Render Gravity Centers (Stars)
    for (let cIdx = 0; cIdx < centersRef.current.length; cIdx++) {
      const center = centersRef.current[cIdx];
      const pulseScale = 1.0 + Math.sin(timeSec * 2.5 + center.pulsePhase) * 0.08;

      // Outer shimmering celestial aura
      const auraGrad = ctx.createRadialGradient(
        center.x, center.y, center.radius * 0.4,
        center.x, center.y, center.radius * 4.2 * pulseScale
      );
      auraGrad.addColorStop(0, center.glow);
      auraGrad.addColorStop(0.5, `${center.color}18`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(center.x, center.y, center.radius * 4.2 * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Main star body
      ctx.fillStyle = center.color;
      ctx.beginPath();
      ctx.arc(center.x, center.y, center.radius, 0, Math.PI * 2);
      ctx.fill();

      // Radiant white-hot core
      ctx.fillStyle = center.coreColor;
      ctx.beginPath();
      ctx.arc(center.x, center.y, center.radius * 0.52, 0, Math.PI * 2);
      ctx.fill();

      // Center Name Badge
      if (center.name) {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
        ctx.font = `600 ${Math.max(10, 12 / zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(center.name, center.x, center.y + center.radius + 16 / zoom);
      }
    }

    // 6. Render Orbiting Celestial Bodies & Long Decaying Glowing Trails
    for (const body of bodiesRef.current) {
      if (!body.active) continue;

      // Draw graceful fading trail
      if (body.trail.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < body.trail.length; i++) {
          const p1 = body.trail[i - 1];
          const p2 = body.trail[i];
          const alpha = (i / body.trail.length) * 0.72;

          ctx.strokeStyle = body.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = Math.max(1.2, 2.0 / zoom);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      // Planet Halo
      ctx.fillStyle = body.color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(body.x, body.y, body.radius * 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Planet Sphere
      ctx.fillStyle = body.color;
      ctx.beginPath();
      ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
      ctx.fill();

      // Planet Specular Highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(body.x - body.radius * 0.3, body.y - body.radius * 0.3, body.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Render Trajectory Prediction when Aiming / Dragging
    if (dragState && dragState.isDragging) {
      const launchX = dragState.startX;
      const launchY = dragState.startY;
      const dragDx = dragState.startX - dragState.currentX;
      const dragDy = dragState.startY - dragState.currentY;
      const dragDist = Math.hypot(dragDx, dragDy);

      let vx = 0;
      let vy = 0;

      if (dragDist > 6) {
        vx = dragDx * 0.035;
        vy = dragDy * 0.035;
      } else {
        // Default stable circular orbit around nearest star
        let targetCenter = centersRef.current[0];
        let nearestDist = Infinity;
        for (const center of centersRef.current) {
          const d = Math.hypot(center.x - launchX, center.y - launchY);
          if (d < nearestDist) {
            nearestDist = d;
            targetCenter = center;
          }
        }
        if (targetCenter && nearestDist > 15) {
          const dx = launchX - targetCenter.x;
          const dy = launchY - targetCenter.y;
          const r = Math.sqrt(dx * dx + dy * dy);
          const vCirc = Math.sqrt((G_CONSTANT * targetCenter.mass) / Math.max(r, 30));
          vx = (-dy / r) * vCirc;
          vy = (dx / r) * vCirc;
        }
      }

      // Fast forward predictive trajectory simulation
      let simX = launchX;
      let simY = launchY;
      let simVx = vx;
      let simVy = vy;
      const predSteps = 240;
      const predDt = 0.045;
      let impactDetected = false;
      let impactX = 0;
      let impactY = 0;

      const predPoints: { x: number; y: number }[] = [{ x: simX, y: simY }];

      for (let s = 0; s < predSteps; s++) {
        let ax = 0;
        let ay = 0;

        for (const center of centersRef.current) {
          const dx = center.x - simX;
          const dy = center.y - simY;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < center.radius * 0.42) {
            impactDetected = true;
            impactX = simX;
            impactY = simY;
            break;
          }

          const force = (G_CONSTANT * center.mass) / Math.pow(distSq + SOFTENING, 1.5);
          ax += dx * force;
          ay += dy * force;
        }

        if (impactDetected) break;

        simVx += ax * predDt;
        simVy += ay * predDt;
        simX += simVx * predDt;
        simY += simVy * predDt;
        predPoints.push({ x: simX, y: simY });
      }

      // Draw glowing predictive trajectory line
      if (predPoints.length > 1) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = Math.max(1.4, 2.0 / zoom);
        ctx.setLineDash([6 / zoom, 5 / zoom]);
        ctx.beginPath();
        ctx.moveTo(predPoints[0].x, predPoints[0].y);
        for (let p = 1; p < predPoints.length; p++) {
          ctx.lineTo(predPoints[p].x, predPoints[p].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbital velocity beads
        ctx.fillStyle = '#67E8F9';
        for (let p = 15; p < predPoints.length; p += 25) {
          const pt = predPoints[p];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(1.8, 2.5 / zoom), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Star core impact warning
      if (impactDetected) {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.arc(impactX, impactY, 8 / zoom, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Slingshot vector tension line
      if (dragDist > 6) {
        // Elastic drag band
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
        ctx.lineWidth = Math.max(1.4, 2.0 / zoom);
        ctx.beginPath();
        ctx.moveTo(dragState.startX, dragState.startY);
        ctx.lineTo(dragState.currentX, dragState.currentY);
        ctx.stroke();

        // Forward velocity guide arrow
        const arrowLen = Math.min(90, dragDist * 0.85);
        const arrowAng = Math.atan2(vy, vx);
        const headX = launchX + Math.cos(arrowAng) * arrowLen;
        const headY = launchY + Math.sin(arrowAng) * arrowLen;

        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = Math.max(1.6, 2.4 / zoom);
        ctx.beginPath();
        ctx.moveTo(launchX, launchY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(headX, headY, 3.5 / zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spawn point beacon
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(launchX, launchY, 5 / zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.8 / zoom;
      ctx.beginPath();
      ctx.arc(launchX, launchY, 13 / zoom, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  };

  // Screen to World Coordinates conversion
  const screenToWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };

    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    const worldX = (canvasX - (rect.width / 2 + pan.x)) / zoom;
    const worldY = (canvasY - (rect.height / 2 + pan.y)) / zoom;

    return { x: worldX, y: worldY };
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const world = screenToWorld(e.clientX, e.clientY);
    setDragState({
      startX: world.x,
      startY: world.y,
      currentX: world.x,
      currentY: world.y,
      isDragging: true
    });
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragState || !dragState.isDragging) return;
    const world = screenToWorld(e.clientX, e.clientY);
    setDragState((prev) => (prev ? { ...prev, currentX: world.x, currentY: world.y } : null));
  };

  // Pointer Up (Spawn Orbiting Body)
  const handlePointerUp = () => {
    if (!dragState || !dragState.isDragging) return;

    const dragDx = dragState.startX - dragState.currentX;
    const dragDy = dragState.startY - dragState.currentY;
    const dragDist = Math.hypot(dragDx, dragDy);

    let vx = 0;
    let vy = 0;

    if (dragDist > 6) {
      vx = dragDx * 0.035;
      vy = dragDy * 0.035;
    } else {
      // Tap to spawn stable circular Keplerian orbit
      let targetCenter = centersRef.current[0];
      let nearestDist = Infinity;
      for (const center of centersRef.current) {
        const d = Math.hypot(center.x - dragState.startX, center.y - dragState.startY);
        if (d < nearestDist) {
          nearestDist = d;
          targetCenter = center;
        }
      }

      if (targetCenter && nearestDist > 15) {
        const dx = dragState.startX - targetCenter.x;
        const dy = dragState.startY - targetCenter.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        const vCirc = Math.sqrt((G_CONSTANT * targetCenter.mass) / Math.max(r, 30));
        vx = (-dy / r) * vCirc;
        vy = (dx / r) * vCirc;
      } else {
        vx = 1.3;
        vy = 0;
      }
    }

    const newBody: CelestialBody = {
      id: Date.now() + Math.random(),
      x: dragState.startX,
      y: dragState.startY,
      vx,
      vy,
      radius: 3.5 + Math.random() * 1.5,
      color: BODY_COLORS[bodiesRef.current.length % BODY_COLORS.length],
      trail: [{ x: dragState.startX, y: dragState.startY }],
      laps: 0,
      nearestCenterDist: 1000,
      prevDistToNearest: 1000,
      isMovingAway: false,
      active: true,
      lastChimeTime: 0
    };

    const updated = [...bodiesRef.current, newBody];
    bodiesRef.current = updated;
    setBodies(updated);

    setDragState(null);
  };

  // Touch Wheel Zoom support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(2.8, z * 1.08));
    } else {
      setZoom((z) => Math.max(0.35, z / 1.08));
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="fixed inset-0 z-50 bg-[#030712] text-slate-100 select-none overflow-hidden touch-none flex flex-col justify-between font-sans"
    >
      {/* 1. TOP HEADER: RETURN BUTTON, GRAVITY CENTERS SELECTOR, AND ESSENTIAL ACTIONS */}
      <header className="absolute top-4 inset-x-4 z-30 flex items-center justify-between pointer-events-none">
        {/* RETURN BUTTON (LEFT) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => onSwitchTab?.('counter')}
            className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 active:scale-95 border border-slate-700/60 backdrop-blur-md flex items-center justify-center text-slate-200 hover:text-white transition-all cursor-pointer shadow-xl"
            title="Повернутися"
            aria-label="Повернутися"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* GRAVITY CENTER SELECTOR (CENTER - REDESIGNED SLEEK GLASS DOCK) */}
        <div className="pointer-events-auto flex items-center p-1 rounded-full bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-xl">
          {GRAVITY_CENTER_PRESETS.map((preset) => {
            const isSelected = activeCenterPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyCentersPreset(preset.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
                title={preset.description}
              >
                <span className="text-xs">{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* TOP RIGHT ACTION CONTROLS */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Info helper toggle */}
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className={`w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
              showInfo
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Фізика орбіт та звук"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={toggleSound}
            className={`w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
              soundEnabled
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Звук увімкнено (дзвін біля зірок)' : 'Звук вимкнено'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Pause / Play */}
          <button
            type="button"
            onClick={() => setIsPaused((v) => !v)}
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            title={isPaused ? 'Продовжити рух' : 'Зупинити час'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Clear all bodies */}
          <button
            type="button"
            onClick={clearAllBodies}
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/40 text-rose-300 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            title="Очистити всі орбіти"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. FULL-SCREEN CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* 3. OPTIONAL INFO MODAL / TOAST */}
      {showInfo && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 shadow-2xl text-xs text-slate-300 leading-relaxed animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Гравітаційні орбіти & Резонанс
            </span>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="text-slate-400 hover:text-white text-base leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300 mb-2">
            • <strong>Запуск орбіт:</strong> торкніться та потягніть назад, як рогатку, щоб надати вектор швидкості, або просто торкніться для стабільної колової орбіти.
          </p>
          <p className="text-slate-300 mb-2">
            • <strong>Звуковий резонанс:</strong> мелодійний 432 Гц дзвін лунає <em>виключно під час найближчого прольоту</em> тіла біля центра тяжіння (перицентру).
          </p>
          <p className="text-slate-400 text-[11px]">
            • <strong>Масштабування:</strong> використовуйте кнопки +/- або коліщатко миші.
          </p>
        </div>
      )}

      {/* 4. BOTTOM FLOATING CONTROLS: ZOOM CONTROLS (RIGHT) & STATUS (LEFT) */}
      <footer className="absolute bottom-5 inset-x-5 z-30 flex items-center justify-between pointer-events-none">
        {/* Status Badge */}
        <div className="pointer-events-auto px-3.5 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Тіла: {bodies.length}</span>
          <span className="text-slate-600">•</span>
          <span>{Math.round(zoom * 100)}%</span>
        </div>

        {/* REDESIGNED ZOOM CONTROLS */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-full bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-full bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Збільшити масштаб"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-full bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Зменшити масштаб"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={resetView}
            className="w-9 h-9 rounded-full bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Центрувати вигляд"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

      {/* 5. GENTLE ONBOARDING HINT IF NO BODIES */}
      {bodies.length === 0 && !dragState && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-5 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/40 text-center shadow-2xl">
            <p className="text-sm text-slate-200 font-medium mb-0.5">Потягніть у просторі</p>
            <p className="text-xs text-slate-400">запустіть орбіту та відчуйте звуковий резонанс біля зорі</p>
          </div>
        </div>
      )}
    </div>
  );
};
