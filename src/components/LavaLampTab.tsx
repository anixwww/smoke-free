import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Palette,
  Sparkles,
  Flame,
  Sun,
  Droplets,
  Sliders,
  Moon
} from 'lucide-react';

interface LavaLampTabProps {
  onSwitchTab: (tab: any) => void;
}

interface LavaTheme {
  id: string;
  name: string;
  waxColor1: string;
  waxColor2: string;
  liquidBg1: string;
  liquidBg2: string;
  glowColor: string;
}

const LAVA_THEMES: LavaTheme[] = [
  {
    id: 'sunset',
    name: 'Неоновий Захід',
    waxColor1: '#f97316',
    waxColor2: '#ec4899',
    liquidBg1: '#180728',
    liquidBg2: '#3b0764',
    glowColor: 'rgba(236, 72, 153, 0.4)'
  },
  {
    id: 'emerald',
    name: 'Смарагдовий Дзен',
    waxColor1: '#10b981',
    waxColor2: '#06b6d4',
    liquidBg1: '#022c22',
    liquidBg2: '#064e3b',
    glowColor: 'rgba(16, 185, 129, 0.4)'
  },
  {
    id: 'ocean',
    name: 'Океанічна Глибина',
    waxColor1: '#38bdf8',
    waxColor2: '#6366f1',
    liquidBg1: '#030712',
    liquidBg2: '#0f172a',
    glowColor: 'rgba(56, 189, 248, 0.4)'
  },
  {
    id: 'amber',
    name: 'Теплий Бурштин',
    waxColor1: '#f59e0b',
    waxColor2: '#dc2626',
    liquidBg1: '#1c1917',
    liquidBg2: '#292524',
    glowColor: 'rgba(245, 158, 11, 0.4)'
  },
  {
    id: 'lavender',
    name: 'Лавандовий Спокій',
    waxColor1: '#c084fc',
    waxColor2: '#a855f7',
    liquidBg1: '#1e1b4b',
    liquidBg2: '#2e1065',
    glowColor: 'rgba(192, 132, 252, 0.4)'
  }
];

interface WaxBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  temp: number; // 0 (cold at top) to 1 (hot at bottom)
  phase: number;
}

export const LavaLampTab: React.FC<LavaLampTabProps> = ({ onSwitchTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedThemeIdx, setSelectedThemeIdx] = useState<number>(0);
  const currentTheme = LAVA_THEMES[selectedThemeIdx];

  const [heatLevel, setHeatLevel] = useState<number>(1.0); // 0.5 to 2.0
  const [viscosity, setViscosity] = useState<number>(1.0); // speed factor
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Audio Ambient Hum via Web Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const humGainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        audioCtxRef.current = ctx;

        // Warm low frequency soothing drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(108, ctx.currentTime); // 108 Hz meditative tone
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110, ctx.currentTime); // 2Hz gentle binaural beat

        gain.gain.setValueAtTime(soundEnabled ? 0.04 : 0, ctx.currentTime);
        humGainRef.current = gain;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
      }
    }
  };

  useEffect(() => {
    if (humGainRef.current && audioCtxRef.current) {
      humGainRef.current.gain.setValueAtTime(soundEnabled ? 0.04 : 0, audioCtxRef.current.currentTime);
    }
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Wax Blobs Array
  const blobsRef = useRef<WaxBlob[]>([]);

  // Initialize Blobs
  useEffect(() => {
    const blobs: WaxBlob[] = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const r = 24 + Math.random() * 32;
      blobs.push({
        x: 100 + Math.random() * 120,
        y: 100 + Math.random() * 300,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.6,
        radius: r,
        baseRadius: r,
        temp: Math.random(),
        phase: Math.random() * Math.PI * 2
      });
    }
    blobsRef.current = blobs;
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = Math.max(450, rect.height) * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Touch / Mouse Ripple Interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    initAudio();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Push nearby blobs away gently
    blobsRef.current.forEach((b) => {
      const dx = b.x - x;
      const dy = b.y - y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 120) {
        const force = (120 - dist) / 120;
        b.vx += (dx / dist) * force * 3;
        b.vy += (dy / dist) * force * 3;
        b.temp = Math.min(1.0, b.temp + 0.3); // heat up
      }
    });
  };

  // Main Canvas Simulation Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const theme = LAVA_THEMES[selectedThemeIdx];

        if (ctx) {
          ctx.clearRect(0, 0, width, height);

          // 1. Lamp Glass Vessel Bounds
          const lampTopY = 30;
          const lampBottomY = height - 30;
          const lampCenterX = width / 2;
          const lampTopW = Math.min(width * 0.5, 140);
          const lampMidW = Math.min(width * 0.72, 220);
          const lampBottomW = Math.min(width * 0.58, 170);

          // Background Liquid Gradient inside lamp
          const liquidGrad = ctx.createLinearGradient(0, lampTopY, 0, lampBottomY);
          liquidGrad.addColorStop(0, theme.liquidBg1);
          liquidGrad.addColorStop(1, theme.liquidBg2);

          // Draw Lamp Glass Container Path
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(lampCenterX - lampTopW / 2, lampTopY);
          ctx.bezierCurveTo(
            lampCenterX - lampMidW / 2,
            height * 0.35,
            lampCenterX - lampMidW / 2,
            height * 0.65,
            lampCenterX - lampBottomW / 2,
            lampBottomY
          );
          ctx.lineTo(lampCenterX + lampBottomW / 2, lampBottomY);
          ctx.bezierCurveTo(
            lampCenterX + lampMidW / 2,
            height * 0.65,
            lampCenterX + lampMidW / 2,
            height * 0.35,
            lampCenterX + lampTopW / 2,
            lampTopY
          );
          ctx.closePath();

          ctx.fillStyle = liquidGrad;
          ctx.fill();

          // Clip to inside lamp for liquid & wax blobs
          ctx.clip();

          // 2. Update & Draw Organic Wax Metaballs
          const blobs = blobsRef.current;
          blobs.forEach((b) => {
            b.phase += 0.02 * viscosity;

            // Heat convection physics:
            // Near bottom -> heats up -> becomes lighter and floats up
            // Near top -> cools down -> becomes heavier and sinks
            if (b.y > lampBottomY - 60) {
              b.temp = Math.min(1.0, b.temp + 0.008 * heatLevel);
            } else if (b.y < lampTopY + 60) {
              b.temp = Math.max(0.0, b.temp - 0.006);
            }

            const buoyancy = (b.temp - 0.48) * -0.5 * heatLevel;
            b.vy += buoyancy * 0.05 * viscosity;

            // Slight organic horizontal drift
            b.vx += Math.sin(b.phase) * 0.02 * viscosity;

            // Damping / Viscosity friction
            b.vx *= 0.96;
            b.vy *= 0.96;

            b.x += b.vx;
            b.y += b.vy;

            // Boundary constraints inside lamp
            const currentLampW = lampMidW;
            const minX = lampCenterX - currentLampW * 0.38 + b.radius;
            const maxX = lampCenterX + currentLampW * 0.38 - b.radius;

            if (b.x < minX) {
              b.x = minX;
              b.vx *= -0.5;
            }
            if (b.x > maxX) {
              b.x = maxX;
              b.vx *= -0.5;
            }

            if (b.y < lampTopY + b.radius * 0.6) {
              b.y = lampTopY + b.radius * 0.6;
              b.vy *= -0.3;
            }
            if (b.y > lampBottomY - b.radius * 0.6) {
              b.y = lampBottomY - b.radius * 0.6;
              b.vy *= -0.3;
            }

            // Draw glowing wax blob
            const blobGrad = ctx.createRadialGradient(
              b.x - b.radius * 0.2,
              b.y - b.radius * 0.2,
              b.radius * 0.1,
              b.x,
              b.y,
              b.radius
            );
            blobGrad.addColorStop(0, '#ffffff');
            blobGrad.addColorStop(0.35, theme.waxColor1);
            blobGrad.addColorStop(0.85, theme.waxColor2);
            blobGrad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = blobGrad;
            ctx.shadowColor = theme.glowColor;
            ctx.shadowBlur = 18;
            ctx.beginPath();
            // Undulating organic blob shape
            const deformY = 1 + Math.sin(b.phase * 1.5) * 0.12;
            const deformX = 1 - Math.sin(b.phase * 1.5) * 0.08;
            ctx.ellipse(b.x, b.y, b.radius * deformX, b.radius * deformY, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          ctx.restore();

          // 3. Draw Metallic Base & Cap of the Lamp
          // Top Cap
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(lampCenterX - lampTopW * 0.6, lampTopY - 18, lampTopW * 1.2, 20, [8, 8, 0, 0]);
          ctx.fill();

          // Bottom Base Stand
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(lampCenterX - lampBottomW * 0.7, lampBottomY, lampBottomW * 1.4, 28, [0, 0, 12, 12]);
          ctx.fill();

          // Heating Element Glow at the bottom base
          const heaterGrad = ctx.createRadialGradient(lampCenterX, lampBottomY, 5, lampCenterX, lampBottomY, 60);
          heaterGrad.addColorStop(0, 'rgba(249, 115, 22, 0.8)');
          heaterGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
          ctx.fillStyle = heaterGrad;
          ctx.beginPath();
          ctx.arc(lampCenterX, lampBottomY, 60, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [selectedThemeIdx, heatLevel, viscosity]);

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto select-none relative overflow-hidden bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-30">
        <button
          type="button"
          onClick={() => onSwitchTab('counter')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">{currentTheme.name}</span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all active:scale-95"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </header>

      {/* Theme Palettes Carousel */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
        {LAVA_THEMES.map((th, idx) => (
          <button
            key={th.id}
            type="button"
            onClick={() => setSelectedThemeIdx(idx)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedThemeIdx === idx
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-pink-500/20 scale-105'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full border border-white/40"
              style={{ background: `linear-gradient(135deg, ${th.waxColor1}, ${th.waxColor2})` }}
            />
            <span>{th.name}</span>
          </button>
        ))}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative w-full h-[450px] touch-none">
        <canvas ref={canvasRef} onPointerDown={handlePointerDown} className="w-full h-full block cursor-pointer" />

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-slate-400 pointer-events-none">
          Торкніться воску, щоб створити тепловий імпульс
        </div>
      </div>

      {/* Controls Bar (Heat & Speed) */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-4 grid grid-cols-2 gap-4 z-30 text-xs">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Температура:</span>
            </span>
            <span className="font-mono text-amber-300 font-bold">{Math.round(heatLevel * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="2.0"
            step="0.1"
            value={heatLevel}
            onChange={(e) => setHeatLevel(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Плинність:</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">{Math.round(viscosity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.2"
            step="0.1"
            value={viscosity}
            onChange={(e) => setViscosity(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
