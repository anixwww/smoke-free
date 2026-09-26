import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Gauge,
  Sparkles,
  Flame,
  Layers,
  Award,
  Play,
  Pause
} from 'lucide-react';

interface HydraulicPressTabProps {
  onSwitchTab: (tab: any) => void;
  cigsAvoided?: number;
}

interface CrushableItem {
  id: string;
  name: string;
  type: 'pack' | 'ashtray' | 'lighter' | 'vape' | 'cigar' | 'carton';
  icon: string;
  desc: string;
  maxTons: number;
  crushThreshold: number; // 0..1 when it starts cracking
  squashFactor: number;
  debrisColor: string[];
  hasSparks?: boolean;
  hasLiquid?: boolean;
}

const CRUSHABLE_ITEMS: CrushableItem[] = [
  {
    id: 'pack_red',
    name: 'Червона пачка сигарет',
    type: 'pack',
    icon: '📦',
    desc: 'Класична картонна пачка з 20 сигаретами. Тріщить і розсипається на тютюновий пил.',
    maxTons: 25,
    crushThreshold: 0.2,
    squashFactor: 0.12,
    debrisColor: ['#ef4444', '#ffffff', '#d97706', '#78716c', '#451a03']
  },
  {
    id: 'lighter_gas',
    name: 'Пластикова запальничка',
    type: 'lighter',
    icon: '🔥',
    desc: 'Наповнена газом запальничка. При 40 тоннах лускає з яскравими іскрами!',
    maxTons: 40,
    crushThreshold: 0.45,
    squashFactor: 0.08,
    debrisColor: ['#3b82f6', '#0284c7', '#fbbf24', '#ffffff'],
    hasSparks: true,
    hasLiquid: true
  },
  {
    id: 'metal_ashtray',
    name: 'Металева попільничка',
    type: 'ashtray',
    icon: '🔘',
    desc: 'Товстостінна важка попільничка з недопалками. Згинається та деформується в млинець.',
    maxTons: 75,
    crushThreshold: 0.35,
    squashFactor: 0.15,
    debrisColor: ['#94a3b8', '#64748b', '#475569', '#d97706', '#292524']
  },
  {
    id: 'vape_pod',
    name: 'Одноразовий вейп',
    type: 'vape',
    icon: '🔋',
    desc: 'Електронний пристрій з літієвою батареєю. Розчавлюється з тріскотом плати.',
    maxTons: 50,
    crushThreshold: 0.4,
    squashFactor: 0.1,
    debrisColor: ['#a855f7', '#ec4899', '#38bdf8', '#0f172a'],
    hasSparks: true
  },
  {
    id: 'luxury_cigar',
    name: 'Дорога сигара',
    type: 'cigar',
    icon: '🪵',
    desc: 'Щільна товста сигара в золотому кільці. Розплющується на волокна.',
    maxTons: 30,
    crushThreshold: 0.25,
    squashFactor: 0.14,
    debrisColor: ['#451a03', '#78350f', '#fbbf24', '#78716c']
  },
  {
    id: 'full_carton',
    name: 'Цілий блок (10 пачок)',
    type: 'carton',
    icon: '🏢',
    desc: 'Величезний блок тютюну. Потребує повних 100 тонн тиску для тотального знищення!',
    maxTons: 100,
    crushThreshold: 0.15,
    squashFactor: 0.18,
    debrisColor: ['#ef4444', '#ffffff', '#d97706', '#1e293b']
  }
];

class PressAudio {
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

  playCrunch(progress: number) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Mechanical low drone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60 + progress * 80, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playPop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392.0, 523.25];
      notes.forEach((f, i) => {
        const now = this.ctx!.currentTime + i * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch (e) {}
  }
}

interface DebrisParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
}

export const HydraulicPressTab: React.FC<HydraulicPressTabProps> = ({
  onSwitchTab,
  cigsAvoided = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<PressAudio>(new PressAudio());

  const [selectedItemIdx, setSelectedItemIdx] = useState<number>(0);
  const currentItem = CRUSHABLE_ITEMS[selectedItemIdx];

  // Press State: 0 (top) to 1.0 (fully crushed at bottom)
  const [pressProgress, setPressProgress] = useState<number>(0);
  const pressProgressRef = useRef<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [isFullyCrushed, setIsFullyCrushed] = useState<boolean>(false);
  const [totalCrushedCount, setTotalCrushedCount] = useState<number>(0);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const debrisRef = useRef<DebrisParticle[]>([]);
  const hasPoppedRef = useRef<boolean>(false);

  useEffect(() => {
    audioRef.current.enabled = soundEnabled;
  }, [soundEnabled]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = Math.max(400, rect.height) * dpr;
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

  // Reset current item
  const resetPress = () => {
    setPressProgress(0);
    pressProgressRef.current = 0;
    setIsFullyCrushed(false);
    hasPoppedRef.current = false;
    debrisRef.current = [];
  };

  // Switch item
  const handleSelectItem = (idx: number) => {
    setSelectedItemIdx(idx);
    resetPress();
  };

  // Continuous Press Loop when holding button
  useEffect(() => {
    let intervalId: any;
    if (isPressing && !isFullyCrushed) {
      intervalId = setInterval(() => {
        setPressProgress((prev) => {
          const next = Math.min(1.0, prev + 0.012);
          pressProgressRef.current = next;

          if (next > currentItem.crushThreshold) {
            audioRef.current.playCrunch(next);

            // Spawn flying fragments
            if (Math.random() < 0.6) {
              const canvas = canvasRef.current;
              const w = canvas ? canvas.clientWidth : 300;
              const h = canvas ? canvas.clientHeight : 400;
              const baseY = h * 0.72;

              for (let k = 0; k < 4; k++) {
                debrisRef.current.push({
                  x: w / 2 + (Math.random() - 0.5) * 80,
                  y: baseY - next * 40,
                  vx: (Math.random() - 0.5) * 9,
                  vy: -Math.random() * 6 - 2,
                  width: 3 + Math.random() * 7,
                  height: 3 + Math.random() * 7,
                  color: currentItem.debrisColor[Math.floor(Math.random() * currentItem.debrisColor.length)],
                  rotation: Math.random() * Math.PI,
                  vRot: (Math.random() - 0.5) * 0.2,
                  alpha: 1
                });
              }
            }

            if (currentItem.hasSparks && next > 0.6 && !hasPoppedRef.current) {
              hasPoppedRef.current = true;
              audioRef.current.playPop();
            }
          }

          if (next >= 1.0) {
            setIsFullyCrushed(true);
            setIsPressing(false);
            setTotalCrushedCount((c) => c + 1);
            audioRef.current.playVictory();
          }
          return next;
        });
      }, 30);
    }
    return () => clearInterval(intervalId);
  }, [isPressing, isFullyCrushed, currentItem]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const progress = pressProgressRef.current;

        if (ctx) {
          ctx.clearRect(0, 0, width, height);

          // 1. Industrial Dark Background
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);

          // Warning hazard stripes on top & bottom borders
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, width, 18);
          ctx.fillRect(0, height - 18, width, 18);

          // 2. Heavy Steel Hydraulic Columns
          const colW = 32;
          ctx.fillStyle = '#334155';
          ctx.fillRect(20, 0, colW, height);
          ctx.fillRect(width - 20 - colW, 0, colW, height);

          // Column chrome highlights
          ctx.fillStyle = '#64748b';
          ctx.fillRect(26, 0, 8, height);
          ctx.fillRect(width - 20 - colW + 6, 0, 8, height);

          // 3. Steel Anvil Base Platform
          const anvilY = height * 0.72;
          const anvilH = 50;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(40, anvilY, width - 80, anvilH);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3;
          ctx.strokeRect(40, anvilY, width - 80, anvilH);

          // 4. Hydraulic Piston Cylinder & Piston Head
          const pistonMaxTravel = anvilY - 90;
          const pistonCurrentY = 40 + progress * pistonMaxTravel;
          const pistonW = width - 110;
          const pistonH = 45;

          // Upper Shaft
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(width / 2 - 28, 0, 56, pistonCurrentY);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(width / 2 - 16, 0, 12, pistonCurrentY);

          // Heavy Hardened Steel Piston Head
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(width / 2 - pistonW / 2, pistonCurrentY, pistonW, pistonH);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(width / 2 - pistonW / 2, pistonCurrentY, pistonW, pistonH);

          // 5. Draw Crushable Target Item on Anvil
          const itemOriginalW = 85;
          const itemOriginalH = 110;
          // Compression height scales down with progress, width bulges outwards
          const currentItemH = Math.max(8, itemOriginalH * (1 - progress * (1 - currentItem.squashFactor)));
          const currentItemW = itemOriginalW * (1 + progress * 1.4);
          const itemY = anvilY - currentItemH;
          const itemX = width / 2 - currentItemW / 2;

          ctx.save();
          if (currentItem.type === 'pack') {
            // Cigarette Pack Graphic
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(itemX, itemY, currentItemW, currentItemH);

            // White top foil
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(itemX, itemY, currentItemW, currentItemH * 0.3);

            // Warning label
            ctx.fillStyle = '#000000';
            ctx.fillRect(itemX + 6, itemY + currentItemH * 0.45, currentItemW - 12, currentItemH * 0.45);
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(6, Math.min(10, currentItemH * 0.3))}px sans-serif`;
            ctx.textAlign = 'center';
            if (currentItemH > 20) {
              ctx.fillText('КУРІННЯ ВБИВАЄ', width / 2, itemY + currentItemH * 0.75);
            }
          } else if (currentItem.type === 'lighter') {
            // Plastic Lighter Graphic
            ctx.fillStyle = '#2563eb';
            ctx.beginPath();
            ctx.roundRect(itemX, itemY + currentItemH * 0.25, currentItemW, currentItemH * 0.75, 4);
            ctx.fill();

            // Metal spark wheel head
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(itemX + currentItemW * 0.2, itemY, currentItemW * 0.6, currentItemH * 0.25);
          } else if (currentItem.type === 'ashtray') {
            // Round Metal Ashtray
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.ellipse(width / 2, itemY + currentItemH / 2, currentItemW / 2, currentItemH / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Cigarette butts inside
            ctx.fillStyle = '#d97706';
            ctx.fillRect(width / 2 - 15, itemY + currentItemH * 0.3, 12, currentItemH * 0.3);
            ctx.fillRect(width / 2 + 5, itemY + currentItemH * 0.2, 10, currentItemH * 0.4);
          } else if (currentItem.type === 'vape') {
            // Sleek Vape Pod
            const vGrad = ctx.createLinearGradient(itemX, itemY, itemX + currentItemW, itemY + currentItemH);
            vGrad.addColorStop(0, '#a855f7');
            vGrad.addColorStop(1, '#ec4899');
            ctx.fillStyle = vGrad;
            ctx.beginPath();
            ctx.roundRect(itemX, itemY, currentItemW, currentItemH, 8);
            ctx.fill();

            // LED glow
            if (currentItemH > 15) {
              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.arc(width / 2, itemY + currentItemH * 0.85, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Cigar / Carton
            ctx.fillStyle = '#451a03';
            ctx.fillRect(itemX, itemY, currentItemW, currentItemH);
            ctx.fillStyle = '#d97706';
            ctx.fillRect(itemX + currentItemW * 0.3, itemY, currentItemW * 0.4, currentItemH);
          }

          // Crack lines when under high pressure
          if (progress > currentItem.crushThreshold) {
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(itemX + 10, itemY + 5);
            ctx.lineTo(itemX + currentItemW * 0.4, itemY + currentItemH * 0.6);
            ctx.lineTo(itemX + currentItemW - 10, itemY + currentItemH * 0.3);
            ctx.stroke();
          }

          ctx.restore();

          // 6. Update & Draw Flying Debris Particles
          for (let d = debrisRef.current.length - 1; d >= 0; d--) {
            const deb = debrisRef.current[d];
            deb.x += deb.vx;
            deb.y += deb.vy;
            deb.vy += 0.35; // Gravity
            deb.rotation += deb.vRot;
            deb.alpha -= 0.015;

            ctx.save();
            ctx.globalAlpha = Math.max(0, deb.alpha);
            ctx.fillStyle = deb.color;
            ctx.translate(deb.x, deb.y);
            ctx.rotate(deb.rotation);
            ctx.fillRect(-deb.width / 2, -deb.height / 2, deb.width, deb.height);
            ctx.restore();

            if (deb.alpha <= 0 || deb.y > height) {
              debrisRef.current.splice(d, 1);
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentItem]);

  const currentTons = Math.round(pressProgress * currentItem.maxTons);

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto select-none relative overflow-hidden bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-30">
        <button
          type="button"
          onClick={() => onSwitchTab('counter')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {/* Pressure Tons Gauge */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
          <Gauge className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-mono uppercase">Тиск преса</span>
            <span className="text-xs font-black text-amber-300 tabular-nums">
              {currentTons} / {currentItem.maxTons} ТОНН
            </span>
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

      {/* Item Carousel Selector */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
        {CRUSHABLE_ITEMS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelectItem(idx)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedItemIdx === idx
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>{item.icon}</span>
            <span className="truncate max-w-[110px]">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative w-full h-[400px] touch-none">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Fully Crushed Victory Badge */}
        {isFullyCrushed && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xl animate-bounce-short z-20">
            <span>🎉</span>
            <span>СПЛЮЩЕНО В ПОРОХ! (+1 ЗНИЩЕНО)</span>
          </div>
        )}
      </div>

      {/* Bottom Hydraulic Controls */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-4 flex flex-col gap-3 z-30">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Ступінь стиснення:</span>
          <span className="font-mono font-bold text-amber-400">{Math.round(pressProgress * 100)}%</span>
        </div>

        {/* Progress Slider (Drag to crush manually) */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={pressProgress}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setPressProgress(v);
            pressProgressRef.current = v;
            if (v > currentItem.crushThreshold) audioRef.current.playCrunch(v);
            if (v >= 1.0 && !isFullyCrushed) {
              setIsFullyCrushed(true);
              setTotalCrushedCount((c) => c + 1);
              audioRef.current.playVictory();
            }
          }}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="flex items-center gap-3">
          {/* Hold to Press Down Button */}
          <button
            type="button"
            onPointerDown={() => setIsPressing(true)}
            onPointerUp={() => setIsPressing(false)}
            onPointerLeave={() => setIsPressing(false)}
            disabled={isFullyCrushed}
            className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all select-none active:scale-95 ${
              isFullyCrushed
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white cursor-pointer hover:brightness-110 shadow-orange-500/20'
            }`}
          >
            <span>⬇️</span>
            <span>ТИСНУТИ ПРЕС (Утримуйте)</span>
          </button>

          {/* Reset / New Item Button */}
          <button
            type="button"
            onClick={resetPress}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition-all active:scale-95 border border-slate-700"
            title="Скинути та підготувати новий предмет"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
