import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType } from '../types';
import {
  musicStudioAudio,
  PIANO_NOTES,
  DRUM_PADS,
  INSTRUMENTS,
  InstrumentType,
  NoteInfo,
  DrumInfo,
  DrumType
} from '../data/musicStudioAudio';
import {
  ArrowLeft,
  Play,
  Pause,
  Shuffle,
  Trash2,
  Sparkles,
  Sliders,
  Layers,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface MusicStudioTabProps {
  onSwitchTab?: (tab: TabType) => void;
}

// Particle for musical sparks & stardust
interface SoundParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glow: string;
  alpha: number;
  life: number;
  maxLife: number;
}

// Resonant sound wave expanding outward
interface SoundRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  freq: number;
  speed: number;
  petals: number;
}

const STEP_COUNT = 16;

export const MusicStudioTab: React.FC<MusicStudioTabProps> = ({ onSwitchTab }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Selected Instrument
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentType>('handpan');

  // Active highlighted keys for touch/step feedback
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeDrumType, setActiveDrumType] = useState<DrumType | null>(null);

  // Pattern Sequencer State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [bpm, setBpm] = useState<number>(92);
  const [showPatternEditor, setShowPatternEditor] = useState<boolean>(false);
  const [activeTabSection, setActiveTabSection] = useState<'melody' | 'drums'>('melody');

  // Pattern Grids:
  // Note Grid: Record<noteId, boolean[16]>
  const [notePattern, setNotePattern] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    PIANO_NOTES.forEach((n) => {
      initial[n.id] = new Array(STEP_COUNT).fill(false);
    });
    // Seed initial gentle relaxing motif
    if (initial['n_d3']) initial['n_d3'][0] = true;
    if (initial['n_a3']) initial['n_a3'][4] = true;
    if (initial['n_f4']) initial['n_f4'][8] = true;
    if (initial['n_a4']) initial['n_a4'][12] = true;
    if (initial['n_c5']) initial['n_c5'][14] = true;
    return initial;
  });

  // Drum Grid: Record<drumType, boolean[16]>
  const [drumPattern, setDrumPattern] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    DRUM_PADS.forEach((d) => {
      initial[d.type] = new Array(STEP_COUNT).fill(false);
    });
    // Seed gentle heartbeat & high shaker
    if (initial['kick']) {
      initial['kick'][0] = true;
      initial['kick'][8] = true;
    }
    if (initial['ding']) {
      initial['ding'][4] = true;
      initial['ding'][12] = true;
    }
    if (initial['shaker']) {
      initial['shaker'][2] = true;
      initial['shaker'][6] = true;
      initial['shaker'][10] = true;
      initial['shaker'][14] = true;
    }
    return initial;
  });

  // Visual simulation refs
  const ripplesRef = useRef<SoundRipple[]>([]);
  const particlesRef = useRef<SoundParticle[]>([]);
  const lastActiveFreqRef = useRef<number>(432);
  const phaseRef = useRef<number>(0);

  // Sequencer loop refs to avoid closure stalls
  const stepRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const bpmRef = useRef<number>(bpm);
  const notePatternRef = useRef(notePattern);
  const drumPatternRef = useRef(drumPattern);
  const currentInstrumentRef = useRef(currentInstrument);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    notePatternRef.current = notePattern;
  }, [notePattern]);

  useEffect(() => {
    drumPatternRef.current = drumPattern;
  }, [drumPattern]);

  useEffect(() => {
    currentInstrumentRef.current = currentInstrument;
  }, [currentInstrument]);

  // Make sure audio context is clean on unmount (hum is off by default)
  useEffect(() => {
    return () => {
      musicStudioAudio.stop();
    };
  }, []);

  // Spawn visual feedback for a note/sound
  const spawnVisualEcho = useCallback((x: number, y: number, color: string, freq: number = 432) => {
    lastActiveFreqRef.current = freq;

    const petals = freq < 200 ? 4 : freq < 300 ? 6 : freq < 400 ? 8 : 12;

    ripplesRef.current.push({
      x,
      y,
      radius: 10,
      maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.45,
      color,
      alpha: 0.85,
      freq,
      speed: 2.8 + (freq / 432) * 1.6,
      petals
    });

    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
      const speed = 1.2 + Math.random() * 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.8 + Math.random() * 3.2,
        color,
        glow: color,
        alpha: 0.9,
        life: 0,
        maxLife: 40 + Math.random() * 30
      });
    }
  }, []);

  // Trigger note with chosen instrument
  const triggerNote = useCallback(
    (note: NoteInfo, clientX?: number, clientY?: number, overrideInstrument?: InstrumentType) => {
      const inst = overrideInstrument || currentInstrumentRef.current;
      musicStudioAudio.playNote(inst, note.freq);
      setActiveNoteId(note.id);
      setTimeout(() => setActiveNoteId((c) => (c === note.id ? null : c)), 180);

      const x = clientX ?? window.innerWidth * 0.5;
      const y = clientY ?? window.innerHeight * 0.6;
      spawnVisualEcho(x, y, note.color, note.freq);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(8);
        } catch {}
      }
    },
    [spawnVisualEcho]
  );

  // Trigger acoustic drum/chime
  const triggerDrum = useCallback(
    (drum: DrumInfo, clientX?: number, clientY?: number) => {
      musicStudioAudio.playDrum(drum.type);
      setActiveDrumType(drum.type);
      setTimeout(() => setActiveDrumType((c) => (c === drum.type ? null : c)), 160);

      const x = clientX ?? window.innerWidth * 0.5;
      const y = clientY ?? window.innerHeight * 0.35;
      const drumFreqs: Record<DrumType, number> = {
        kick: 108,
        snare: 216,
        hihat: 864,
        ding: 432,
        wood: 324,
        shaker: 648
      };
      spawnVisualEcho(x, y, drum.color, drumFreqs[drum.type]);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(10);
        } catch {}
      }
    },
    [spawnVisualEcho]
  );

  // Sequencer Engine Clock
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    const tick = () => {
      if (!isPlayingRef.current) return;

      const step = stepRef.current;
      setCurrentStep(step);

      // 1. Play active melodic notes on this step
      const nPat = notePatternRef.current;
      PIANO_NOTES.forEach((note, idx) => {
        if (nPat[note.id] && nPat[note.id][step]) {
          const posX = (window.innerWidth / (PIANO_NOTES.length + 1)) * (idx + 1);
          const posY = window.innerHeight * 0.65;
          triggerNote(note, posX, posY);
        }
      });

      // 2. Play active drum pads on this step
      const dPat = drumPatternRef.current;
      DRUM_PADS.forEach((drum, idx) => {
        if (dPat[drum.type] && dPat[drum.type][step]) {
          const posX = (window.innerWidth / (DRUM_PADS.length + 1)) * (idx + 1);
          const posY = window.innerHeight * 0.35;
          triggerDrum(drum, posX, posY);
        }
      });

      // Advance step
      stepRef.current = (step + 1) % STEP_COUNT;

      // Calculate step interval in ms from BPM (16th notes: (60 / BPM) / 4 * 1000)
      const intervalMs = (60 / bpmRef.current / 4) * 1000;
      timerId = setTimeout(tick, intervalMs);
    };

    if (isPlaying) {
      musicStudioAudio.initCtx();
      const intervalMs = (60 / bpmRef.current / 4) * 1000;
      timerId = setTimeout(tick, intervalMs);
    } else {
      if (timerId) clearTimeout(timerId);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isPlaying, triggerNote, triggerDrum]);

  // Toggle Step in Note Pattern
  const toggleNoteStep = (noteId: string, stepIdx: number) => {
    setNotePattern((prev) => {
      const nextArr = [...(prev[noteId] || new Array(STEP_COUNT).fill(false))];
      nextArr[stepIdx] = !nextArr[stepIdx];
      return { ...prev, [noteId]: nextArr };
    });
    // Preview note sound on click
    const n = PIANO_NOTES.find((item) => item.id === noteId);
    if (n) {
      triggerNote(n);
    }
  };

  // Toggle Step in Drum Pattern
  const toggleDrumStep = (drumType: DrumType, stepIdx: number) => {
    setDrumPattern((prev) => {
      const nextArr = [...(prev[drumType] || new Array(STEP_COUNT).fill(false))];
      nextArr[stepIdx] = !nextArr[stepIdx];
      return { ...prev, [drumType]: nextArr };
    });
    // Preview drum sound on click
    const d = DRUM_PADS.find((item) => item.type === drumType);
    if (d) {
      triggerDrum(d);
    }
  };

  // Clear all patterns
  const handleClearPattern = () => {
    setNotePattern(() => {
      const empty: Record<string, boolean[]> = {};
      PIANO_NOTES.forEach((n) => {
        empty[n.id] = new Array(STEP_COUNT).fill(false);
      });
      return empty;
    });
    setDrumPattern(() => {
      const empty: Record<string, boolean[]> = {};
      DRUM_PADS.forEach((d) => {
        empty[d.type] = new Array(STEP_COUNT).fill(false);
      });
      return empty;
    });
  };

  // Random Melody & Rhythm Generator (Harmonic Pentatonic & 432Hz motifs)
  const generateRandomMelody = () => {
    musicStudioAudio.initCtx();

    // Reset notes
    const newNotePat: Record<string, boolean[]> = {};
    PIANO_NOTES.forEach((n) => {
      newNotePat[n.id] = new Array(STEP_COUNT).fill(false);
    });

    // Melodic styles: Ambient Arp, Zen Pentatonic Wave, or Sacred Chime
    const style = Math.floor(Math.random() * 3);

    if (style === 0) {
      // Flowing ascending/descending arpeggio
      const noteIndices = [0, 2, 4, 6, 7, 5, 3, 1, 0, 3, 5, 7, 6, 4, 2, 1];
      for (let s = 0; s < STEP_COUNT; s++) {
        if (Math.random() > 0.35) {
          const noteIdx = noteIndices[s % noteIndices.length];
          const note = PIANO_NOTES[noteIdx];
          if (note) newNotePat[note.id][s] = true;
        }
      }
    } else if (style === 1) {
      // Syncopated zen chord progression
      const anchors = [0, 4, 8, 12];
      anchors.forEach((step) => {
        const root = PIANO_NOTES[Math.floor(Math.random() * 3)];
        const fifth = PIANO_NOTES[4 + Math.floor(Math.random() * 4)];
        if (root) newNotePat[root.id][step] = true;
        if (fifth && Math.random() > 0.4) newNotePat[fifth.id][step + 2] = true;
      });
      // Add twinkling high accents
      for (let s = 0; s < STEP_COUNT; s++) {
        if (s % 2 === 1 && Math.random() > 0.6) {
          const highNote = PIANO_NOTES[5 + Math.floor(Math.random() * 3)];
          if (highNote) newNotePat[highNote.id][s] = true;
        }
      }
    } else {
      // Ambient bell pulses
      const pulses = [0, 3, 6, 8, 11, 14];
      pulses.forEach((step) => {
        const note = PIANO_NOTES[Math.floor(Math.random() * PIANO_NOTES.length)];
        if (note) newNotePat[note.id][step] = true;
      });
    }

    setNotePattern(newNotePat);

    // Complementary organic rhythm
    const newDrumPat: Record<string, boolean[]> = {};
    DRUM_PADS.forEach((d) => {
      newDrumPat[d.type] = new Array(STEP_COUNT).fill(false);
    });

    // Deep heartbeat bass on 0, 8 or 0, 6, 10
    newDrumPat['kick'][0] = true;
    if (Math.random() > 0.4) newDrumPat['kick'][8] = true;
    if (Math.random() > 0.5) newDrumPat['kick'][10] = true;

    // Resonant Hang bell ding on 4, 12
    newDrumPat['ding'][4] = true;
    if (Math.random() > 0.3) newDrumPat['ding'][12] = true;

    // Crisp high shaker groove
    for (let s = 0; s < STEP_COUNT; s++) {
      if (s % 2 === 0 && Math.random() > 0.4) {
        newDrumPat['shaker'][s] = true;
      }
      if (s % 4 === 2 && Math.random() > 0.5) {
        newDrumPat['snare'][s] = true;
      }
    }

    setDrumPattern(newDrumPat);

    // Auto-start playback if not already running so user hears the result immediately
    if (!isPlaying) {
      setIsPlaying(true);
    }

    // Gentle visual flare
    spawnVisualEcho(window.innerWidth * 0.5, window.innerHeight * 0.45, '#38bdf8', 432);
  };

  // Keyboard shortcut listener (1-8 for notes, Q-S for drums, Space for Play/Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
        return;
      }

      const key = e.key.toUpperCase();
      const foundNote = PIANO_NOTES.find((n) => n.key === key);
      if (foundNote) {
        triggerNote(foundNote);
        return;
      }

      const foundDrum = DRUM_PADS.find((d) => d.key === key);
      if (foundDrum) {
        triggerDrum(foundDrum);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerNote, triggerDrum]);

  // Main visualizer render loop
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
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      phaseRef.current += 0.016;
      const t = phaseRef.current;

      // Serene deep background trail
      ctx.fillStyle = 'rgba(2, 6, 23, 0.22)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.38;

      // 1. Sacred 432 Hz Harmonic Lissajous Mandala
      ctx.save();
      ctx.translate(centerX, centerY);

      const baseR = Math.min(width, height) * 0.24;
      const a = 3;
      const b = 4;
      const delta = t * 0.45;

      ctx.beginPath();
      for (let theta = 0; theta <= Math.PI * 2 + 0.05; theta += 0.03) {
        const rMod = 1 + 0.08 * Math.sin(theta * 6 + t * 2);
        const x = baseR * rMod * Math.sin(a * theta + delta);
        const y = baseR * rMod * Math.sin(b * theta);

        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      ctx.strokeStyle = 'rgba(52, 211, 153, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(52, 211, 153, 0.35)';
      ctx.shadowBlur = 14;
      ctx.stroke();

      // Secondary delicate harmonic circle
      ctx.beginPath();
      for (let theta = 0; theta <= Math.PI * 2 + 0.05; theta += 0.04) {
        const x = baseR * 0.65 * Math.cos(theta * 2 - delta * 0.8);
        const y = baseR * 0.65 * Math.sin(theta * 3 + delta * 0.5);
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 8;
      ctx.stroke();

      ctx.restore();

      // 2. Sound ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        rip.radius += rip.speed;
        rip.alpha *= 0.965;

        if (rip.alpha < 0.01 || rip.radius > rip.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = rip.color;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = rip.alpha;
        ctx.shadowColor = rip.color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        const steps = 60;
        for (let s = 0; s <= steps; s++) {
          const angle = (Math.PI * 2 * s) / steps;
          const petalMod = 1 + 0.06 * Math.sin(angle * rip.petals + t * 3);
          const r = rip.radius * petalMod;
          const px = rip.x + Math.cos(angle) * r;
          const py = rip.y + Math.sin(angle) * r;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // 3. Stardust particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;

        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const alpha = (1 - progress) * p.alpha;
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#020617] text-stone-100 select-none overflow-hidden font-sans touch-none flex flex-col justify-between"
    >
      {/* 1. TOP BAR: MINIMAL CLEAN HEADER WITH RETURN ARROW & QUICK ACTION BUTTONS */}
      <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Return Arrow */}
        <button
          type="button"
          onClick={() => onSwitchTab?.('counter')}
          className="pointer-events-auto w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 border border-slate-700/50 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
          title="Повернутися"
          aria-label="Повернутися"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Top Control Cluster (Play/Pause, Random Melody, Pattern Toggle) */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/70 border border-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
          {/* Play / Pause Sequencer */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer active:scale-95 ${
              isPlaying
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/50'
            }`}
            title="Запустити / Зупинити патерн (Пробіл)"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isPlaying ? 'Пауза' : 'Грати'}</span>
          </button>

          {/* Random Melody Generator */}
          <button
            type="button"
            onClick={generateRandomMelody}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 transition-all cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
            title="Згенерувати випадкову гармонійну мелодію 432 Гц"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Випадкова мелодія</span>
            <span className="sm:hidden">Мелодія</span>
          </button>

          {/* Toggle Pattern Sequencer Editor */}
          <button
            type="button"
            onClick={() => setShowPatternEditor((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer active:scale-95 ${
              showPatternEditor
                ? 'bg-sky-500/25 text-sky-300 border border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/50'
            }`}
            title="Конструктор патернів"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Патерни</span>
            {showPatternEditor ? <ChevronDown className="w-3 h-3 ml-0.5" /> : <ChevronUp className="w-3 h-3 ml-0.5" />}
          </button>
        </div>
      </header>

      {/* 2. FULL-SCREEN INTERACTIVE CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full cursor-pointer touch-none"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          musicStudioAudio.playNote(currentInstrument, 432.0);
          spawnVisualEcho(x, y, '#34d399', 432.0);
        }}
      />

      {/* 3. INSTRUMENT SELECTOR BAR (TOP-CENTER UNDER HEADER) */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-4 pt-16 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl overflow-x-auto max-w-full scrollbar-none">
          {INSTRUMENTS.map((inst) => {
            const isSelected = currentInstrument === inst.id;
            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => {
                  setCurrentInstrument(inst.id);
                  // Preview root note
                  musicStudioAudio.playNote(inst.id, 432);
                  spawnVisualEcho(window.innerWidth * 0.5, window.innerHeight * 0.38, inst.color, 432);
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-slate-800 text-white border shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
                }`}
                style={{
                  borderColor: isSelected ? `${inst.color}88` : 'transparent',
                  boxShadow: isSelected ? `0 0 14px ${inst.color}44` : undefined
                }}
                title={inst.description}
              >
                <span className="text-sm leading-none">{inst.icon}</span>
                <span>{inst.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PATTERN SEQUENCER DRAWER / OVERLAY */}
      {showPatternEditor && (
        <div className="relative z-20 w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 bg-slate-950/90 border border-slate-800/90 rounded-3xl backdrop-blur-xl shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 pointer-events-auto flex flex-col space-y-3">
          {/* Sequencer Header Controls */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/70 pb-2.5">
            {/* Section tabs: Melody vs Drums */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTabSection('melody')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTabSection === 'melody'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Мелодія ({INSTRUMENTS.find((i) => i.id === currentInstrument)?.name})
              </button>
              <button
                type="button"
                onClick={() => setActiveTabSection('drums')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTabSection === 'drums'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Перкусія (Ритм)
              </button>
            </div>

            {/* Tempo BPM & Clear */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-slate-300">{bpm} BPM</span>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-16 sm:w-20 accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  title="Темп (BPM)"
                />
              </div>

              <button
                type="button"
                onClick={handleClearPattern}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-900/50 transition-all cursor-pointer"
                title="Очистити сітку"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Step Number & Beat Indicator Header */}
          <div className="grid grid-cols-[56px_repeat(16,1fr)] gap-1 items-center px-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Крок</span>
            {Array.from({ length: STEP_COUNT }).map((_, stepIdx) => {
              const isCurrent = isPlaying && currentStep === stepIdx;
              const isBeatStart = stepIdx % 4 === 0;
              return (
                <div
                  key={stepIdx}
                  className={`h-3 rounded-sm flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : isBeatStart
                      ? 'bg-slate-700/60'
                      : 'bg-slate-800/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Grid Rows (Melody or Percussion) */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {activeTabSection === 'melody'
              ? // Melody Note Rows (from high note C5 down to D3)
                [...PIANO_NOTES].reverse().map((note) => (
                  <div key={note.id} className="grid grid-cols-[56px_repeat(16,1fr)] gap-1 items-center">
                    <button
                      type="button"
                      onClick={() => triggerNote(note)}
                      className="text-left text-[11px] font-mono font-medium px-1.5 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/50 truncate cursor-pointer"
                      style={{ color: note.color }}
                    >
                      {note.name}
                    </button>
                    {Array.from({ length: STEP_COUNT }).map((_, stepIdx) => {
                      const isActive = notePattern[note.id]?.[stepIdx] || false;
                      const isCurrent = isPlaying && currentStep === stepIdx;
                      const isBeatStart = stepIdx % 4 === 0;

                      return (
                        <button
                          key={stepIdx}
                          type="button"
                          onClick={() => toggleNoteStep(note.id, stepIdx)}
                          className={`h-6 sm:h-7 rounded-md border transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? 'border-transparent shadow-sm'
                              : isBeatStart
                              ? 'bg-slate-900/90 border-slate-700/60 hover:bg-slate-800'
                              : 'bg-slate-950/70 border-slate-800/50 hover:bg-slate-800/70'
                          } ${isCurrent ? 'ring-1 ring-emerald-400' : ''}`}
                          style={{
                            backgroundColor: isActive ? note.color : undefined,
                            boxShadow: isActive ? `0 0 10px ${note.color}88` : undefined
                          }}
                        />
                      );
                    })}
                  </div>
                ))
              : // Percussion Drum Rows
                DRUM_PADS.map((drum) => (
                  <div key={drum.type} className="grid grid-cols-[56px_repeat(16,1fr)] gap-1 items-center">
                    <button
                      type="button"
                      onClick={() => triggerDrum(drum)}
                      className="text-left text-[11px] font-mono font-medium px-1.5 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/50 truncate cursor-pointer"
                      style={{ color: drum.color }}
                    >
                      {drum.name}
                    </button>
                    {Array.from({ length: STEP_COUNT }).map((_, stepIdx) => {
                      const isActive = drumPattern[drum.type]?.[stepIdx] || false;
                      const isCurrent = isPlaying && currentStep === stepIdx;
                      const isBeatStart = stepIdx % 4 === 0;

                      return (
                        <button
                          key={stepIdx}
                          type="button"
                          onClick={() => toggleDrumStep(drum.type, stepIdx)}
                          className={`h-6 sm:h-7 rounded-md border transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? 'border-transparent shadow-sm'
                              : isBeatStart
                              ? 'bg-slate-900/90 border-slate-700/60 hover:bg-slate-800'
                              : 'bg-slate-950/70 border-slate-800/50 hover:bg-slate-800/70'
                          } ${isCurrent ? 'ring-1 ring-sky-400' : ''}`}
                          style={{
                            backgroundColor: isActive ? drum.color : undefined,
                            boxShadow: isActive ? `0 0 10px ${drum.color}88` : undefined
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* 5. FLOATING TACTILE LIVE INSTRUMENTS (BOTTOM) */}
      <div className="relative z-20 w-full max-w-lg mx-auto px-4 pb-8 pt-4 flex flex-col justify-end pointer-events-none space-y-4">
        {/* Rhythmic Chime & Drum Pearls (Top Arc) */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 pointer-events-auto">
          {DRUM_PADS.map((drum) => {
            const isHit = activeDrumType === drum.type;
            return (
              <button
                key={drum.type}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  triggerDrum(drum, rect.left + rect.width / 2, rect.top + rect.height / 2);
                }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border transition-all duration-150 flex flex-col items-center justify-center cursor-pointer select-none active:scale-90 backdrop-blur-md ${
                  isHit
                    ? 'scale-110 shadow-[0_0_24px_rgba(255,255,255,0.4)]'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-700/60 shadow-lg'
                }`}
                style={{
                  borderColor: isHit ? drum.color : undefined,
                  boxShadow: isHit ? `0 0 20px ${drum.color}88` : undefined
                }}
                title={`${drum.name} [${drum.key}]`}
              >
                <span
                  className="text-base sm:text-lg font-bold leading-none mb-0.5"
                  style={{ color: drum.color }}
                >
                  {drum.symbol}
                </span>
                <span className="text-[9px] font-semibold text-slate-300 leading-none">
                  {drum.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 432 Hz Solfeggio & Harmonic Sound Blades */}
        <div className="grid grid-cols-8 gap-1.5 sm:gap-2.5 pointer-events-auto pt-1">
          {PIANO_NOTES.map((note, idx) => {
            const isPressed = activeNoteId === note.id;
            const isRoot432 = note.freq === 432.0;

            const curveOffset = Math.abs(idx - 3.5);
            const heightClass =
              curveOffset > 2.5
                ? 'h-24 sm:h-32'
                : curveOffset > 1.5
                ? 'h-28 sm:h-36'
                : 'h-32 sm:h-40';

            return (
              <button
                key={note.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  triggerNote(note, rect.left + rect.width / 2, rect.top + rect.height / 2);
                }}
                className={`${heightClass} rounded-2xl sm:rounded-3xl border transition-all duration-150 flex flex-col justify-between p-2 text-center cursor-pointer select-none active:scale-95 backdrop-blur-md relative overflow-hidden group ${
                  isPressed
                    ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.6)] translate-y-1 scale-105'
                    : isRoot432
                    ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/50 shadow-md'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800/70 shadow-md'
                }`}
              >
                {/* Note Key number shortcut */}
                <span className="text-[10px] font-mono text-slate-400 font-semibold">
                  {note.key}
                </span>

                {/* Soft glow bar on press */}
                <div
                  className={`w-full h-1.5 rounded-full transition-all ${
                    isPressed
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : isRoot432
                      ? 'bg-emerald-500/40'
                      : 'bg-slate-700/30'
                  }`}
                />

                {/* Note name & frequency */}
                <div className="w-full">
                  <span
                    className={`block text-xs sm:text-sm font-bold leading-tight ${
                      isRoot432 ? 'text-emerald-300' : 'text-slate-200'
                    }`}
                  >
                    {note.name}
                  </span>
                  <span className="block text-[9px] font-mono text-slate-400 leading-none mt-0.5">
                    {note.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
