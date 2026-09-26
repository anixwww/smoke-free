import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Clock, 
  Target, 
  Sparkles, 
  BarChart2, 
  Trash2, 
  ShieldCheck,
  CheckCircle2,
  Sliders
} from 'lucide-react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  colorTheme: BubbleTheme;
  phase: number;
  swaySpeed: number;
  swayAmp: number;
  wobblePhase: number;
  wobbleSpeed: number;
  popping: boolean;
  popProgress: number; // 0 to 1
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface BubbleTheme {
  name: string;
  rimColor: string;
  innerGradStart: string;
  innerGradEnd: string;
  highlight: string;
  particleColor: string;
}

const BUBBLE_THEMES: BubbleTheme[] = [
  {
    name: 'cyan',
    rimColor: 'rgba(56, 189, 248, 0.75)',
    innerGradStart: 'rgba(56, 189, 248, 0.12)',
    innerGradEnd: 'rgba(99, 102, 241, 0.05)',
    highlight: 'rgba(255, 255, 255, 0.85)',
    particleColor: 'rgba(56, 189, 248, 0.8)'
  },
  {
    name: 'emerald',
    rimColor: 'rgba(52, 211, 153, 0.75)',
    innerGradStart: 'rgba(52, 211, 153, 0.12)',
    innerGradEnd: 'rgba(20, 184, 166, 0.05)',
    highlight: 'rgba(255, 255, 255, 0.85)',
    particleColor: 'rgba(52, 211, 153, 0.8)'
  },
  {
    name: 'lavender',
    rimColor: 'rgba(168, 85, 247, 0.75)',
    innerGradStart: 'rgba(168, 85, 247, 0.12)',
    innerGradEnd: 'rgba(236, 72, 153, 0.05)',
    highlight: 'rgba(255, 255, 255, 0.85)',
    particleColor: 'rgba(168, 85, 247, 0.8)'
  },
  {
    name: 'amber',
    rimColor: 'rgba(251, 191, 36, 0.75)',
    innerGradStart: 'rgba(251, 191, 36, 0.12)',
    innerGradEnd: 'rgba(249, 115, 22, 0.05)',
    highlight: 'rgba(255, 255, 255, 0.85)',
    particleColor: 'rgba(251, 191, 36, 0.8)'
  },
  {
    name: 'rose',
    rimColor: 'rgba(244, 63, 94, 0.75)',
    innerGradStart: 'rgba(244, 63, 94, 0.12)',
    innerGradEnd: 'rgba(236, 72, 153, 0.05)',
    highlight: 'rgba(255, 255, 255, 0.85)',
    particleColor: 'rgba(244, 63, 94, 0.8)'
  },
  {
    name: 'teal',
    rimColor: 'rgba(45, 212, 191, 0.75)',
    innerGradStart: 'rgba(45, 212, 191, 0.12)',
    innerGradEnd: 'rgba(6, 182, 212, 0.05)',
    highlight: 'rgba(255, 255, 255, 0.85)',
    particleColor: 'rgba(45, 212, 191, 0.8)'
  }
];

// Meditative Pentatonic scale frequencies for popping chimes (Hz)
const PENTATONIC_FREQS = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

export interface BubbleSessionRecord {
  id: string;
  date: string;
  durationSeconds: number;
  poppedCount: number;
}

export interface BubbleStatsData {
  totalPopped: number;
  longestSessionSeconds: number;
  maxSessionPopped: number;
  sessions: BubbleSessionRecord[];
}

const STORAGE_KEY = 'quit-smoking:bubble-meditation-records';

const formatDuration = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const AntiStressBubbles: React.FC = () => {
  // Navigation / views
  const [view, setView] = useState<'arena' | 'ranking'>('arena');

  // Game states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [sessionPopped, setSessionPopped] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Persistence stats
  const [stats, setStats] = useState<BubbleStatsData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      totalPopped: 0,
      longestSessionSeconds: 0,
      maxSessionPopped: 0,
      sessions: []
    };
  });

  // Save stats on change
  const saveStats = (newStats: BubbleStatsData) => {
    setStats(newStats);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    } catch {}
  };

  // Canvas and animation references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const nextBubbleIdRef = useRef<number>(1);
  const lastSpawnTimeRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Session duration timer (counts UP indefinitely)
  useEffect(() => {
    if (isPlaying) {
      sessionTimerRef.current = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    }
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isPlaying]);

  // Audio synthesizer: soft meditative water-bell pop with pentatonic harmony
  const playHarmonicPop = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pick harmonic note from pentatonic scale with subtle detune
      const baseFreq = PENTATONIC_FREQS[Math.floor(Math.random() * PENTATONIC_FREQS.length)];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 0.95, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.05);

      // Very soft, smooth envelope
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }, [soundEnabled]);

  // Spawn gentle bubble with physical properties
  const spawnBubble = (canvasWidth: number, canvasHeight: number) => {
    const id = nextBubbleIdRef.current++;
    // Moderate sizes for realistic soap bubbles: 36px to 62px diameter
    const radius = 18 + Math.random() * 14;
    const x = radius + Math.random() * (canvasWidth - radius * 2);
    const y = canvasHeight + radius + Math.random() * 20;

    // Meditative slow upward speed: 0.35 to 0.75 px per frame
    const vy = -(0.35 + Math.random() * 0.4);
    const vx = (Math.random() - 0.5) * 0.15;
    const theme = BUBBLE_THEMES[Math.floor(Math.random() * BUBBLE_THEMES.length)];

    const bubble: Bubble = {
      id,
      x,
      y,
      radius,
      baseRadius: radius,
      vx,
      vy,
      colorTheme: theme,
      phase: Math.random() * Math.PI * 2,
      swaySpeed: 0.012 + Math.random() * 0.01,
      swayAmp: 0.4 + Math.random() * 0.5,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.015,
      popping: false,
      popProgress: 0
    };

    bubblesRef.current.push(bubble);
  };

  // Pop micro-particles
  const spawnPopParticles = (x: number, y: number, color: string, radius: number) => {
    const count = Math.floor(6 + Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 0.8 + Math.random() * 1.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2, // slight upward float
        radius: 1 + Math.random() * 1.8,
        color,
        alpha: 0.85,
        life: 0,
        maxLife: 18 + Math.floor(Math.random() * 10)
      });
    }
  };

  // Pop bubble handler
  const popBubble = (b: Bubble) => {
    if (b.popping) return;
    b.popping = true;
    playHarmonicPop();

    // Haptic vibration if available
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {}
    }

    spawnPopParticles(b.x, b.y, b.colorTheme.particleColor, b.radius);
    setSessionPopped((prev) => prev + 1);
  };

  // Start / Resume session
  const handleStartSession = () => {
    setIsPlaying(true);
    setView('arena');
  };

  // Pause session
  const handlePauseSession = () => {
    setIsPlaying(false);
  };

  // Finish session and record to leaderboard
  const handleFinishSession = () => {
    setIsPlaying(false);
    if (sessionPopped > 0 || sessionSeconds > 10) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const newRecord: BubbleSessionRecord = {
        id: `sess_${Date.now()}`,
        date: dateStr,
        durationSeconds: sessionSeconds,
        poppedCount: sessionPopped
      };

      const updatedSessions = [newRecord, ...stats.sessions].slice(0, 50);
      const updatedStats: BubbleStatsData = {
        totalPopped: stats.totalPopped + sessionPopped,
        longestSessionSeconds: Math.max(stats.longestSessionSeconds, sessionSeconds),
        maxSessionPopped: Math.max(stats.maxSessionPopped, sessionPopped),
        sessions: updatedSessions
      };

      saveStats(updatedStats);
    }

    // Reset current active session counters
    setSessionSeconds(0);
    setSessionPopped(0);
    setView('ranking');
  };

  // Reset / Clear history
  const handleClearHistory = () => {
    if (window.confirm('Очистити історію сесій та скинути рекорди?')) {
      const reset: BubbleStatsData = {
        totalPopped: 0,
        longestSessionSeconds: 0,
        maxSessionPopped: 0,
        sessions: []
      };
      saveStats(reset);
    }
  };

  // Handle interaction (click or touch) on canvas
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Check hit against active bubbles (from top-most rendered downwards)
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];
      if (b.popping) continue;

      const dx = clickX - b.x;
      const dy = clickY - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Hit radius with comfortable 8px tap margin
      if (dist <= b.radius + 8) {
        popBubble(b);
        break; // pop one per tap for realistic precision
      }
    }
  };

  // Physics and Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      if (!isRunning) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // Handle DPI scaling
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Spawning logic (spawns when playing or keeps 6-9 calm ambient bubbles on screen)
      const targetBubbleCount = isPlaying ? 10 : 6;
      if (time - lastSpawnTimeRef.current > 1400 && bubblesRef.current.length < targetBubbleCount) {
        spawnBubble(width, height);
        lastSpawnTimeRef.current = time;
      }

      // Initial fill if empty
      if (bubblesRef.current.length === 0) {
        for (let i = 0; i < 4; i++) {
          spawnBubble(width, height);
          const b = bubblesRef.current[bubblesRef.current.length - 1];
          b.y = height * (0.2 + 0.2 * i);
        }
      }

      // 1. Update and Render Bubbles
      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const b = bubblesRef.current[i];

        if (b.popping) {
          b.popProgress += 0.12;
          if (b.popProgress >= 1) {
            bubblesRef.current.splice(i, 1);
            continue;
          }
        } else {
          // Physical motion
          b.phase += b.swaySpeed;
          b.wobblePhase += b.wobbleSpeed;

          // Gentle buoyancy and lateral breeze sway
          b.x += b.vx + Math.sin(b.phase) * b.swayAmp;
          b.y += b.vy;

          // Organic wobble breathing (radius oscillates ±3%)
          b.radius = b.baseRadius * (1 + 0.035 * Math.sin(b.wobblePhase));

          // Boundary bounce / gentle wrap on edges
          if (b.x < b.radius) {
            b.x = b.radius;
            b.vx = Math.abs(b.vx);
          } else if (b.x > width - b.radius) {
            b.x = width - b.radius;
            b.vx = -Math.abs(b.vx);
          }

          // Off-screen cleanup at top
          if (b.y < -b.radius * 2) {
            bubblesRef.current.splice(i, 1);
            continue;
          }
        }

        // Draw physical realistic soap bubble
        ctx.save();
        ctx.translate(b.x, b.y);

        const currentRadius = b.popping ? b.radius * (1 + b.popProgress * 0.4) : b.radius;
        const currentAlpha = b.popping ? Math.max(0, 1 - b.popProgress) : 1;

        ctx.globalAlpha = currentAlpha;

        // Inner soft radial gradient (iridescent wash)
        const innerGrad = ctx.createRadialGradient(
          -currentRadius * 0.2,
          -currentRadius * 0.2,
          currentRadius * 0.1,
          0,
          0,
          currentRadius
        );
        innerGrad.addColorStop(0, b.colorTheme.innerGradStart);
        innerGrad.addColorStop(0.7, b.colorTheme.innerGradEnd);
        innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = innerGrad;
        ctx.fill();

        // Iridescent outer rim with subtle glow
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = b.colorTheme.rimColor;
        ctx.stroke();

        // Secondary inner rim reflection
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius - 1.2, 0, Math.PI * 2);
        ctx.stroke();

        // Primary specular crescent reflection (top-left)
        ctx.save();
        ctx.rotate(-Math.PI / 4);
        ctx.beginPath();
        ctx.ellipse(
          0,
          -currentRadius * 0.65,
          currentRadius * 0.35,
          currentRadius * 0.12,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = b.colorTheme.highlight;
        ctx.fill();
        ctx.restore();

        // Secondary subtle rim reflection (bottom-right)
        ctx.save();
        ctx.rotate(Math.PI * 0.75);
        ctx.beginPath();
        ctx.ellipse(
          0,
          -currentRadius * 0.7,
          currentRadius * 0.22,
          currentRadius * 0.08,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();
        ctx.restore();

        ctx.restore();
      }

      // 2. Update and Render Pop Micro-Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#141417] border border-zinc-800 text-left space-y-4 relative overflow-hidden transition-all shadow-sm">
      {/* Header with Navigation & Controls */}
      <div className="flex items-center justify-between relative z-10 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 tracking-tight leading-none">
              Антистрес-гра «Лопай бульбашки»
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 leading-tight">
              Медитативні плавні бульбашки для зняття напруги та переключення уваги
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setView(view === 'arena' ? 'ranking' : 'arena')}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              view === 'ranking'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-2xs'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
            title="Таблиця рекордів"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Рейтинг</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title={soundEnabled ? 'Вимкнути звук' : 'Увімкнути гармонійний звук'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: GAME ARENA */}
      {view === 'arena' && (
        <div className="space-y-3">
          {/* Top Live Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* 1. Лопнуто */}
            <div className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 flex flex-col justify-center items-center">
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-1">
                <Target className="w-3 h-3 text-sky-400" />
                Лопнуто
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-sky-400 mt-0.5 tabular-nums">
                {sessionPopped}
              </span>
            </div>

            {/* 2. Тривалість сесії (необмежена) */}
            <div className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 flex flex-col justify-center items-center">
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                Сесія
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-0.5 tabular-nums">
                {formatDuration(sessionSeconds)}
              </span>
            </div>

            {/* 3. Рекорд сесії */}
            <div className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 flex flex-col justify-center items-center">
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                Рекорд
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-amber-400 mt-0.5 tabular-nums">
                {stats.maxSessionPopped}
              </span>
            </div>
          </div>

          {/* Interactive Physics Canvas Arena */}
          <div
            ref={containerRef}
            className="w-full h-72 sm:h-80 rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-950 via-[#121217] to-zinc-950 relative overflow-hidden select-none cursor-pointer group shadow-inner"
            onPointerDown={(e) => handleCanvasInteraction(e.clientX, e.clientY)}
          >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Idle / Paused overlay instructions */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20 pointer-events-none">
                <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-2.5 shadow-sm">
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>
                <h4 className="text-xs font-bold text-zinc-100">
                  {sessionSeconds > 0 ? 'Гру призупинено' : 'Медитативне плавання бульбашок'}
                </h4>
                <p className="text-[11px] text-zinc-400 max-w-xs mt-1 leading-relaxed">
                  Час необмежений. Торкайтеся бульбашок для заспокійливого лопання.
                </p>
              </div>
            )}

            {/* In-game non-intrusive badge */}
            {isPlaying && (
              <div className="absolute top-2.5 left-2.5 pointer-events-none px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-medium text-zinc-400 flex items-center gap-1.5 backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Час не обмежений
              </div>
            )}
          </div>

          {/* Interactive Play Controls */}
          <div className="flex items-center gap-2 pt-1">
            {!isPlaying ? (
              <button
                type="button"
                onClick={handleStartSession}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{sessionSeconds > 0 ? 'Продовжити сесію' : 'Почати заспокійливу гру'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePauseSession}
                  className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] text-zinc-200 rounded-2xl font-semibold text-xs border border-zinc-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Pause className="w-4 h-4" />
                  <span>Пауза</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishSession}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Завершити та зберегти результат</span>
                </button>
              </>
            )}

            {/* Quick reset of current session without saving if paused and active */}
            {!isPlaying && sessionSeconds > 0 && (
              <button
                type="button"
                onClick={handleFinishSession}
                className="py-3 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-2xl font-semibold text-xs border border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5"
                title="Зберегти та завершити"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Зафіксувати</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: LEADERBOARD & RECORDS TABLE */}
      {view === 'ranking' && (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Найдовша сесія */}
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center justify-center">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-zinc-500">
                Найдовша сесія
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-zinc-100 mt-0.5 tabular-nums">
                {formatDuration(stats.longestSessionSeconds)}
              </span>
            </div>

            {/* Рекорд за 1 сесію */}
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center justify-center">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-zinc-500">
                Рекорд сесії
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-amber-400 mt-0.5 tabular-nums">
                {stats.maxSessionPopped}
              </span>
            </div>

            {/* Всього лопнуто за весь час */}
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center justify-center">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-1">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-zinc-500">
                Всього за весь час
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-sky-400 mt-0.5 tabular-nums">
                {stats.totalPopped}
              </span>
            </div>
          </div>

          {/* Sessions History Table */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Історія та рейтинг сесій</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">
                {stats.sessions.length} записів
              </span>
            </div>

            {stats.sessions.length === 0 ? (
              <div className="py-8 px-4 text-center text-zinc-500 text-xs">
                Ще немає завершених сесій. Пограйте трохи, щоб зафіксувати перше досягнення!
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y divide-zinc-800/60 text-xs">
                {stats.sessions.map((sess, idx) => {
                  const isLongest = sess.durationSeconds === stats.longestSessionSeconds && stats.longestSessionSeconds > 0;
                  const isMaxPopped = sess.poppedCount === stats.maxSessionPopped && stats.maxSessionPopped > 0;

                  return (
                    <div
                      key={sess.id}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 text-[11px] font-mono font-bold text-zinc-500 shrink-0 text-center">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-zinc-300">
                            {sess.date}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                            <span>Тривалість: {formatDuration(sess.durationSeconds)}</span>
                            {isLongest && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-semibold text-[9.5px]">
                                Найдовша
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-sky-400 text-xs tabular-nums">
                          {sess.poppedCount} бульбашок
                        </div>
                        {isMaxPopped && (
                          <span className="inline-block px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 font-semibold text-[9px] mt-0.5">
                            Рекорд
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons on ranking view */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setView('arena');
                handleStartSession();
              }}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Повернутися до гри</span>
            </button>

            {stats.sessions.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="py-2.5 px-3 bg-zinc-900 hover:bg-rose-500/15 text-zinc-500 hover:text-rose-400 rounded-xl text-xs font-medium border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Очистити історію"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Очистити історію</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
