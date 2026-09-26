import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType } from '../types';
import { harmonographAudio } from '../data/harmonographAudio';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  Trash2,
  HelpCircle,
  Move,
  Sparkles
} from 'lucide-react';

interface HarmonographTabProps {
  onSwitchTab: (tab: TabType) => void;
}

interface HarmonicPreset {
  id: string;
  name: string;
  f1: number;
  f2: number;
  f3: number;
  f4: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  description: string;
  icon: string;
}

const HARMONIC_PRESETS: HarmonicPreset[] = [
  {
    id: 'circle',
    name: '1:1 • Коло та Еліпс',
    f1: 1.0,
    f2: 1.0,
    f3: 1.0,
    f4: 1.0,
    p1: 0,
    p2: Math.PI / 2,
    p3: Math.PI / 2,
    p4: 0,
    description: 'Плавне центрування та розгортання еліптичної спіралі.',
    icon: '⭕'
  },
  {
    id: 'figure8',
    name: '1:2 • Нескінченність',
    f1: 1.0,
    f2: 2.0,
    f3: 2.0,
    f4: 1.0,
    p1: 0,
    p2: Math.PI / 4,
    p3: Math.PI / 2,
    p4: Math.PI / 3,
    description: 'Октавний резонанс двох маятників у формі ♾️',
    icon: '♾️'
  },
  {
    id: 'flower',
    name: '2:3 • Квітка Гармонії',
    f1: 2.0,
    f2: 3.0,
    f3: 3.0,
    f4: 2.0,
    p1: 0,
    p2: Math.PI / 6,
    p3: Math.PI / 2,
    p4: Math.PI / 4,
    description: 'Музична квінта. Сакральна пелюсткова мандала.',
    icon: '🌸'
  },
  {
    id: 'mandala',
    name: '3:4 • Сакральний Вузол',
    f1: 3.0,
    f2: 4.0,
    f3: 4.0,
    f4: 3.0,
    p1: Math.PI / 4,
    p2: Math.PI / 3,
    p3: 0,
    p4: Math.PI / 2,
    description: 'Квартальний резонанс чотирьох пелюсток чистоти.',
    icon: '✨'
  },
  {
    id: 'star',
    name: '5:6 • Зоряні Петлі',
    f1: 5.0,
    f2: 6.0,
    f3: 6.0,
    f4: 5.0,
    p1: 0,
    p2: Math.PI / 5,
    p3: Math.PI / 3,
    p4: Math.PI / 2,
    description: 'Поліритмічне плетиво для глибокого заспокоєння думок.',
    icon: '🌟'
  }
];

export const HarmonographTab: React.FC<HarmonographTabProps> = ({ onSwitchTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active state
  const [selectedPreset, setSelectedPreset] = useState<string>('flower');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [damping, setDamping] = useState<number>(0.0016);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // Initial displacement set by user (offsets in pixels from center)
  const [userInitialPos, setUserInitialPos] = useState<{ x: number; y: number }>({ x: 140, y: -110 });

  // Drag interaction state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Pen position ref for continuous line drawing
  const prevPosRef = useRef<{ x: number; y: number } | null>(null);
  const timeRef = useRef<number>(0);
  const activePresetRef = useRef<HarmonicPreset>(HARMONIC_PRESETS[2]);
  const userPosRef = useRef<{ x: number; y: number }>({ x: 140, y: -110 });

  // Sync refs
  useEffect(() => {
    userPosRef.current = userInitialPos;
  }, [userInitialPos]);

  // Sync sound
  useEffect(() => {
    harmonographAudio.setMuted(!soundEnabled);
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    harmonographAudio.setMuted(!next);
  };

  // Change preset
  const handleSelectPreset = (preset: HarmonicPreset) => {
    setSelectedPreset(preset.id);
    activePresetRef.current = preset;
    resetDrawing();
    harmonographAudio.playImpulseChime(HARMONIC_PRESETS.indexOf(preset));
  };

  // Reset drawing with current or new position
  const resetDrawing = () => {
    timeRef.current = 0;
    prevPosRef.current = null;
    const trailCanvas = trailCanvasRef.current;
    if (trailCanvas) {
      const tctx = trailCanvas.getContext('2d');
      if (tctx) {
        tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      }
    }
  };

  // Compute harmonograph coordinate at time t given preset and initial displacement
  const computeHarmonographPoint = (
    t: number,
    cx: number,
    cy: number,
    dx: number,
    dy: number,
    p: HarmonicPreset,
    damp: number
  ) => {
    // Physical exponential damping
    const d = Math.exp(-damp * t * 11);

    // Initial position is strictly (cx + dx, cy + dy) when t = 0
    const xOffset =
      dx * Math.cos(p.f1 * t + p.p1) * 0.72 +
      dy * 0.45 * Math.sin(p.f2 * t + p.p2) * 0.28;

    const yOffset =
      dy * Math.cos(p.f3 * t + p.p3) * 0.72 +
      dx * 0.45 * Math.sin(p.f4 * t + p.p4) * 0.28;

    return {
      x: cx + xOffset * d,
      y: cy + yOffset * d
    };
  };

  // Physics & Animation Loop
  useEffect(() => {
    let animFrame: number;
    let lastT = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      const trailCanvas = trailCanvasRef.current;
      const mainCanvas = canvasRef.current;

      if (trailCanvas && mainCanvas) {
        const tctx = trailCanvas.getContext('2d');
        const mctx = mainCanvas.getContext('2d');

        if (tctx && mctx) {
          const width = mainCanvas.width;
          const height = mainCanvas.height;
          const cx = width / 2;
          const cy = height / 2;
          const p = activePresetRef.current;
          const { x: initDx, y: initDy } = userPosRef.current;

          // If NOT paused and NOT actively dragging, draw the physics swing
          if (!isPaused && (!dragState || !dragState.isDragging)) {
            const steps = 14;
            const subDt = (dt * speed * 2.2) / steps;

            for (let i = 0; i < steps; i++) {
              timeRef.current += subDt;
              const t = timeRef.current;

              const pt = computeHarmonographPoint(t, cx, cy, initDx, initDy, p, damping);

              if (prevPosRef.current) {
                // Hue shifts gently over time across serene cyans, violets and emeralds
                const hue = 180 + ((t * 8) % 140);
                tctx.strokeStyle = `hsla(${hue}, 75%, 72%, 0.38)`;
                tctx.lineWidth = 1.3;
                tctx.lineCap = 'round';
                tctx.beginPath();
                tctx.moveTo(prevPosRef.current.x, prevPosRef.current.y);
                tctx.lineTo(pt.x, pt.y);
                tctx.stroke();
              }

              prevPosRef.current = pt;
            }

            // Update procedural audio hum
            const speedMagnitude = Math.exp(-damping * timeRef.current * 11);
            harmonographAudio.updatePendulumHum(speedMagnitude, p.f2 / p.f1);
          }

          // Render Main Scene
          mctx.fillStyle = '#070A0D';
          mctx.fillRect(0, 0, width, height);

          // 1. Concentric Geometry Guide Rings
          mctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
          mctx.lineWidth = 1;
          [cx * 0.3, cx * 0.6, cx * 0.9].forEach((r) => {
            mctx.beginPath();
            mctx.arc(cx, cy, r, 0, Math.PI * 2);
            mctx.stroke();
          });

          // 2. Draw Accumulated Trails
          mctx.drawImage(trailCanvas, 0, 0);

          // 3. Render While Dragging (Interactive Setting Mode)
          if (dragState && dragState.isDragging) {
            const dragDx = dragState.currentX - cx;
            const dragDy = dragState.currentY - cy;

            // Draw Mechanical Pendulum Cords / Anchor Strings
            mctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
            mctx.lineWidth = 1;
            mctx.setLineDash([4, 4]);

            // Left & Right virtual suspension gimbals
            mctx.beginPath();
            mctx.moveTo(cx - 160, 40);
            mctx.lineTo(dragState.currentX, dragState.currentY);
            mctx.moveTo(cx + 160, 40);
            mctx.lineTo(dragState.currentX, dragState.currentY);
            mctx.stroke();
            mctx.setLineDash([]);

            // Draw Predicted First Cycle Preview Curve
            mctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
            mctx.lineWidth = 1.5;
            mctx.setLineDash([3, 4]);
            mctx.beginPath();

            const previewSteps = 120;
            const previewDt = 0.05;
            for (let s = 0; s < previewSteps; s++) {
              const pt = computeHarmonographPoint(s * previewDt, cx, cy, dragDx, dragDy, p, damping);
              if (s === 0) {
                mctx.moveTo(pt.x, pt.y);
              } else {
                mctx.lineTo(pt.x, pt.y);
              }
            }
            mctx.stroke();
            mctx.setLineDash([]);

            // Draggable Pendulum Bob Glow
            const bobGlow = mctx.createRadialGradient(
              dragState.currentX, dragState.currentY, 2,
              dragState.currentX, dragState.currentY, 24
            );
            bobGlow.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
            bobGlow.addColorStop(0.5, 'rgba(167, 139, 250, 0.4)');
            bobGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

            mctx.fillStyle = bobGlow;
            mctx.beginPath();
            mctx.arc(dragState.currentX, dragState.currentY, 24, 0, Math.PI * 2);
            mctx.fill();

            // Bob Core
            mctx.fillStyle = '#FFFFFF';
            mctx.beginPath();
            mctx.arc(dragState.currentX, dragState.currentY, 5, 0, Math.PI * 2);
            mctx.fill();
          } else if (prevPosRef.current) {
            // 4. Render Active Pen Beacon when drawing
            const { x, y } = prevPosRef.current;

            const glowGrad = mctx.createRadialGradient(x, y, 1, x, y, 16);
            glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
            glowGrad.addColorStop(0.5, 'rgba(167, 139, 250, 0.35)');
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            mctx.fillStyle = glowGrad;
            mctx.beginPath();
            mctx.arc(x, y, 16, 0, Math.PI * 2);
            mctx.fill();

            mctx.fillStyle = '#FFFFFF';
            mctx.beginPath();
            mctx.arc(x, y, 2.5, 0, Math.PI * 2);
            mctx.fill();
          }
        }
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animFrame);
      harmonographAudio.stop();
    };
  }, [isPaused, damping, speed, dragState]);

  // Convert client touch coords to canvas coords
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Touch / Pointer Down (Grab & Position Pendulum)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragState({
      isDragging: true,
      currentX: x,
      currentY: y
    });
  };

  // Touch / Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragState || !dragState.isDragging) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragState((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null));
  };

  // Touch / Pointer Up (Release pendulum to start organic drawing)
  const handlePointerUp = () => {
    if (!dragState || !dragState.isDragging) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const newDx = dragState.currentX - cx;
      const newDy = dragState.currentY - cy;

      // Update initial displacement
      setUserInitialPos({ x: newDx, y: newDy });
      userPosRef.current = { x: newDx, y: newDy };

      // Reset trace and launch
      resetDrawing();
      harmonographAudio.playImpulseChime(2);
    }

    setDragState(null);
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
            Гармонограф Ліссажу
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onSwitchTab && (
            <button
              type="button"
              onClick={() => onSwitchTab('music')}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              title="Перейти в Музичну студію"
            >
              <span>Студія 432Hz</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsInfoOpen((v) => !v)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Про гармонограф"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title={soundEnabled ? 'Звук увімкнено (432 Гц)' : 'Звук вимкнено'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>
        </div>
      </div>

      {/* 2. Селектор Гармонійних Пропорцій */}
      <div className="p-1.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 mb-2.5">
        <div className="grid grid-cols-5 gap-1">
          {HARMONIC_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
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
                <span className="text-xs">{preset.icon}</span>
                <span className="truncate">{preset.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Інформаційна плашка */}
      {isInfoOpen && (
        <div className="mb-3 p-3.5 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-slate-200 dark:border-zinc-800 shadow-sm text-xs text-slate-600 dark:text-zinc-300 leading-relaxed animate-fadeIn">
          <p className="font-semibold text-slate-800 dark:text-zinc-200 mb-1">
            Ручне позиціювання маятника
          </p>
          <p className="mb-2 text-slate-500 dark:text-zinc-400">
            • <strong>Задайте початок:</strong> торкніться будь-якої точки полотна й потягніть маятник. Ви побачите підвіси та попередній контур.<br />
            • <strong>Відпустіть палець:</strong> маятник почне вільне затухаюче коливання, малюючи унікальну сакральну мандалу.
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

      {/* 3. Головне Полотно Гармонографа */}
      <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden relative shadow-lg touch-none select-none border border-slate-200/60 dark:border-zinc-800/80 bg-[#070A0D]">
        {/* Прихований канвас накопичення ліній */}
        <canvas ref={trailCanvasRef} width={640} height={800} className="hidden" />

        {/* Відображуваний канвас */}
        <canvas
          ref={canvasRef}
          width={640}
          height={800}
          className="w-full h-full block cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {/* Верхня підказка жестів */}
        {!dragState && (
          <div className="absolute top-3 inset-x-3 flex justify-between items-center pointer-events-none z-10">
            <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
              <Move className="w-3 h-3 text-cyan-400" />
              <span>потягніть маятник для нового візерунка</span>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] text-slate-400 font-mono">
              R: {Math.round(Math.hypot(userInitialPos.x, userInitialPos.y))}px
            </div>
          </div>
        )}

        {/* Нижня панель керування швидкістю та затуханням */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2.5 z-10 pointer-events-none">
          <div className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex-1 flex items-center justify-between gap-3 pointer-events-auto">
            {/* Швидкість */}
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>Швидкість:</span>
                <span>{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Плавність / затухання */}
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>Плавність:</span>
                <span>{Math.round((1 - damping * 350) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0006"
                max="0.0035"
                step="0.0002"
                value={damping}
                onChange={(e) => setDamping(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Пауза */}
            <button
              type="button"
              onClick={() => setIsPaused((v) => !v)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 flex-none"
              title={isPaused ? 'Продовжити' : 'Пауза'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Очистити */}
            <button
              type="button"
              onClick={resetDrawing}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-rose-300 transition-all cursor-pointer active:scale-95 flex-none"
              title="Перезапустити з початкового положення"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
