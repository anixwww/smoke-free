import React, { useEffect, useRef } from 'react';
import { TabType } from '../types';
import { waveAudio } from '../data/waveSound';
import { ArrowLeft } from 'lucide-react';

interface WaveTabProps {
  onSwitchTab?: (tab: TabType) => void;
}

// Particle for wave dissolution (bioluminescent plankton, water foam & dissolved mist)
interface DissolvingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  glow: string;
  twinklePhase: number;
}

// Interactive Wave Trail segment created by user touch/drag
interface WaveTrailSegment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

// Concentric Water Ripple
interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
  speed: number;
}

// Floating Zen Water Leaf
interface FloatingLeaf {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  rotationSpeed: number;
  scale: number;
  color: string;
  stemColor: string;
}

// Natural Sky Rain Drop
interface AmbientRainDrop {
  x: number;
  y: number;
  targetY: number;
  speedY: number;
  speedX: number;
  length: number;
  alpha: number;
}

// Harmonic Color Palette (Bioluminescent deep sea & starlight reflection)
const PALETTES = [
  { stroke: '#38BDF8', glow: 'rgba(56, 189, 248, 0.4)', particle: '#BAE6FD' }, // Cyan
  { stroke: '#2DD4BF', glow: 'rgba(45, 212, 191, 0.4)', particle: '#99F6E4' }, // Turquoise
  { stroke: '#818CF8', glow: 'rgba(129, 140, 248, 0.4)', particle: '#C7D2FE' }, // Indigo-Violet
  { stroke: '#F472B6', glow: 'rgba(244, 114, 182, 0.4)', particle: '#FBCFE8' }, // Lotus Pink
  { stroke: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)', particle: '#FEF3C7' }  // Golden Amber
];

export const WaveTab: React.FC<WaveTabProps> = ({ onSwitchTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Canvas State References
  const particlesRef = useRef<DissolvingParticle[]>([]);
  const waveTrailsRef = useRef<WaveTrailSegment[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const leavesRef = useRef<FloatingLeaf[]>([]);
  const rainDropsRef = useRef<AmbientRainDrop[]>([]);
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const paletteIndexRef = useRef<number>(0);

  // Initialize ambient continuous gentle rain / ocean wash audio on mount
  useEffect(() => {
    waveAudio.startContinuousRain(0.35, 0.4);
    return () => {
      waveAudio.stopContinuousRain();
    };
  }, []);

  // Main Canvas Render & Physics Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Initialize floating leaves if empty
      if (leavesRef.current.length === 0) {
        const leafColors = [
          { color: '#1b4332', stem: '#2d6a4f' },
          { color: '#2d5a27', stem: '#408236' },
          { color: '#4a3f28', stem: '#71603e' },
          { color: '#1e3d59', stem: '#17b978' }
        ];

        for (let i = 0; i < 4; i++) {
          const scheme = leafColors[i % leafColors.length];
          leavesRef.current.push({
            id: i,
            x: width * 0.15 + Math.random() * (width * 0.7),
            y: height * 0.2 + Math.random() * (height * 0.6),
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.004,
            scale: 0.85 + Math.random() * 0.35,
            color: scheme.color,
            stemColor: scheme.stem
          });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Spawn water ripple with sound
    const createRipple = (x: number, y: number, color?: string, maxR: number = 90) => {
      const palette = PALETTES[paletteIndexRef.current % PALETTES.length];
      ripplesRef.current.push({
        x,
        y,
        radius: 4,
        maxRadius: maxR,
        alpha: 0.8,
        color: color || palette.stroke,
        lineWidth: 1.4,
        speed: 70 + Math.random() * 25
      });

      // Spawn dissolving foam sparkles around center
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 4 + Math.random() * 18;
        const spd = 12 + Math.random() * 28;
        particlesRef.current.push({
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 1.2 + Math.random() * 1.8,
          alpha: 0.9,
          maxLife: 1.2 + Math.random() * 0.9,
          life: 0,
          color: palette.particle,
          glow: palette.glow,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }

      // Disperse leaves
      leavesRef.current.forEach((leaf) => {
        const dx = leaf.x - x;
        const dy = leaf.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxR && dist > 1) {
          const force = (1 - dist / maxR) * 2.4;
          leaf.vx += (dx / dist) * force;
          leaf.vy += (dy / dist) * force;
        }
      });
    };

    // Pointer Event Handlers (Mouse & Touch)
    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      isPointerDownRef.current = true;
      lastPointerRef.current = { x, y, time: performance.now() };

      // Cycle palette every couple touches
      paletteIndexRef.current = (paletteIndexRef.current + 1) % PALETTES.length;

      createRipple(x, y, undefined, 110);
      waveAudio.playResonantChimeDrop(undefined, 0.65);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current || !lastPointerRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();

      const dx = x - lastPointerRef.current.x;
      const dy = y - lastPointerRef.current.y;
      const dist = Math.hypot(dx, dy);
      const dt = Math.max(0.001, (now - lastPointerRef.current.time) / 1000);

      if (dist > 4) {
        const speed = Math.min(600, dist / dt);
        const vx = (dx / dt) * 0.25;
        const vy = (dy / dt) * 0.25;
        const palette = PALETTES[paletteIndexRef.current % PALETTES.length];

        // Add fluid wave trail segment
        waveTrailsRef.current.push({
          x,
          y,
          vx,
          vy,
          radius: 8 + Math.min(22, speed * 0.04),
          alpha: 0.85,
          life: 0,
          maxLife: 1.6 + Math.random() * 0.6,
          color: palette.stroke
        });

        // Spawn dissolving bioluminescent plankton along wave path
        const spawnCount = Math.min(8, Math.floor(dist * 0.4));
        for (let i = 0; i < spawnCount; i++) {
          const spreadAngle = Math.atan2(dy, dx) + Math.PI / 2 + (Math.random() - 0.5) * 1.6;
          const pSpeed = 15 + Math.random() * 45;
          particlesRef.current.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: vx * 0.3 + Math.cos(spreadAngle) * pSpeed,
            vy: vy * 0.3 + Math.sin(spreadAngle) * pSpeed,
            size: 1.2 + Math.random() * 2.2,
            alpha: 0.95,
            maxLife: 1.4 + Math.random() * 1.2,
            life: 0,
            color: palette.particle,
            glow: palette.glow,
            twinklePhase: Math.random() * Math.PI * 2
          });
        }

        // Push leaves in current
        leavesRef.current.forEach((leaf) => {
          const ldx = leaf.x - x;
          const ldy = leaf.y - y;
          const ldist = Math.hypot(ldx, ldy);
          if (ldist < 65 && ldist > 1) {
            leaf.vx += vx * 0.05;
            leaf.vy += vy * 0.05;
            leaf.rotationSpeed += (Math.random() - 0.5) * 0.01;
          }
        });

        lastPointerRef.current = { x, y, time: now };
      }
    };

    const handlePointerUp = () => {
      isPointerDownRef.current = false;
      lastPointerRef.current = null;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    let lastTime = performance.now();
    let rainDropAcc = 0;

    // Main Animation Frame
    const render = (timeMs: number) => {
      const dt = Math.min(0.04, (timeMs - lastTime) / 1000);
      lastTime = timeMs;
      const t = timeMs * 0.001;

      // 1. CLEAR DEEP WATER BACKGROUND (Translucent motion blur tail)
      ctx.fillStyle = 'rgba(2, 6, 23, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Deep aquatic gradient ambient sheen
      const waterGrad = ctx.createLinearGradient(0, 0, 0, height);
      waterGrad.addColorStop(0, 'rgba(3, 7, 18, 0.05)');
      waterGrad.addColorStop(0.5, 'rgba(8, 20, 42, 0.08)');
      waterGrad.addColorStop(1, 'rgba(2, 6, 23, 0.12)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. SUBTLE CAUSTIC UNDULATING DEPTH CURRENTS
      ctx.lineWidth = 1.0;
      for (let i = 0; i < 7; i++) {
        const lineY = (height / 7) * i + Math.sin(t * 0.6 + i) * 12;
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.015 + 0.01 * Math.sin(t + i)})`;
        ctx.beginPath();
        for (let lx = 0; lx < width; lx += 24) {
          const ly = lineY + Math.sin(lx * 0.012 + t * 0.8 + i) * 8 + Math.cos(lx * 0.02 + t * 0.4) * 4;
          if (lx === 0) ctx.moveTo(lx, ly);
          else ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }

      // 3. MEDITATIVE TIDAL SWELL (BREATHING WAVE AT WATERLINE)
      // Natural 5-second breath cycle: rises and dissolves into light
      const breathPhase = (Math.sin(t * 0.85) + 1) * 0.5; // 0 to 1
      const tideY = height * 0.65 - breathPhase * 35;

      ctx.save();
      const tideGrad = ctx.createLinearGradient(0, tideY - 40, 0, height);
      tideGrad.addColorStop(0, `rgba(56, 189, 248, ${0.08 * breathPhase})`);
      tideGrad.addColorStop(0.5, `rgba(14, 165, 233, ${0.04 * breathPhase})`);
      tideGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = tideGrad;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 20) {
        const waveOffset = Math.sin(x * 0.015 + t * 1.2) * 12 * breathPhase + Math.sin(x * 0.03 - t * 0.7) * 6;
        ctx.lineTo(x, tideY + waveOffset);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Glowing tidal foam crest that smoothly dissolves into light
      ctx.strokeStyle = `rgba(186, 230, 253, ${0.35 * breathPhase})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 15) {
        const waveOffset = Math.sin(x * 0.015 + t * 1.2) * 12 * breathPhase + Math.sin(x * 0.03 - t * 0.7) * 6;
        if (x === 0) ctx.moveTo(x, tideY + waveOffset);
        else ctx.lineTo(x, tideY + waveOffset);
      }
      ctx.stroke();
      ctx.restore();

      // 4. AMBIENT RAIN DROPS (Gentle drops falling softly across the lake)
      rainDropAcc += 14 * dt;
      while (rainDropAcc >= 1) {
        rainDropAcc -= 1;
        const targetY = Math.random() * height;
        rainDropsRef.current.push({
          x: Math.random() * width,
          y: Math.max(-20, targetY - 140 - Math.random() * 120),
          targetY,
          speedY: 240 + Math.random() * 140,
          speedX: -8 + Math.random() * 16,
          length: 12 + Math.random() * 14,
          alpha: 0.2 + Math.random() * 0.35
        });
      }

      ctx.lineWidth = 1.0;
      for (let i = rainDropsRef.current.length - 1; i >= 0; i--) {
        const drop = rainDropsRef.current[i];
        drop.y += drop.speedY * dt;
        drop.x += drop.speedX * dt;

        ctx.strokeStyle = `rgba(186, 230, 253, ${drop.alpha})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.speedX * 0.04, drop.y - drop.length);
        ctx.stroke();

        // Impact on water
        if (drop.y >= drop.targetY) {
          createRipple(drop.x, drop.targetY, 'rgba(56, 189, 248, 0.45)', 45 + Math.random() * 25);
          if (Math.random() > 0.65) {
            waveAudio.playWaterDrop();
          }
          rainDropsRef.current.splice(i, 1);
        }
      }

      // 5. UPDATE & DRAW INTERACTIVE WAVE TRAILS (Fluid bioluminescent waves)
      for (let i = waveTrailsRef.current.length - 1; i >= 0; i--) {
        const wave = waveTrailsRef.current[i];
        wave.life += dt;
        const progress = wave.life / wave.maxLife;

        if (progress >= 1) {
          waveTrailsRef.current.splice(i, 1);
          continue;
        }

        wave.x += wave.vx * dt * 0.4;
        wave.y += wave.vy * dt * 0.4;
        wave.vx *= 0.94;
        wave.vy *= 0.94;

        const currentAlpha = (1 - progress) * wave.alpha;
        const currentRadius = wave.radius * (1 + progress * 0.8);

        ctx.save();
        const radGrad = ctx.createRadialGradient(
          wave.x,
          wave.y,
          1,
          wave.x,
          wave.y,
          currentRadius
        );
        radGrad.addColorStop(0, wave.color);
        radGrad.addColorStop(0.4, `rgba(56, 189, 248, ${currentAlpha * 0.6})`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. UPDATE & DRAW CONCENTRIC WATER RIPPLES
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        rip.radius += rip.speed * dt;
        const ripProgress = rip.radius / rip.maxRadius;

        if (ripProgress >= 1) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        const currentAlpha = (1 - ripProgress) * rip.alpha;

        ctx.strokeStyle = rip.color;
        ctx.globalAlpha = currentAlpha;
        ctx.lineWidth = rip.lineWidth * (1 - ripProgress * 0.5);

        ctx.beginPath();
        ctx.ellipse(
          rip.x,
          rip.y,
          rip.radius,
          rip.radius * 0.45, // Isometric perspective of water surface
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        // Inner secondary ripple
        if (rip.radius > 16) {
          ctx.beginPath();
          ctx.ellipse(
            rip.x,
            rip.y,
            rip.radius * 0.65,
            rip.radius * 0.65 * 0.45,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
      }

      // 7. UPDATE & DRAW DISSOLVING PHOSPHORESCENT PARTICLES
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += dt;
        const progress = p.life / p.maxLife;

        if (progress >= 1) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.96;
        p.vy *= 0.96;

        // Twinkle factor
        const twinkle = 0.7 + 0.3 * Math.sin(t * 5 + p.twinklePhase);
        const currentAlpha = (1 - progress) * p.alpha * twinkle;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.3), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 8. UPDATE & DRAW FLOATING ZEN RIVER LEAVES
      leavesRef.current.forEach((leaf) => {
        leaf.x += leaf.vx * dt;
        leaf.y += leaf.vy * dt;
        leaf.angle += leaf.rotationSpeed;
        leaf.vx *= 0.985;
        leaf.vy *= 0.985;

        // Gentle edge wrap / soft boundary bounce
        if (leaf.x < 30) leaf.vx += 0.4;
        if (leaf.x > width - 30) leaf.vx -= 0.4;
        if (leaf.y < 40) leaf.vy += 0.4;
        if (leaf.y > height - 40) leaf.vy -= 0.4;

        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);
        ctx.scale(leaf.scale, leaf.scale);

        // Water contact shadow
        ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
        ctx.beginPath();
        ctx.ellipse(3, 4, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Leaf body (Natural pointed willow/lotus petal)
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.quadraticCurveTo(0, -9, 16, 0);
        ctx.quadraticCurveTo(0, 9, -16, 0);
        ctx.fill();

        // Leaf central spine
        ctx.strokeStyle = leaf.stemColor;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(14, 0);
        ctx.stroke();

        ctx.restore();
      });

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
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#020617] text-stone-100 select-none overflow-hidden font-sans touch-none flex flex-col justify-between"
    >
      {/* TOP BAR: ONLY RETURN ARROW (ZERO CLUTTER, SAME AS SAND, TREE, STONE) */}
      <header className="absolute top-4 left-4 z-30 pointer-events-none">
        <button
          type="button"
          onClick={() => onSwitchTab?.('counter')}
          className="pointer-events-auto w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-800/90 active:scale-95 border border-slate-700/50 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
          title="Повернутися"
          aria-label="Повернутися"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </header>

      {/* FULL-SCREEN LIVING WATER CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full cursor-pointer touch-none"
      />
    </div>
  );
};
