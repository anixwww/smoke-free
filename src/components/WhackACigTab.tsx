import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Play,
  Timer,
  Zap,
  Sparkles,
  Flame,
  Award,
  Hammer
} from 'lucide-react';

interface WhackACigTabProps {
  onSwitchTab: (tab: any) => void;
  cigsAvoided?: number;
}

type HoleContent = 'empty' | 'cig' | 'vape' | 'gold_cig' | 'bomb' | 'water';

interface HoleState {
  id: number;
  content: HoleContent;
  isHit: boolean;
  timeLeft: number;
}

class WhackAudio {
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

  playHit(isGold: boolean = false) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isGold ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(isGold ? 880 : 360, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.14);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {}
  }

  playBomb() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392.0, 523.25];
      notes.forEach((f, i) => {
        const now = this.ctx!.currentTime + i * 0.09;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch (e) {}
  }
}

export const WhackACigTab: React.FC<WhackACigTabProps> = ({ onSwitchTab, cigsAvoided = 0 }) => {
  const audioRef = useRef<WhackAudio>(new WhackAudio());
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAME_OVER'>('READY');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [cigsSmashed, setCigsSmashed] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('quit-smoking:whack-highscore') || 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    audioRef.current.enabled = soundEnabled;
  }, [soundEnabled]);

  const [holes, setHoles] = useState<HoleState[]>(() =>
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      content: 'empty',
      isHit: false,
      timeLeft: 0
    }))
  );

  const [hitFeedback, setHitFeedback] = useState<{ id: number; text: string; color: string } | null>(null);

  // Start game round
  const startGame = () => {
    setScore(0);
    setCombo(1);
    setCigsSmashed(0);
    setTimeLeft(60);
    setHoles(
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        content: 'empty',
        isHit: false,
        timeLeft: 0
      }))
    );
    setGameState('PLAYING');
    audioRef.current.playHit();
  };

  // Main 60-Second Game Timer
  useEffect(() => {
    let timerId: any;
    if (gameState === 'PLAYING') {
      timerId = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameState('GAME_OVER');
            audioRef.current.playVictory();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [gameState]);

  // Spawner & Entity Lifecycle Loop
  useEffect(() => {
    let spawnId: any;
    if (gameState === 'PLAYING') {
      spawnId = setInterval(() => {
        setHoles((prevHoles) => {
          const updated = prevHoles.map((h) => {
            if (h.content !== 'empty' && h.timeLeft > 0) {
              return { ...h, timeLeft: h.timeLeft - 1 };
            }
            return { ...h, content: 'empty' as HoleContent, isHit: false, timeLeft: 0 };
          });

          // Count active holes
          const activeCount = updated.filter((h) => h.content !== 'empty').length;
          if (activeCount < 3) {
            // Pick a random empty hole
            const emptyHoles = updated.filter((h) => h.content === 'empty');
            if (emptyHoles.length > 0) {
              const target = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
              const rand = Math.random();
              let content: HoleContent = 'cig';
              let duration = 14; // ~1.4s at 100ms interval

              if (rand < 0.15) {
                content = 'bomb';
                duration = 16;
              } else if (rand < 0.3) {
                content = 'gold_cig';
                duration = 10;
              } else if (rand < 0.55) {
                content = 'vape';
                duration = 11;
              } else if (rand < 0.7) {
                content = 'water';
                duration = 15;
              }

              return updated.map((h) =>
                h.id === target.id ? { ...h, content, isHit: false, timeLeft: duration } : h
              );
            }
          }
          return updated;
        });
      }, 100);
    }
    return () => clearInterval(spawnId);
  }, [gameState]);

  // Click / Tap Hole Handler
  const handleWhack = (holeId: number) => {
    if (gameState !== 'PLAYING') return;

    const hole = holes.find((h) => h.id === holeId);
    if (!hole || hole.content === 'empty' || hole.isHit) return;

    if (hole.content === 'bomb') {
      // Hit a bomb! Lose points and reset combo
      audioRef.current.playBomb();
      setCombo(1);
      setScore((s) => Math.max(0, s - 25));
      setHitFeedback({ id: holeId, text: '-25 ПОПІЛЬНА БОМБА! 💥', color: '#ef4444' });
    } else if (hole.content === 'water') {
      // Hit clean water bonus!
      audioRef.current.playHit(true);
      const pts = 20 * combo;
      setScore((s) => s + pts);
      setHitFeedback({ id: holeId, text: `+${pts} КОВТОК ВОДИ! 💧`, color: '#38bdf8' });
    } else {
      // Hit a Cigarette / Vape / Gold Cig
      const isGold = hole.content === 'gold_cig';
      audioRef.current.playHit(isGold);

      const basePts = isGold ? 50 : hole.content === 'vape' ? 25 : 10;
      const pts = basePts * combo;

      setScore((prev) => {
        const next = prev + pts;
        if (next > highScore) {
          setHighScore(next);
          try {
            localStorage.setItem('quit-smoking:whack-highscore', String(next));
          } catch {}
        }
        return next;
      });

      setCombo((c) => Math.min(8, c + 1));
      setCigsSmashed((c) => c + 1);

      setHitFeedback({
        id: holeId,
        text: `+${pts} ${isGold ? 'ЗОЛОТИЙ УДАР! 👑' : 'ТРОЩИ! 🔥'}`,
        color: isGold ? '#fbbf24' : '#4ade80'
      });
    }

    // Mark as hit
    setHoles((prev) =>
      prev.map((h) => (h.id === holeId ? { ...h, isHit: true, timeLeft: 3 } : h))
    );

    setTimeout(() => setHitFeedback(null), 700);
  };

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

        {/* Score & Combo */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-mono uppercase">Очки</span>
            <span className="text-sm font-black text-amber-400 tabular-nums">{score}</span>
          </div>

          <div className="flex flex-col items-center bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
            <span className="text-[8px] text-emerald-400 uppercase font-bold">Комбо</span>
            <span className="text-xs font-black text-emerald-300">x{combo}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700 text-xs font-mono font-bold text-slate-200">
            <Timer className="w-3.5 h-3.5 text-orange-400" />
            <span>{timeLeft}с</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* 3x3 Ashtray Whack Grid Arena */}
      <div className="flex-1 p-4 flex flex-col justify-center items-center relative">
        <div className="grid grid-cols-3 gap-3.5 w-full max-w-sm aspect-square">
          {holes.map((hole) => {
            const isTarget = hole.content !== 'empty' && !hole.isHit;
            const isHit = hole.isHit;

            return (
              <button
                key={hole.id}
                type="button"
                onClick={() => handleWhack(hole.id)}
                className={`relative rounded-3xl bg-slate-900 border-2 flex flex-col items-center justify-center p-2 transition-all cursor-pointer active:scale-90 shadow-xl overflow-hidden ${
                  isTarget
                    ? 'border-amber-500/80 bg-slate-850 shadow-amber-500/20 scale-102'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Hole Pit Circle */}
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner relative">
                  {isTarget && (
                    <div className="text-3xl animate-bounce-short select-none">
                      {hole.content === 'cig' && '🚬'}
                      {hole.content === 'vape' && '💨'}
                      {hole.content === 'gold_cig' && '👑'}
                      {hole.content === 'bomb' && '💣'}
                      {hole.content === 'water' && '💧'}
                    </div>
                  )}

                  {isHit && (
                    <div className="text-2xl animate-spin text-amber-400 select-none">
                      💥
                    </div>
                  )}
                </div>

                {/* Floating Feedback Label */}
                {hitFeedback && hitFeedback.id === hole.id && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs rounded-3xl font-black text-xs text-center p-1 animate-fade-in z-20"
                    style={{ color: hitFeedback.color }}
                  >
                    {hitFeedback.text}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Start / Game Over Modal Overlays */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-3xl mb-3 shadow-xl shadow-orange-500/20">
              🔨
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Трощи Недопалки!</h2>
            <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
              Бийте молотом по сигаретах та вейпах, що вискакують з попільничок! Уникайте бомб (💣) та ловіть золоті сигарети (👑)!
            </p>

            <button
              type="button"
              onClick={startGame}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Почати раунд (60 сек)</span>
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl mb-3">
              🏆
            </div>
            <h3 className="text-2xl font-black text-emerald-400 mb-1">Час вичерпано!</h3>
            <p className="text-xs text-slate-400 mb-5">Чудова реакція! Недопалки розтрощено!</p>

            <div className="w-full max-w-xs bg-slate-900 rounded-2xl border border-slate-800 p-4 mb-5 grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Очки</span>
                <span className="text-xl font-black text-amber-400">{score}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Розтрощено</span>
                <span className="text-xl font-black text-emerald-400">{cigsSmashed}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
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
