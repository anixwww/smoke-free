import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType } from '../types';
import {
  CYMATICS_PRESETS,
  CymaticsFrequencyPreset,
  cymaticsAudio
} from '../data/cymaticsAudio';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  Trash2,
  HelpCircle,
  Sliders,
  Sparkles,
  Waves
} from 'lucide-react';

interface CymaticsTabProps {
  onSwitchTab: (tab: TabType) => void;
}

interface WaveEmitter {
  id: number;
  x: number;
  y: number;
  amplitude: number;
  phase: number;
  life: number;
}

export const CymaticsTab: React.FC<CymaticsTabProps> = ({ onSwitchTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Settings
  const [selectedPreset, setSelectedPreset] = useState<CymaticsFrequencyPreset>(CYMATICS_PRESETS[1]); // 432 Hz
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [intensity, setIntensity] = useState<number>(1.0);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // Active wave emitters placed by user touches
  const [emitters, setEmitters] = useState<WaveEmitter[]>([
    { id: 1, x: 0, y: 0, amplitude: 1.0, phase: 0, life: 1.0 }
  ]);
  const emittersRef = useRef<WaveEmitter[]>([
    { id: 1, x: 0, y: 0, amplitude: 1.0, phase: 0, life: 1.0 }
  ]);

  // Sync sound
  useEffect(() => {
    cymaticsAudio.setMuted(!soundEnabled);
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    cymaticsAudio.setMuted(!next);
  };

  // Change frequency preset
  const handleSelectPreset = (preset: CymaticsFrequencyPreset) => {
    setSelectedPreset(preset);
    cymaticsAudio.setHarmonicFrequency(preset.hz);
  };

  useEffect(() => {
    cymaticsAudio.setHarmonicFrequency(selectedPreset.hz);
  }, [selectedPreset]);

  // Sync emitters
  useEffect(() => {
    emittersRef.current = emitters;
  }, [emitters]);

  // Clear extra emitters back to center
  const handleResetEmitters = () => {
    const defaultCenter: WaveEmitter[] = [
      { id: 1, x: 0, y: 0, amplitude: 1.0, phase: 0, life: 1.0 }
    ];
    setEmitters(defaultCenter);
    emittersRef.current = defaultCenter;
    cymaticsAudio.playWaterChime(selectedPreset.hz);
  };

  // Main Cymatics Simulation & Rendering Loop
  useEffect(() => {
    let animFrame: number;
    let lastT = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderCymatics(ctx, canvas.width, canvas.height, now * 0.001);
        }
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animFrame);
      cymaticsAudio.stop();
    };
  }, [isPaused, selectedPreset, intensity]);

  // Render Standing Wave Chladni Water Surface
  const renderCymatics = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) => {
    ctx.fillStyle = '#06090D';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(width, height) * 0.44;

    ctx.save();
    ctx.translate(cx, cy);

    // 1. Outer Vessel Boundary (Dark Water Basin)
    const basinGrad = ctx.createRadialGradient(0, 0, maxR * 0.2, 0, 0, maxR);
    basinGrad.addColorStop(0, '#0D151C');
    basinGrad.addColorStop(0.8, '#080E14');
    basinGrad.addColorStop(1, '#04070A');

    ctx.fillStyle = basinGrad;
    ctx.beginPath();
    ctx.arc(0, 0, maxR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Render Standing Interference Pattern Rings & Chladni Nodes
    const k = selectedPreset.waveDensity * 0.055;
    const sym = selectedPreset.symmetry;
    const freqSpeed = selectedPreset.hz * 0.006;
    const t = time * freqSpeed;

    const currentEmitters = emittersRef.current;

    // Draw concentric Bessel-like standing wave interference field
    const numRings = 42;
    for (let rIdx = 1; rIdx <= numRings; rIdx++) {
      const r = (rIdx / numRings) * maxR;

      // Calculate radial standing wave amplitude: J_0(kr) * cos(wt) + angular harmonic
      const standingAmp = Math.cos(k * r - t) * Math.cos(k * r + t);
      const alpha = Math.max(0, Math.min(0.85, (standingAmp * 0.5 + 0.5) * intensity));

      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.45})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Render Angular Chladni Petals (Geometric Nodal Lines)
    const points = 180;
    const numHarmonicRays = sym;

    for (let ray = 0; ray < numHarmonicRays; ray++) {
      const rayAngle = (ray / numHarmonicRays) * Math.PI * 2;

      ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let dist = 10; dist <= maxR; dist += 8) {
        // Modulate with standing wave petal wave
        const waveOffset = Math.sin(dist * k - t) * Math.cos(rayAngle * (sym / 2)) * 6 * intensity;
        const curAngle = rayAngle + waveOffset * 0.02;
        const px = Math.cos(curAngle) * dist;
        const py = Math.sin(curAngle) * dist;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // 4. Render Active Wave Emitter Points
    for (const em of currentEmitters) {
      // Expanding water ripples from touch points
      for (let waveIdx = 0; waveIdx < 4; waveIdx++) {
        const waveProgress = ((time * 1.5 + waveIdx * 0.25) % 1.0);
        const ringR = waveProgress * 120;
        const ringAlpha = (1 - waveProgress) * 0.5 * em.amplitude;

        ctx.strokeStyle = `rgba(103, 232, 249, ${ringAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(em.x, em.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Emitter Beacon
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(em.x, em.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(em.x, em.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center Sacred Singularity
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Touch water surface to create new wave emitter
  const handleTouch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.clientX - rect.left - rect.width / 2;
    const touchY = e.clientY - rect.top - rect.height / 2;

    cymaticsAudio.playWaterChime(selectedPreset.hz);

    const newEmitter: WaveEmitter = {
      id: Date.now(),
      x: touchX,
      y: touchY,
      amplitude: 1.0,
      phase: 0,
      life: 1.0
    };

    setEmitters((prev) => [...prev.slice(-3), newEmitter]);
  };

  return (
    <div className="flex flex-col flex-1 pb-10 max-w-md mx-auto w-full select-none">
      {/* 1. Верхня панель */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          {onSwitchTab && (
            <button
              type="button"
              onClick={() => onSwitchTab('counter')}
              className="p-1.5 -ml-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-sm font-semibold tracking-wide text-slate-800 dark:text-zinc-200">
            Водний Ханг • Кіматика
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsInfoOpen((v) => !v)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Про кіматику"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title={soundEnabled ? 'Звук увімкнено' : 'Звук вимкнено'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>
        </div>
      </div>

      {/* 2. Селектор Частот Сольфеджіо / Сакральних Частот */}
      <div className="p-1.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 mb-2.5">
        <div className="grid grid-cols-4 gap-1">
          {CYMATICS_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                title={preset.description}
              >
                <span className="font-mono">{preset.hz} Гц</span>
                <span className="text-[9px] text-slate-400 truncate">{preset.name.split('•')[1]?.trim() || ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Інфо плашка */}
      {isInfoOpen && (
        <div className="mb-3 p-3.5 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-slate-200 dark:border-zinc-800 shadow-sm text-xs text-slate-600 dark:text-zinc-300 leading-relaxed animate-fadeIn">
          <p className="font-semibold text-slate-800 dark:text-zinc-200 mb-1">
            Кіматика: звукові стоячі хвилі на воді
          </p>
          <p className="mb-2 text-slate-500 dark:text-zinc-400">
            • <strong>Звук упорядковує матерію:</strong> різна частота вібрації створює унікальні стоячі візерунки Хладні на воді.<br />
            • <strong>Дотик:</strong> торкайтеся водної чаші, щоб створювати хвильові точки інтерференції.
          </p>
          <button
            type="button"
            onClick={() => setIsInfoOpen(false)}
            className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium underline cursor-pointer"
          >
            Зрозуміло
          </button>
        </div>
      )}

      {/* 3. Головне Полотно Водної Кіматики */}
      <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden relative shadow-lg touch-none select-none border border-slate-200/60 dark:border-zinc-800/80 bg-[#06090D]">
        <canvas
          ref={canvasRef}
          width={640}
          height={800}
          className="w-full h-full block cursor-pointer"
          onPointerDown={handleTouch}
        />

        {/* Нижня панель керування */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2.5 z-10 pointer-events-none">
          <div className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex-1 flex items-center justify-between gap-3 pointer-events-auto">
            {/* Резонатор / Амплітуда */}
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>Інтенсивність:</span>
                <span>{Math.round(intensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Центрувати / Очистити хвильові джерела */}
            <button
              type="button"
              onClick={handleResetEmitters}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-all cursor-pointer active:scale-95 flex-none"
              title="Центрувати хвилі"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
