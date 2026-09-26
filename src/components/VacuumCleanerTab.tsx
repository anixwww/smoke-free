import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  Play,
  Zap,
  Shield,
  Wind,
  Compass,
  Flame,
  Award
} from 'lucide-react';

interface VacuumCleanerTabProps {
  onSwitchTab: (tab: any) => void;
  cigsAvoided?: number;
}

interface SmokeDebris {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'tar' | 'ash' | 'oxygen' | 'gem';
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

class VacuumAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSuck() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.1);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playPulse() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

export const VacuumCleanerTab: React.FC<VacuumCleanerTabProps> = ({
  onSwitchTab,
  cigsAvoided = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<VacuumAudio>(new VacuumAudio());

  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'VICTORY'>('READY');
  const [score, setScore] = useState<number>(0);
  const [cleanPct, setCleanPct] = useState<number>(0);
  const [pulseEnergy, setPulseEnergy] = useState<number>(100);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('quit-smoking:vacuum-highscore') || 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    audioRef.current.enabled = soundEnabled;
  }, [soundEnabled]);

  // Ship Position & Physics
  const shipRef = useRef({
    x: 150,
    y: 250,
    vx: 0,
    vy: 0,
    radius: 20,
    vacuumRadius: 90
  });

  const debrisRef = useRef<SmokeDebris[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const totalDebrisCountRef = useRef<number>(60);
  const collectedDebrisCountRef = useRef<number>(0);

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

  // Start new cleaning voyage
  const startCleaning = () => {
    setScore(0);
    setCleanPct(0);
    setPulseEnergy(100);
    collectedDebrisCountRef.current = 0;

    const canvas = canvasRef.current;
    const w = canvas ? canvas.clientWidth : 340;
    const h = canvas ? canvas.clientHeight : 450;

    shipRef.current.x = w / 2;
    shipRef.current.y = h / 2;
    shipRef.current.vx = 0;
    shipRef.current.vy = 0;

    // Spawn cosmic smoke debris
    const list: SmokeDebris[] = [];
    const count = 60;
    totalDebrisCountRef.current = count;

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let type: SmokeDebris['type'] = 'tar';
      let r = 8 + Math.random() * 8;

      if (rand < 0.15) {
        type = 'gem';
        r = 10;
      } else if (rand < 0.35) {
        type = 'oxygen';
        r = 12;
      } else if (rand < 0.6) {
        type = 'ash';
        r = 6;
      }

      list.push({
        id: Math.random().toString(),
        x: 30 + Math.random() * (w - 60),
        y: 30 + Math.random() * (h - 60),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: r,
        type,
        collected: false
      });
    }

    debrisRef.current = list;
    setGameState('PLAYING');
    audioRef.current.playPulse();
  };

  // Trigger Vacuum Pulse Wave (Sucks all debris nearby instantly)
  const castVacuumPulse = () => {
    if (pulseEnergy < 30 || gameState !== 'PLAYING') return;

    setPulseEnergy((prev) => Math.max(0, prev - 35));
    audioRef.current.playPulse();

    const ship = shipRef.current;
    debrisRef.current.forEach((d) => {
      if (!d.collected) {
        const dx = ship.x - d.x;
        const dy = ship.y - d.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 220) {
          d.vx += (dx / dist) * 12;
          d.vy += (dy / dist) * 12;
        }
      }
    });

    // Pulse Wave Particles
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      particlesRef.current.push({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8,
        radius: 4,
        color: '#38bdf8',
        alpha: 1
      });
    }
  };

  // Touch / Mouse Move to Steer Vacuum Ship
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ship = shipRef.current;
    ship.x += (x - ship.x) * 0.15;
    ship.y += (y - ship.y) * 0.15;
  };

  // Main Canvas Animation Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const canvas = canvasRef.current;
      if (canvas && gameState === 'PLAYING') {
        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const ship = shipRef.current;

        if (ctx) {
          ctx.clearRect(0, 0, width, height);

          // Deep Cosmic Space Background
          ctx.fillStyle = '#030712';
          ctx.fillRect(0, 0, width, height);

          // Starfield
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          for (let s = 0; s < 40; s++) {
            const sx = (s * 37) % width;
            const sy = (s * 53) % height;
            ctx.fillRect(sx, sy, 1.5, 1.5);
          }

          // Energy Recharge over time
          setPulseEnergy((e) => Math.min(100, e + 0.2));

          // 1. Draw Magnetic Vacuum Field Ring around Ship
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(ship.x, ship.y, ship.vacuumRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // 2. Update & Draw Debris Particles
          const debris = debrisRef.current;
          debris.forEach((d) => {
            if (d.collected) return;

            d.x += d.vx;
            d.y += d.vy;

            // Bounce off walls
            if (d.x < 15 || d.x > width - 15) d.vx *= -1;
            if (d.y < 15 || d.y > height - 15) d.vy *= -1;

            // Vacuum Magnetic Pull towards ship
            const dx = ship.x - d.x;
            const dy = ship.y - d.y;
            const dist = Math.hypot(dx, dy) || 1;

            if (dist < ship.vacuumRadius) {
              const pullForce = (ship.vacuumRadius - dist) / ship.vacuumRadius;
              d.vx += (dx / dist) * pullForce * 0.8;
              d.vy += (dy / dist) * pullForce * 0.8;
            }

            // Collection Check
            if (dist < ship.radius + d.radius) {
              d.collected = true;
              audioRef.current.playSuck();
              collectedDebrisCountRef.current++;

              const pts = d.type === 'gem' ? 30 : d.type === 'oxygen' ? 20 : 10;
              setScore((prev) => {
                const next = prev + pts;
                if (next > highScore) {
                  setHighScore(next);
                  try {
                    localStorage.setItem('quit-smoking:vacuum-highscore', String(next));
                  } catch {}
                }
                return next;
              });

              // Sparkles on collection
              for (let k = 0; k < 8; k++) {
                particlesRef.current.push({
                  x: d.x,
                  y: d.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  radius: 2 + Math.random() * 3,
                  color: d.type === 'gem' ? '#f59e0b' : d.type === 'oxygen' ? '#38bdf8' : '#34d399',
                  alpha: 1
                });
              }

              // Update Clean Percentage
              const pct = Math.round((collectedDebrisCountRef.current / totalDebrisCountRef.current) * 100);
              setCleanPct(pct);

              if (pct >= 100) {
                setGameState('VICTORY');
              }
            }

            // Draw Debris Graphics
            ctx.save();
            ctx.translate(d.x, d.y);
            if (d.type === 'tar') {
              // Dark Tar Blob
              ctx.fillStyle = '#451a03';
              ctx.beginPath();
              ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#78350f';
              ctx.beginPath();
              ctx.arc(-2, -2, d.radius * 0.4, 0, Math.PI * 2);
              ctx.fill();
            } else if (d.type === 'ash') {
              // Grey Ash Flake
              ctx.fillStyle = '#78716c';
              ctx.beginPath();
              ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
              ctx.fill();
            } else if (d.type === 'oxygen') {
              // Glowing Cyan Oxygen Sphere
              ctx.fillStyle = '#06b6d4';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Gold Stardust Gem
              ctx.fillStyle = '#fbbf24';
              ctx.shadowColor = '#f59e0b';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          });

          // 3. Update & Draw Particles
          for (let p = particlesRef.current.length - 1; p >= 0; p--) {
            const part = particlesRef.current[p];
            part.x += part.vx;
            part.y += part.vy;
            part.alpha -= 0.03;

            if (part.alpha <= 0) {
              particlesRef.current.splice(p, 1);
              continue;
            }

            ctx.save();
            ctx.globalAlpha = part.alpha;
            ctx.fillStyle = part.color;
            ctx.beginPath();
            ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // 4. Draw Clean Oxygen Ship
          ctx.save();
          ctx.translate(ship.x, ship.y);

          // Ship Body
          ctx.fillStyle = '#0284c7';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, ship.radius, 0, Math.PI * 2);
          ctx.fill();

          // Glass Canopy
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.arc(-3, -3, ship.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto select-none relative overflow-hidden bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-30">
        <button
          type="button"
          onClick={() => onSwitchTab('counter')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {/* Cleaning % Progress */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700 text-xs">
          <Wind className="w-4 h-4 text-cyan-400" />
          <span className="font-mono font-bold text-cyan-300">Очищено: {cleanPct}%</span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all active:scale-95"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </header>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative w-full h-[450px] touch-none">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Pulse Skill Button */}
        {gameState === 'PLAYING' && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex flex-col gap-1 w-32 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-mono">Енергія хвилі</span>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div className="h-full bg-cyan-400 transition-all duration-150" style={{ width: `${pulseEnergy}%` }} />
              </div>
            </div>

            <button
              type="button"
              onClick={castVacuumPulse}
              disabled={pulseEnergy < 30}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer ${
                pulseEnergy >= 30
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:brightness-110 shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Всмоктуючий Імпульс</span>
            </button>
          </div>
        )}

        {/* Ready / Victory Overlays */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl mb-3 shadow-xl shadow-cyan-500/20">
              🚀
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Космічний Пилосос Легень</h2>
            <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
              Керуйте кисневим кораблем-очисником! Всмоктуйте смолу, попіл та тютюнові хмари у вакуумне поле до 100% чистоти!
            </p>

            <button
              type="button"
              onClick={startCleaning}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Запустити очищення</span>
            </button>
          </div>
        )}

        {gameState === 'VICTORY' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mb-3">
              👑
            </div>
            <h3 className="text-2xl font-black text-emerald-400 mb-1">100% Киснева Свобода!</h3>
            <p className="text-xs text-slate-300 max-w-xs mb-5">
              Вся смола та тютюновий пил повністю вилучені з космічного простору легень!
            </p>

            <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 mb-5 text-center">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Фінальний рахунок</span>
              <span className="text-2xl font-black text-amber-400 tabular-nums">{score}</span>
            </div>

            <button
              type="button"
              onClick={startCleaning}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Очистити знову</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
