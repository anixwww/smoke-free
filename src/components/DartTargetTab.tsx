import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Play,
  Target,
  Sparkles,
  Flame,
  Award,
  Wind,
  Crosshair
} from 'lucide-react';

interface DartTargetTabProps {
  onSwitchTab: (tab: any) => void;
  cigsAvoided?: number;
}

interface MovingTarget {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'pack' | 'cig' | 'bullseye';
  vx: number;
  vy: number;
  isHit: boolean;
}

interface ArrowProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  life: number;
}

class DartAudio {
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

  playRelease() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playBullseye() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523, 659, 783, 1046];
      notes.forEach((f, i) => {
        const now = this.ctx!.currentTime + i * 0.07;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch (e) {}
  }
}

export const DartTargetTab: React.FC<DartTargetTabProps> = ({ onSwitchTab, cigsAvoided = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<DartAudio>(new DartAudio());

  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAME_OVER'>('READY');
  const [score, setScore] = useState<number>(0);
  const [arrowsLeft, setArrowsLeft] = useState<number>(15);
  const [windForce, setWindForce] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('quit-smoking:dart-highscore') || 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    audioRef.current.enabled = soundEnabled;
  }, [soundEnabled]);

  const bowRef = useRef({
    x: 170,
    y: 420,
    angle: -Math.PI / 2,
    power: 12,
    isPulling: false,
    pullStartX: 0,
    pullStartY: 0
  });

  const targetsRef = useRef<MovingTarget[]>([]);
  const arrowRef = useRef<ArrowProjectile | null>(null);

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

  const startArchery = () => {
    setScore(0);
    setArrowsLeft(15);
    setWindForce((Math.random() - 0.5) * 2);

    const canvas = canvasRef.current;
    const w = canvas ? canvas.clientWidth : 340;
    const h = canvas ? canvas.clientHeight : 450;

    bowRef.current.x = w / 2;
    bowRef.current.y = h - 50;

    // Spawn initial moving targets
    const list: MovingTarget[] = [];
    for (let i = 0; i < 5; i++) {
      list.push({
        id: Math.random().toString(),
        x: 40 + Math.random() * (w - 80),
        y: 80 + i * 50,
        radius: 20 + Math.random() * 10,
        type: i === 0 ? 'bullseye' : i % 2 === 0 ? 'pack' : 'cig',
        vx: (Math.random() - 0.5) * 2.2,
        vy: 0,
        isHit: false
      });
    }
    targetsRef.current = list;
    arrowRef.current = null;
    setGameState('PLAYING');
  };

  // Aim & Shoot Input
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING' || arrowRef.current || arrowsLeft <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const bow = bowRef.current;
    bow.isPulling = true;
    bow.pullStartX = x;
    bow.pullStartY = y;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const bow = bowRef.current;
    if (!bow.isPulling) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - bow.x;
    const dy = y - bow.y;
    bow.angle = Math.atan2(dy, dx);
  };

  const handlePointerUp = () => {
    const bow = bowRef.current;
    if (!bow.isPulling || arrowRef.current) return;
    bow.isPulling = false;

    // Release Arrow
    audioRef.current.playRelease();
    setArrowsLeft((a) => a - 1);

    const speed = 14;
    arrowRef.current = {
      x: bow.x,
      y: bow.y - 15,
      vx: Math.cos(bow.angle) * speed,
      vy: Math.sin(bow.angle) * speed,
      angle: bow.angle,
      life: 120
    };
  };

  // Main Archery Canvas Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const canvas = canvasRef.current;
      if (canvas && gameState === 'PLAYING') {
        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const bow = bowRef.current;

        if (ctx) {
          ctx.clearRect(0, 0, width, height);

          // Deep Blue Range Background
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);

          // Target Shooting Line at bottom
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, bow.y);
          ctx.lineTo(width, bow.y);
          ctx.stroke();

          // 1. Update & Draw Moving Targets
          const targets = targetsRef.current;
          targets.forEach((t) => {
            if (t.isHit) return;

            t.x += t.vx;
            if (t.x < 30 || t.x > width - 30) t.vx *= -1;

            ctx.save();
            ctx.translate(t.x, t.y);

            if (t.type === 'bullseye') {
              // Concentric Target Rings
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(0, 0, t.radius * 0.65, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(0, 0, t.radius * 0.3, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Cigarette Pack / Cig Target
              ctx.fillStyle = '#dc2626';
              ctx.fillRect(-t.radius, -t.radius * 1.2, t.radius * 2, t.radius * 2.4);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 9px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('ЦІЛЬ', 0, 3);
            }

            ctx.restore();
          });

          // 2. Update & Draw Active Arrow
          const arrow = arrowRef.current;
          if (arrow) {
            // Apply wind affect
            arrow.vx += windForce * 0.04;
            arrow.vy += 0.08; // slight gravity arc
            arrow.x += arrow.vx;
            arrow.y += arrow.vy;
            arrow.angle = Math.atan2(arrow.vy, arrow.vx);
            arrow.life--;

            // Draw Arrow
            ctx.save();
            ctx.translate(arrow.x, arrow.y);
            ctx.rotate(arrow.angle);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(-15, -2, 30, 4);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(15, -4);
            ctx.lineTo(22, 0);
            ctx.lineTo(15, 4);
            ctx.fill();
            ctx.restore();

            // Collision with targets
            targets.forEach((t) => {
              if (!t.isHit && Math.hypot(arrow.x - t.x, arrow.y - t.y) < t.radius + 8) {
                t.isHit = true;
                arrowRef.current = null;
                audioRef.current.playBullseye();

                const pts = t.type === 'bullseye' ? 100 : 50;
                setScore((s) => {
                  const next = s + pts;
                  if (next > highScore) {
                    setHighScore(next);
                    try {
                      localStorage.setItem('quit-smoking:dart-highscore', String(next));
                    } catch {}
                  }
                  return next;
                });

                // Spawn new replacement target
                setTimeout(() => {
                  t.x = 40 + Math.random() * (width - 80);
                  t.isHit = false;
                }, 1000);
              }
            });

            // Arrow out of bounds
            if (arrow.life <= 0 || arrow.y > height || arrow.x < 0 || arrow.x > width) {
              arrowRef.current = null;
              if (arrowsLeft <= 0) {
                setGameState('GAME_OVER');
              }
            }
          }

          // 3. Draw Player Bow & Trajectory Line
          ctx.save();
          ctx.translate(bow.x, bow.y);

          // Trajectory Preview
          if (bow.isPulling && !arrow) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(bow.angle) * 80, Math.sin(bow.angle) * 80);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Bow Arc
          ctx.rotate(bow.angle);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 24, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, windForce, arrowsLeft, highScore]);

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

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-mono uppercase">Очки</span>
            <span className="text-sm font-black text-amber-400 tabular-nums">{score}</span>
          </div>

          <div className="flex flex-col items-center bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
            <span className="text-[8px] text-sky-400 uppercase font-bold">Стріли</span>
            <span className="text-xs font-black text-sky-300">{arrowsLeft}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all active:scale-95"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </header>

      {/* Main Archery Viewport */}
      <div className="flex-1 relative w-full h-[450px] touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Start / Game Over Overlay */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-3xl mb-3 shadow-xl shadow-sky-500/20">
              🎯
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Стрільба по Недопалках</h2>
            <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
              Прицілюйтеся луком, цільтеся в рухомі сигаретені пачки та мішені! Вибивайте яблучка для максимальних очок!
            </p>

            <button
              type="button"
              onClick={startArchery}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white font-black text-sm shadow-xl hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Почати стрільбу (15 стріл)</span>
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mb-3">
              🎯
            </div>
            <h3 className="text-2xl font-black text-emerald-400 mb-1">Стріли вичерпано!</h3>
            <p className="text-xs text-slate-400 mb-5">Влучна стрільба! Всі цілі розбито!</p>

            <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 mb-5 text-center">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Фінальний рахунок</span>
              <span className="text-2xl font-black text-amber-400 tabular-nums">{score}</span>
            </div>

            <button
              type="button"
              onClick={startArchery}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-black text-sm shadow-xl hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Зіграти ще раз</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
