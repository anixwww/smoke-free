import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  Play,
  Flame,
  Award,
  Grid
} from 'lucide-react';

interface BlockCrushTabProps {
  onSwitchTab: (tab: any) => void;
  cigsAvoided?: number;
}

type BlockType = 'empty' | 'cig' | 'ash' | 'fire' | 'filter';

class BlockAudio {
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

  playPlace() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playClear() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [440, 554, 659, 880];
      notes.forEach((f, i) => {
        const now = this.ctx!.currentTime + i * 0.06;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      });
    } catch (e) {}
  }
}

export const BlockCrushTab: React.FC<BlockCrushTabProps> = ({ onSwitchTab, cigsAvoided = 0 }) => {
  const audioRef = useRef<BlockAudio>(new BlockAudio());
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAME_OVER'>('READY');
  const [score, setScore] = useState<number>(0);
  const [linesClearedTotal, setLinesClearedTotal] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('quit-smoking:block-highscore') || 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    audioRef.current.enabled = soundEnabled;
  }, [soundEnabled]);

  // 8x8 Grid
  const [grid, setGrid] = useState<BlockType[][]>(() =>
    Array.from({ length: 8 }, () => Array(8).fill('empty'))
  );

  // 3 Placement Pieces
  const [pieces, setPieces] = useState<(boolean[][] | null)[]>([]);

  // Start new puzzle game
  const startPuzzle = () => {
    setScore(0);
    setLinesClearedTotal(0);
    setGrid(Array.from({ length: 8 }, () => Array(8).fill('empty')));
    generateNewPieces();
    setGameState('PLAYING');
  };

  const generateNewPieces = () => {
    const templates = [
      [[true, true]], // 1x2 horizontal
      [[true], [true]], // 2x1 vertical
      [[true, true, true]], // 1x3
      [[true], [true], [true]], // 3x1
      [
        [true, true],
        [true, true]
      ], // 2x2 square
      [
        [true, false],
        [true, true]
      ], // L shape
      [[true]] // 1x1 dot
    ];

    const drawn = [
      templates[Math.floor(Math.random() * templates.length)],
      templates[Math.floor(Math.random() * templates.length)],
      templates[Math.floor(Math.random() * templates.length)]
    ];
    setPieces(drawn);
  };

  // Place piece on grid
  const placePieceOnGrid = (pieceIdx: number, startR: number, startC: number) => {
    const piece = pieces[pieceIdx];
    if (!piece || gameState !== 'PLAYING') return;

    const pR = piece.length;
    const pC = piece[0].length;

    // Check bounds & collision
    for (let r = 0; r < pR; r++) {
      for (let c = 0; c < pC; c++) {
        if (piece[r][c]) {
          const targetR = startR + r;
          const targetC = startC + c;
          if (targetR < 0 || targetR >= 8 || targetC < 0 || targetC >= 8) return;
          if (grid[targetR][targetC] !== 'empty') return;
        }
      }
    }

    // Valid placement -> copy grid
    const newGrid = grid.map((row) => [...row]);
    const blockTypes: BlockType[] = ['cig', 'ash', 'fire', 'filter'];
    const chosenType = blockTypes[Math.floor(Math.random() * blockTypes.length)];

    for (let r = 0; r < pR; r++) {
      for (let c = 0; c < pC; c++) {
        if (piece[r][c]) {
          newGrid[startR + r][startC + c] = chosenType;
        }
      }
    }

    audioRef.current.playPlace();

    // Check full rows & columns to clear
    const fullRows: number[] = [];
    const fullCols: number[] = [];

    for (let r = 0; r < 8; r++) {
      if (newGrid[r].every((cell) => cell !== 'empty')) fullRows.push(r);
    }
    for (let c = 0; c < 8; c++) {
      let isFull = true;
      for (let r = 0; r < 8; r++) {
        if (newGrid[r][c] === 'empty') isFull = false;
      }
      if (isFull) fullCols.push(c);
    }

    let clearedCount = fullRows.length + fullCols.length;
    if (clearedCount > 0) {
      audioRef.current.playClear();
      fullRows.forEach((r) => newGrid[r].fill('empty'));
      fullCols.forEach((c) => {
        for (let r = 0; r < 8; r++) newGrid[r][c] = 'empty';
      });

      const pts = clearedCount * 100 * clearedCount;
      setScore((s) => {
        const next = s + pts;
        if (next > highScore) {
          setHighScore(next);
          try {
            localStorage.setItem('quit-smoking:block-highscore', String(next));
          } catch {}
        }
        return next;
      });
      setLinesClearedTotal((prev) => prev + clearedCount);
    } else {
      setScore((s) => s + 10);
    }

    setGrid(newGrid);

    // Consume piece
    const remainingPieces = pieces.map((p, idx) => (idx === pieceIdx ? null : p));
    if (remainingPieces.every((p) => p === null)) {
      generateNewPieces();
    } else {
      setPieces(remainingPieces);
    }
  };

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
            <span className="text-[8px] text-emerald-400 uppercase font-bold">Лінії</span>
            <span className="text-xs font-black text-emerald-300">{linesClearedTotal}</span>
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

      {/* 8x8 Main Grid Arena */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
        <div className="grid grid-cols-8 gap-1.5 w-full max-w-xs aspect-square p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}_${c}`}
                type="button"
                onClick={() => {
                  // Click cell to try placing first available piece
                  const activeIdx = pieces.findIndex((p) => p !== null);
                  if (activeIdx !== -1) placePieceOnGrid(activeIdx, r, c);
                }}
                className={`rounded-lg border transition-all cursor-pointer flex items-center justify-center text-xs select-none ${
                  cell === 'empty'
                    ? 'bg-slate-950/60 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50'
                    : cell === 'cig'
                    ? 'bg-amber-600 border-amber-400 text-white font-bold shadow-md shadow-amber-600/20'
                    : cell === 'fire'
                    ? 'bg-orange-500 border-orange-300 text-white font-bold shadow-md shadow-orange-500/20'
                    : cell === 'filter'
                    ? 'bg-red-600 border-red-400 text-white font-bold shadow-md shadow-red-600/20'
                    : 'bg-stone-700 border-stone-500 text-white'
                }`}
              >
                {cell !== 'empty' && (cell === 'fire' ? '🔥' : cell === 'filter' ? '🛑' : '🚬')}
              </button>
            ))
          )}
        </div>

        {/* Pieces Drawer below grid */}
        {gameState === 'PLAYING' && (
          <div className="mt-4 flex items-center justify-center gap-4 w-full">
            {pieces.map((piece, idx) => {
              if (!piece) return <div key={idx} className="w-20 h-20 shrink-0" />;
              return (
                <div
                  key={idx}
                  className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-1 items-center justify-center cursor-pointer hover:border-amber-500/60 transition-all shrink-0 active:scale-95 shadow-md"
                  onClick={() => {
                    // Quick place at first open cell
                    for (let r = 0; r < 8; r++) {
                      for (let c = 0; c < 8; c++) {
                        placePieceOnGrid(idx, r, c);
                      }
                    }
                  }}
                >
                  {piece.map((pRow, pr) => (
                    <div key={pr} className="flex gap-1">
                      {pRow.map((pCell, pc) => (
                        <div
                          key={pc}
                          className={`w-4 h-4 rounded ${
                            pCell ? 'bg-amber-500 shadow-sm shadow-amber-500/40' : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Start / Game Over Modals */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-3xl mb-3 shadow-xl shadow-orange-500/20">
              🧩
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Тютюнова Тетрис-Трамбувалка</h2>
            <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
              Розкладайте тютюнові блоки на сітці 8x8. Збирайте повні вертикальні й горизонтальні лінії, щоб спалити їх у попіл!
            </p>

            <button
              type="button"
              onClick={startPuzzle}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Почати головоломку</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
