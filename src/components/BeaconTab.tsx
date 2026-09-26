import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType } from '../types';
import {
  BeaconNode,
  ResonantBuoy,
  calculateBeaconFrequency,
  beaconAudio
} from '../data/beaconAudio';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  Plus,
  Minus,
  Maximize2,
  Trash2,
  HelpCircle,
  Sliders,
  Sparkles,
  Radio
} from 'lucide-react';

interface BeaconTabProps {
  onSwitchTab: (tab: TabType) => void;
}

const BEACON_COLORS = [
  { color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.4)' }, // Sky Cyan
  { color: '#34D399', glow: 'rgba(52, 211, 153, 0.4)' }, // Emerald
  { color: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)' }, // Warm Amber
  { color: '#A78BFA', glow: 'rgba(167, 139, 250, 0.4)' }, // Soft Lavender
  { color: '#F472B6', glow: 'rgba(244, 114, 182, 0.4)' }, // Rose Light
  { color: '#67E8F9', glow: 'rgba(103, 232, 249, 0.4)' }, // Aquamarine
  { color: '#E2E8F0', glow: 'rgba(226, 232, 240, 0.4)' }  // Moonlight White
];

const PRESET_COUNTS = [1, 2, 3, 5, 10, 25, 50];

export const BeaconTab: React.FC<BeaconTabProps> = ({ onSwitchTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core settings
  const [beaconCount, setBeaconCount] = useState<number>(3);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [globalSpeed, setGlobalSpeed] = useState<number>(1.0);
  const [diameterScale, setDiameterScale] = useState<number>(1.0);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [placementMode, setPlacementMode] = useState<'buoy' | 'pan'>('buoy');

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Physics entities
  const [beacons, setBeacons] = useState<BeaconNode[]>([]);
  const [buoys, setBuoys] = useState<ResonantBuoy[]>([]);
  const beaconsRef = useRef<BeaconNode[]>([]);
  const buoysRef = useRef<ResonantBuoy[]>([]);

  // Drag interaction
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    panStartX: number;
    panStartY: number;
    isDragging: boolean;
  } | null>(null);

  // Sync sound mute
  useEffect(() => {
    beaconAudio.setMuted(!soundEnabled);
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    beaconAudio.setMuted(!next);
  };

  // Generate Beacons based on selected count with harmonious diameters and positions
  const generateBeacons = useCallback((count: number, scale: number = 1.0) => {
    const newBeacons: BeaconNode[] = [];

    if (count === 1) {
      // 1 Solitary Beacon in deep ocean
      const r = 320 * scale;
      newBeacons.push({
        id: 1,
        x: 0,
        y: 0,
        radius: r,
        beamAngle: 0,
        angularSpeed: 0.65,
        beamWidth: 0.22,
        color: BEACON_COLORS[0].color,
        glow: BEACON_COLORS[0].glow,
        harmonicFreq: calculateBeaconFrequency(r),
        lastTriggerAngle: 0,
        active: true
      });
    } else if (count === 2) {
      // 2 Dual Beacons (Octave harmonic dialogue)
      const dist = 120;
      const r1 = 380 * scale;
      const r2 = 220 * scale;
      newBeacons.push(
        {
          id: 1,
          x: -dist,
          y: 0,
          radius: r1,
          beamAngle: 0,
          angularSpeed: 0.5,
          beamWidth: 0.2,
          color: BEACON_COLORS[0].color,
          glow: BEACON_COLORS[0].glow,
          harmonicFreq: calculateBeaconFrequency(r1),
          lastTriggerAngle: 0,
          active: true
        },
        {
          id: 2,
          x: dist,
          y: 0,
          radius: r2,
          beamAngle: Math.PI,
          angularSpeed: -0.75,
          beamWidth: 0.2,
          color: BEACON_COLORS[1].color,
          glow: BEACON_COLORS[1].glow,
          harmonicFreq: calculateBeaconFrequency(r2),
          lastTriggerAngle: Math.PI,
          active: true
        }
      );
    } else if (count === 3) {
      // 3 Trinity Beacons (Triquetra triad harmony)
      const dist = 130;
      const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
      const radii = [360, 260, 180].map((r) => r * scale);

      for (let i = 0; i < 3; i++) {
        newBeacons.push({
          id: i + 1,
          x: Math.cos(angles[i]) * dist,
          y: Math.sin(angles[i]) * dist,
          radius: radii[i],
          beamAngle: angles[i] + Math.PI,
          angularSpeed: (0.4 + i * 0.2) * (i % 2 === 0 ? 1 : -1),
          beamWidth: 0.18,
          color: BEACON_COLORS[i % BEACON_COLORS.length].color,
          glow: BEACON_COLORS[i % BEACON_COLORS.length].glow,
          harmonicFreq: calculateBeaconFrequency(radii[i]),
          lastTriggerAngle: angles[i],
          active: true
        });
      }
    } else if (count <= 10) {
      // 4 to 10 Beacons in harmonious rings
      const ringRadius = 160;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        // Diverse harmonic diameters for varied melody
        const baseR = (140 + ((i * 53) % 280)) * scale;
        newBeacons.push({
          id: i + 1,
          x: Math.cos(theta) * ringRadius,
          y: Math.sin(theta) * ringRadius,
          radius: baseR,
          beamAngle: theta,
          angularSpeed: (0.35 + (i % 3) * 0.18) * (i % 2 === 0 ? 1 : -1),
          beamWidth: 0.16,
          color: BEACON_COLORS[i % BEACON_COLORS.length].color,
          glow: BEACON_COLORS[i % BEACON_COLORS.length].glow,
          harmonicFreq: calculateBeaconFrequency(baseR),
          lastTriggerAngle: theta,
          active: true
        });
      }
    } else {
      // 11 to 50 Beacons (Golden Ratio Fibonacci Swarm / Starlight network)
      const phi = (1 + Math.sqrt(5)) / 2;
      for (let i = 0; i < count; i++) {
        const theta = i * phi * Math.PI * 2;
        const dist = Math.sqrt(i / count) * 320;
        // Staggered diameters based on distance and golden ratio
        const r = (100 + (i % 7) * 45) * scale;

        newBeacons.push({
          id: i + 1,
          x: Math.cos(theta) * dist,
          y: Math.sin(theta) * dist,
          radius: r,
          beamAngle: theta % (Math.PI * 2),
          angularSpeed: (0.25 + (i % 5) * 0.1) * (i % 2 === 0 ? 1 : -1),
          beamWidth: 0.12,
          color: BEACON_COLORS[i % BEACON_COLORS.length].color,
          glow: BEACON_COLORS[i % BEACON_COLORS.length].glow,
          harmonicFreq: calculateBeaconFrequency(r),
          lastTriggerAngle: theta,
          active: true
        });
      }
    }

    setBeacons(newBeacons);
    beaconsRef.current = newBeacons;

    // Initialize default resonant buoys if empty
    if (buoysRef.current.length === 0) {
      const defaultBuoys: ResonantBuoy[] = [
        { id: 1, x: 0, y: -160, radius: 8, pitchOffset: 0, lastHitTime: 0, color: '#38BDF8' },
        { id: 2, x: 150, y: 80, radius: 8, pitchOffset: 2, lastHitTime: 0, color: '#34D399' },
        { id: 3, x: -150, y: 80, radius: 8, pitchOffset: 4, lastHitTime: 0, color: '#FBBF24' }
      ];
      setBuoys(defaultBuoys);
      buoysRef.current = defaultBuoys;
    }
  }, []);

  // Update when count or diameter scale changes
  useEffect(() => {
    generateBeacons(beaconCount, diameterScale);
  }, [beaconCount, diameterScale, generateBeacons]);

  // Keep refs in sync
  useEffect(() => {
    beaconsRef.current = beacons;
  }, [beacons]);

  useEffect(() => {
    buoysRef.current = buoys;
  }, [buoys]);

  // Main Simulation & Rendering Loop
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!isPaused && beaconsRef.current.length > 0) {
        const currentBeacons = beaconsRef.current;
        const currentBuoys = buoysRef.current;

        for (const beacon of currentBeacons) {
          if (!beacon.active) continue;

          const prevAngle = beacon.beamAngle;
          // Advance beam rotation
          beacon.beamAngle = (beacon.beamAngle + beacon.angularSpeed * globalSpeed * dt) % (Math.PI * 2);
          if (beacon.beamAngle < 0) beacon.beamAngle += Math.PI * 2;
          const currAngle = beacon.beamAngle;

          // 1. Primary Meridian Passing Trigger (12 o'clock / Top angle -PI/2)
          const targetMeridian = (3 * Math.PI) / 2; // North / 270 deg (or -PI/2)
          const crossedMeridian =
            (prevAngle < targetMeridian && currAngle >= targetMeridian) ||
            (prevAngle > currAngle && (targetMeridian > prevAngle || targetMeridian <= currAngle));

          if (crossedMeridian) {
            beaconAudio.playBeamSweepSound(beacon.harmonicFreq, currentBeacons.length, beacon.radius > 300);
          }

          // 2. Resonant Buoys Detection (When beam passes over placed ocean buoys)
          for (const buoy of currentBuoys) {
            const dx = buoy.x - beacon.x;
            const dy = buoy.y - beacon.y;
            const dist = Math.hypot(dx, dy);

            // Within beacon reach
            if (dist <= beacon.radius) {
              let angleToBuoy = Math.atan2(dy, dx);
              if (angleToBuoy < 0) angleToBuoy += Math.PI * 2;

              const angleDiff = Math.abs(currAngle - angleToBuoy);
              const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);

              // If beam covers buoy and hasn't triggered recently
              if (normalizedDiff < beacon.beamWidth && now - buoy.lastHitTime > 600) {
                buoy.lastHitTime = now;
                // Harmonic pitch modulated by beacon diameter + buoy offset
                beaconAudio.playBeamSweepSound(
                  beacon.harmonicFreq,
                  currentBeacons.length,
                  beacon.radius > 320
                );
              }
            }
          }
        }
      }

      // Render Scene
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderScene(ctx, canvas.width, canvas.height, now);
        }
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPaused, globalSpeed, zoom, pan]);

  // Render Scene Routine
  const renderScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    now: number
  ) => {
    // 1. Deep Midnight Ocean Background
    ctx.fillStyle = '#06090D';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // 2. Subtle Ocean Wave Rings & Meridian Marker (North Trigger)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1 / zoom;
    const oceanRadii = [120, 240, 360, 480, 600];
    for (const r of oceanRadii) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // North Meridian (Trigger Point Marker)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.setLineDash([3 / zoom, 5 / zoom]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -600);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Render Beacons (Light beams & towers)
    for (const beacon of beaconsRef.current) {
      if (!beacon.active) continue;

      // Draw Atmospheric Sweep Cone (Light Beam)
      const halfWidth = beacon.beamWidth / 2;
      const startAngle = beacon.beamAngle - halfWidth;
      const endAngle = beacon.beamAngle + halfWidth;

      // Outer light beam gradient
      const beamGrad = ctx.createRadialGradient(
        beacon.x, beacon.y, 4,
        beacon.x, beacon.y, beacon.radius
      );
      beamGrad.addColorStop(0, beacon.glow);
      beamGrad.addColorStop(0.5, beacon.glow.replace('0.4', '0.15'));
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(beacon.x, beacon.y);
      ctx.arc(beacon.x, beacon.y, beacon.radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Range Boundary Arc (Diameter Outline)
      ctx.strokeStyle = beacon.color;
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.arc(beacon.x, beacon.y, beacon.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Beacon Central Lens / Tower
      // Aura
      ctx.fillStyle = beacon.color;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(beacon.x, beacon.y, 9 / zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Tower Head
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(beacon.x, beacon.y, 3.5 / zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Render Resonant Ocean Buoys (Bells)
    for (const buoy of buoysRef.current) {
      const isRinging = now - buoy.lastHitTime < 500;
      const ringRatio = (now - buoy.lastHitTime) / 500;

      // Ringing ripple when struck by light
      if (isRinging) {
        ctx.strokeStyle = buoy.color;
        ctx.globalAlpha = (1 - ringRatio) * 0.8;
        ctx.lineWidth = 1.5 / zoom;
        ctx.beginPath();
        ctx.arc(buoy.x, buoy.y, (8 + ringRatio * 28) / zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Buoy Body
      ctx.fillStyle = isRinging ? '#FFFFFF' : buoy.color;
      ctx.beginPath();
      ctx.arc(buoy.x, buoy.y, (isRinging ? 5.5 : 4.5) / zoom, 0, Math.PI * 2);
      ctx.fill();

      // Buoy Core Glow
      ctx.fillStyle = buoy.color;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(buoy.x, buoy.y, 9 / zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  };

  // Convert screen coordinates to world
  const screenToWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasBufferX = (clientX - rect.left) * scaleX;
    const canvasBufferY = (clientY - rect.top) * scaleY;

    const worldX = (canvasBufferX - (canvas.width / 2 + pan.x)) / zoom;
    const worldY = (canvasBufferY - (canvas.height / 2 + pan.y)) / zoom;

    return { x: worldX, y: worldY };
  };

  // Touch handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const world = screenToWorld(e.clientX, e.clientY);

    if (placementMode === 'buoy') {
      // Place new resonant buoy at touch point
      beaconAudio.playWaterTouch();
      const newBuoy: ResonantBuoy = {
        id: Date.now(),
        x: world.x,
        y: world.y,
        radius: 8,
        pitchOffset: buoys.length % 5,
        lastHitTime: 0,
        color: BEACON_COLORS[buoys.length % BEACON_COLORS.length].color
      };
      const updated = [...buoysRef.current, newBuoy];
      buoysRef.current = updated;
      setBuoys(updated);
    } else {
      // Pan mode
      setDragState({
        startX: e.clientX,
        startY: e.clientY,
        panStartX: pan.x,
        panStartY: pan.y,
        isDragging: true
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragState || !dragState.isDragging || placementMode !== 'pan') return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    setPan({
      x: dragState.panStartX + dx,
      y: dragState.panStartY + dy
    });
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z * 1.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, z / 1.25));
  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Clear buoys
  const clearBuoys = () => {
    setBuoys([]);
    buoysRef.current = [];
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
            Симфонія маяків
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Довідка */}
          <button
            type="button"
            onClick={() => setIsInfoOpen((v) => !v)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Про симулятор маяків"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Звук */}
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

      {/* 2. Швидкий вибір кількості маяків (1, 2, 3, 5, 10, 25, 50) */}
      <div className="p-2 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 mb-2.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1.5 px-1">
          <span>Кількість маяків:</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
            {beaconCount} {beaconCount === 1 ? 'маяк' : beaconCount <= 4 ? 'маяки' : 'маяків'}
          </span>
        </div>

        {/* Сегментований перемикач пресетів */}
        <div className="grid grid-cols-7 gap-1">
          {PRESET_COUNTS.map((cnt) => {
            const isSelected = beaconCount === cnt;
            return (
              <button
                key={cnt}
                type="button"
                onClick={() => setBeaconCount(cnt)}
                className={`py-1 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {cnt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Інфо плашка */}
      {isInfoOpen && (
        <div className="mb-3 p-3.5 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-slate-200 dark:border-zinc-800 shadow-sm text-xs text-slate-600 dark:text-zinc-300 leading-relaxed animate-fadeIn">
          <p className="font-semibold text-slate-800 dark:text-zinc-200 mb-1">
            Фізичний гармонічний резонанс маяків
          </p>
          <p className="mb-2 text-slate-500 dark:text-zinc-400">
            • <strong>Діаметр визначає висоту звуку:</strong> довгий промінь дає глибокий низький гонг, короткий — чистий кришталевий передзвін.<br />
            • <strong>Точка тригера:</strong> звук лунає при перетині північного меридіана або при освітленні плавучих буїв.<br />
            • <strong>Дотик:</strong> торкайтеся води для встановлення резонансних буїв.
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

      {/* 3. Головне Полотно Океану Маяків */}
      <div
        ref={containerRef}
        className="w-full aspect-[4/5] rounded-3xl overflow-hidden relative shadow-lg touch-none select-none border border-slate-200/60 dark:border-zinc-800/80 bg-[#06090D]"
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={800}
          className="w-full h-full block cursor-pointer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {/* Плаваючі Кнопки Масштабу (Zoom & Pan) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            title="Збільшити"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            title="Зменшити"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={resetView}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            title="Центрувати"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Верхній перемикач режимів дотику (Буй або Переміщення) */}
        <div className="absolute top-3 left-3 flex gap-1 z-10">
          <button
            type="button"
            onClick={() => setPlacementMode('buoy')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-md border transition-all cursor-pointer ${
              placementMode === 'buoy'
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                : 'bg-black/50 border-white/10 text-slate-400'
            }`}
          >
            + Ставити буй
          </button>
          <button
            type="button"
            onClick={() => setPlacementMode('pan')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-md border transition-all cursor-pointer ${
              placementMode === 'pan'
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                : 'bg-black/50 border-white/10 text-slate-400'
            }`}
          >
            Карта
          </button>
        </div>

        {/* Нижня панель керування діаметром та швидкістю */}
        <div className="absolute bottom-3 inset-x-3 flex flex-col gap-2 z-10 pointer-events-none">
          {/* Регулятори діаметра та швидкості */}
          <div className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 pointer-events-auto">
            {/* Довжина променя (Діаметр) */}
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>Діаметр променя:</span>
                <span>{Math.round(diameterScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={diameterScale}
                onChange={(e) => setDiameterScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Швидкість обертання */}
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>Швидкість:</span>
                <span>{globalSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={globalSpeed}
                onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Кнопка паузи */}
            <button
              type="button"
              onClick={() => setIsPaused((v) => !v)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 flex-none"
              title={isPaused ? 'Продовжити' : 'Пауза'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Очистити буї */}
            {buoys.length > 0 && (
              <button
                type="button"
                onClick={clearBuoys}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-rose-300 transition-all cursor-pointer active:scale-95 flex-none"
                title="Прибрати всі буї"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
