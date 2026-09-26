import React, { useState, useEffect, useMemo } from 'react';
import { CopingCardsWidget } from './CopingCardsWidget';
import { SosSoundscapes } from './SosSoundscapes';
import { HealthyReplacements } from './HealthyReplacements';
import { AntiStressBubbles } from './AntiStressBubbles';
import {
  Wind,
  Droplets,
  Waves,
  Eye,
  X,
  Check,
  ChevronLeft,
  ArrowRight,
  RotateCcw,
  History,
  ShieldCheck,
  Trash2,
  Calendar,
  Clock,
  Activity,
  Award,
  Phone,
  PhoneCall,
  Edit3,
  Music,
  Gamepad2,
  BookOpen,
  Sparkles,
  Compass,
  Brain
} from 'lucide-react';

export interface SosCrisisEntry {
  id: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  protocolName: string;
  outcome: 'overcome' | 'relapse';
}

interface SosModalProps {
  reasons: string[];
  onClose: () => void;
  onCravingOver: () => void;
  onRelapse: () => void;
  onLaunchOrbit?: () => void;
}

type SosMode = 'menu' | 'breath' | 'wave' | 'grounding' | 'cold' | 'sound' | 'wheel' | 'game' | 'cards' | 'log';
type BreathTechnique = 'sigh' | 'box' | '478';

const CRISIS_LOG_STORAGE_KEY = 'quit-smoking:sos-crisis-log';

export const SosModal: React.FC<SosModalProps> = ({
  reasons,
  onClose,
  onCravingOver,
  onRelapse
}) => {
  const [mode, setMode] = useState<SosMode>('menu');
  const [activeProtocol, setActiveProtocol] = useState<string>('Загальний виклик SOS');

  // Crisis Control Session Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Phone support configuration state
  const [sosPhone, setSosPhone] = useState<string>(() => {
    try {
      return localStorage.getItem('quit-smoking:sos-phone') || '';
    } catch {
      return '';
    }
  });
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [phoneInputText, setPhoneInputText] = useState<string>(sosPhone);

  const saveSosPhone = (phoneNum: string) => {
    const trimmed = phoneNum.trim();
    setSosPhone(trimmed);
    try {
      localStorage.setItem('quit-smoking:sos-phone', trimmed);
    } catch {}
    setIsEditingPhone(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Crisis Log History State
  const [crisisLog, setCrisisLog] = useState<SosCrisisEntry[]>(() => {
    try {
      const saved = localStorage.getItem(CRISIS_LOG_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Save log helper
  const saveCrisisLog = (newLog: SosCrisisEntry[]) => {
    setCrisisLog(newLog);
    try {
      localStorage.setItem(CRISIS_LOG_STORAGE_KEY, JSON.stringify(newLog));
    } catch {}
  };

  // 1. Breathing State
  const [breathTechnique, setBreathTechnique] = useState<BreathTechnique>('sigh');
  const [breathPhase, setBreathPhase] = useState<'Вдих 1' | 'Вдих 2' | 'Видих' | 'Вдих' | 'Затримка'>('Вдих 1');
  const [breathSecLeft, setBreathSecLeft] = useState<number>(2);

  // 2. Wave (Urge Surfing) State - 90 seconds
  const [waveSecLeft, setWaveSecLeft] = useState<number>(90);
  const [waveRunning, setWaveRunning] = useState<boolean>(false);

  // 3. Grounding 5-4-3-2-1 active step
  const [groundingStep, setGroundingStep] = useState<number>(0);

  // Random reason reminder
  const randomReason = useMemo(() => {
    return reasons.length > 0 ? reasons[Math.floor(Math.random() * reasons.length)] : 'Свобода та чисті легені';
  }, [reasons]);

  // Handle Mode Selection and Set Active Protocol Name
  const handleSelectMode = (newMode: SosMode, protocolName: string) => {
    setActiveProtocol(protocolName);
    setMode(newMode);
    if (newMode === 'wave') {
      setWaveSecLeft(90);
      setWaveRunning(true);
    } else if (newMode === 'grounding') {
      setGroundingStep(0);
    }
  };

  // Record outcome handler
  const handleRecordOutcome = (outcome: 'overcome' | 'relapse') => {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newEntry: SosCrisisEntry = {
      id: `crisis_${Date.now()}`,
      timestamp: Date.now(),
      dateStr,
      timeStr,
      protocolName: activeProtocol,
      outcome
    };

    const updatedLog = [newEntry, ...crisisLog];
    saveCrisisLog(updatedLog);

    if (outcome === 'overcome') {
      onCravingOver();
    } else {
      onRelapse();
    }
  };

  // Delete single entry from log
  const handleDeleteEntry = (id: string) => {
    const updated = crisisLog.filter((item) => item.id !== id);
    saveCrisisLog(updated);
  };

  // Clear entire log
  const handleClearLog = () => {
    if (window.confirm('Ви впевнені, що хочете очистити журнал кризових ситуацій?')) {
      saveCrisisLog([]);
    }
  };

  // Breathing Loop
  useEffect(() => {
    if (mode !== 'breath') return;

    let sec = breathTechnique === 'sigh' ? 2 : 4;
    let step = 0;

    const timer = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        if (breathTechnique === 'sigh') {
          step = (step + 1) % 3;
          if (step === 0) {
            setBreathPhase('Вдих 1');
            sec = 2;
          } else if (step === 1) {
            setBreathPhase('Вдих 2');
            sec = 1;
          } else {
            setBreathPhase('Видих');
            sec = 5;
          }
        } else if (breathTechnique === 'box') {
          step = (step + 1) % 4;
          if (step === 0) {
            setBreathPhase('Вдих');
            sec = 4;
          } else if (step === 1) {
            setBreathPhase('Затримка');
            sec = 4;
          } else if (step === 2) {
            setBreathPhase('Видих');
            sec = 4;
          } else {
            setBreathPhase('Затримка');
            sec = 4;
          }
        } else {
          step = (step + 1) % 3;
          if (step === 0) {
            setBreathPhase('Вдих');
            sec = 4;
          } else if (step === 1) {
            setBreathPhase('Затримка');
            sec = 7;
          } else {
            setBreathPhase('Видих');
            sec = 8;
          }
        }
      }
      setBreathSecLeft(sec);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, breathTechnique]);

  // Urge Wave Timer
  useEffect(() => {
    if (mode !== 'wave' || !waveRunning) return;

    const timer = setInterval(() => {
      setWaveSecLeft((prev) => {
        if (prev <= 1) {
          setWaveRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, waveRunning]);

  // Statistics calculation for crisis log
  const overcomeCount = crisisLog.filter((item) => item.outcome === 'overcome').length;
  const relapseCount = crisisLog.filter((item) => item.outcome === 'relapse').length;
  const totalCrises = crisisLog.length;
  const successRate = totalCrises > 0 ? Math.round((overcomeCount / totalCrises) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-slate-50 dark:bg-[#0c0c0e] w-full max-w-md h-[92vh] sm:h-[86vh] rounded-[2.5rem] border border-slate-200/60 dark:border-zinc-800/80 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* UPPER NAVIGATION BAR (FIXED) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            {mode !== 'menu' && (
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                title="Назад до меню"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {mode === 'menu' && 'Екстрена допомога SOS'}
                {mode === 'breath' && 'Фізіологічне дихання'}
                {mode === 'wave' && 'Серфінг хвилі'}
                {mode === 'grounding' && 'Заземлення 5-4-3-2-1'}
                {mode === 'cold' && 'Холодовий рефлекс'}
                {mode === 'sound' && 'Звукотерапія'}
                {mode === 'wheel' && 'Колесо замінників'}
                {mode === 'game' && 'Лопай Бульбашки'}
                {mode === 'cards' && 'Когнітивні картки'}
                {mode === 'log' && 'Журнал криз'}
              </h2>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono font-bold text-[10px] animate-pulse">
                <Clock className="w-3 h-3 text-rose-500" />
                <span>{formatElapsed(elapsedSeconds)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          
          {/* MAIN MENU */}
          {mode === 'menu' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* UNIFIED SOS PROTOCOLS LAUNCHER GRID */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  Оберіть практику самодопомоги
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      id: 'breath',
                      title: 'Дихання животом',
                      subtitle: 'Знижує пульс та рівень стресу за 30с',
                      emoji: '🌬️',
                      icon: Wind
                    },
                    {
                      id: 'wave',
                      title: 'Серфінг хвилі',
                      subtitle: 'Спостерігайте за позивом 90с без боротьби',
                      emoji: '🌊',
                      icon: Waves
                    },
                    {
                      id: 'grounding',
                      title: 'Заземлення 5-4-3',
                      subtitle: 'Повернення у тіло через органи чуття',
                      emoji: '👁️',
                      icon: Eye
                    },
                    {
                      id: 'sound',
                      title: 'Звукотерапія',
                      subtitle: 'Заспокійливі ембієнти при імпульсах',
                      emoji: '🎧',
                      icon: Music
                    },
                    {
                      id: 'wheel',
                      title: 'Колесо замін',
                      subtitle: 'Отримайте корисне хвилинне завдання',
                      emoji: '🎡',
                      icon: Compass
                    },
                    {
                      id: 'game',
                      title: 'Лопай Бульбашки',
                      subtitle: 'Антистрес-гра для перемикання уваги',
                      emoji: '🎈',
                      icon: Gamepad2
                    },
                    {
                      id: 'cards',
                      title: 'Когнітивні картки',
                      subtitle: 'Наукова підтримка та факти про тягу',
                      emoji: '🃏',
                      icon: BookOpen
                    },
                    {
                      id: 'cold',
                      title: 'Холодовий шок',
                      subtitle: 'Миттєве зняття стресу водою',
                      emoji: '💧',
                      icon: Droplets
                    }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectMode(p.id as SosMode, p.title)}
                      className="p-3.5 h-[115px] rounded-3xl bg-white dark:bg-[#131316]/95 border border-slate-200/85 dark:border-zinc-850 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 shadow-2xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between text-left cursor-pointer group active:scale-[0.97]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
                          {p.emoji}
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-colors">
                          <p.icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[11.5px] font-black text-slate-800 dark:text-zinc-200 leading-tight">
                          {p.title}
                        </h3>
                        <p className="text-[9px] text-slate-400 dark:text-zinc-500 leading-tight mt-1 line-clamp-2">
                          {p.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* INTERNAL WIDGET VIEWS */}
          {mode === 'sound' && (
            <div className="animate-fadeIn">
              <SosSoundscapes />
            </div>
          )}

          {mode === 'wheel' && (
            <div className="animate-fadeIn">
              <HealthyReplacements />
            </div>
          )}

          {mode === 'game' && (
            <div className="animate-fadeIn">
              <AntiStressBubbles />
            </div>
          )}

          {mode === 'cards' && (
            <div className="animate-fadeIn">
              <CopingCardsWidget />
            </div>
          )}

          {/* CRISIS LOG VIEW */}
          {mode === 'log' && (
            <div className="p-4 rounded-3xl bg-white dark:bg-[#131316]/95 border border-slate-200/80 dark:border-zinc-850 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-150 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Історія звернень по допомогу
                  </h3>
                </div>

                {crisisLog.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLog}
                    className="text-[10px] text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Очистити все</span>
                  </button>
                )}
              </div>

              {/* Stat Pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 text-amber-950 dark:text-amber-200">
                  <span className="text-[9px] text-amber-700 dark:text-amber-400 block mb-0.5 font-medium">Викликів</span>
                  <span className="font-bold font-mono text-sm">{totalCrises}</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 text-emerald-950 dark:text-emerald-200">
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 block mb-0.5 font-medium">Подолано</span>
                  <span className="font-bold font-mono text-sm">{overcomeCount}</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 text-indigo-950 dark:text-indigo-200">
                  <span className="text-[9px] text-indigo-700 dark:text-indigo-400 block mb-0.5 font-medium">Стійкість</span>
                  <span className="font-bold font-mono text-sm">{successRate}%</span>
                </div>
              </div>

              {/* List of past crisis incidents */}
              {crisisLog.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
                  <p className="font-bold text-slate-700 dark:text-zinc-300">Записів кризових ситуацій поки немає</p>
                  <p className="text-[10px] opacity-80 max-w-[200px] mx-auto">При використанні практик SOS кожен виклик буде збережено для аналізу.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {crisisLog.map((entry) => {
                    const isOvercome = entry.outcome === 'overcome';
                    return (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                          isOvercome
                            ? 'bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-100'
                            : 'bg-rose-500/5 dark:bg-rose-950/10 border-rose-500/20 text-rose-950 dark:text-rose-100'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-extrabold text-xs truncate text-slate-800 dark:text-zinc-200">
                              {entry.protocolName || 'Виклик SOS'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] font-black border shrink-0 ${
                                isOvercome
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {isOvercome ? 'Подолано' : 'Зрив'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {entry.dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {entry.timeStr}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                          title="Видалити запис"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => setMode('menu')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-xs cursor-pointer transition-colors"
              >
                Повернутися до меню
              </button>
            </div>
          )}

          {/* BREATHING PRACTICE */}
          {mode === 'breath' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#131316]/95 border border-slate-200/80 dark:border-zinc-850 space-y-4 animate-fadeIn text-center">
              {/* Селектор технік */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-150 dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800">
                {[
                  { id: 'sigh', label: 'Зітхання' },
                  { id: 'box', label: 'Квадрат' },
                  { id: '478', label: 'Релакс 4-7-8' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBreathTechnique(t.id as BreathTechnique)}
                    className={`py-2 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer ${
                      breathTechnique === t.id
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-extrabold'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Сяюче дихальне коло */}
              <div className="py-6 flex flex-col items-center justify-center relative">
                <div
                  className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 bg-slate-50/50 dark:bg-zinc-900/40 shadow-inner relative z-10 ${
                    breathPhase.includes('Вдих')
                      ? 'scale-110 border-emerald-500 shadow-emerald-500/10'
                      : breathPhase === 'Затримка'
                      ? 'scale-105 border-amber-500 shadow-amber-500/10'
                      : 'scale-95 border-sky-500 shadow-sky-500/10'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                    {breathPhase}
                  </span>
                  <span className="text-4xl font-mono font-black text-slate-800 dark:text-zinc-100">
                    {breathSecLeft}с
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed font-medium">
                Дихайте животом. Довгий повільний видих активує блукаючий нерв і повертає відчуття спокою.
              </p>
            </div>
          )}

          {/* URGE WAVE SURFING */}
          {mode === 'wave' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#131316]/95 border border-slate-200/80 dark:border-zinc-850 space-y-4 animate-fadeIn text-center">
              <div className="py-4 flex flex-col items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-slate-50 dark:bg-[#18181c] border-2 border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-4xl font-mono font-black text-slate-800 dark:text-zinc-100">
                    {waveSecLeft}с
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold mt-1">до спаду піку</span>
                </div>
              </div>

              {/* Прогрес-бар */}
              <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-zinc-800">
                <div
                  className="bg-emerald-500 h-full transition-all duration-1000 shadow-xs"
                  style={{ width: `${((90 - waveSecLeft) / 90) * 100}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed font-medium">
                Уявіть, що потяг — це хвиля. Ви не зупиняєте океан, ви просто стоїте на березі й дивитесь, як вона розчиняється.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWaveRunning((v) => !v)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer transition-colors"
                >
                  {waveRunning ? 'Пауза' : 'Продовжити'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWaveSecLeft(90);
                    setWaveRunning(true);
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-500 cursor-pointer transition-colors"
                  title="Скинути"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* GROUNDING 5-4-3-2-1 */}
          {mode === 'grounding' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#131316]/95 border border-slate-200/80 dark:border-zinc-850 space-y-4 animate-fadeIn text-center">
              {groundingStep === 0 && (
                <div className="space-y-2 py-4">
                  <div className="text-4xl font-black font-mono text-emerald-500">5</div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                    Знайдіть поглядом 5 речей навколо
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Подивіться навколо та назвіть: стіл, вікно, годинник, тінь на стіні, власні долоні.
                  </p>
                </div>
              )}

              {groundingStep === 1 && (
                <div className="space-y-2 py-4">
                  <div className="text-4xl font-black font-mono text-emerald-500">4</div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                    Відчуйте 4 тактильні дотики
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Сфокусуйтеся на тілі: тканина одягу, прохолода телефону, опора ніг на підлозі, повітря на шкірі.
                  </p>
                </div>
              )}

              {groundingStep === 2 && (
                <div className="space-y-2 py-4">
                  <div className="text-4xl font-black font-mono text-emerald-500">3</div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                    Прислухайтесь до 3 різних звуків
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Закрийте очі та розрізніть: шум вулиці за вікном, власне дихання, гул техніки.
                  </p>
                </div>
              )}

              {groundingStep === 3 && (
                <div className="space-y-2 py-4">
                  <div className="text-4xl font-black font-mono text-emerald-500">2</div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                    Знайдіть 2 різні запахи
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Вдихніть повітря носом: свіжість кімнати, аромат кави або мила на руках.
                  </p>
                </div>
              )}

              {groundingStep === 4 && (
                <div className="space-y-2 py-4">
                  <div className="text-4xl font-black font-mono text-emerald-500">1</div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                    Відчуйте 1 приємний смак
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Зробіть ковток води, відчуйте м'ятну цукерку або просто усвідомте чистий подих без диму.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (groundingStep < 4) {
                    setGroundingStep((s) => s + 1);
                  } else {
                    setMode('menu');
                  }
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                {groundingStep < 4 ? 'Наступне відчуття' : 'Завершити заземлення'}
              </button>
            </div>
          )}

          {/* COLD SHOCK PRACTICE */}
          {mode === 'cold' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#131316]/95 border border-slate-200/80 dark:border-zinc-850 space-y-4 animate-fadeIn">
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 flex items-start gap-3.5 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/10 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-none font-black">
                    1
                  </div>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
                    Повільно випийте склянку холодної води дрібними ковтками, фокусуючись на фізичному відчутті прохолоди в горлі.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 flex items-start gap-3.5 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/10 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-none font-black">
                    2
                  </div>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
                    Вмийте обличчя крижаною водою або прикладіть холодний рушник чи компрес до потилиці (це активує вазомоторний рефлекс нирця).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode('menu')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-xs cursor-pointer"
              >
                Зрозуміло, виконаю
              </button>
            </div>
          )}

        </div>

        {/* FIXED FOOTER WITH OUTCOME BUTTONS (ONLY SHOW IF NOT IN LOG VIEW) */}
        {mode !== 'log' && (
          <div className="px-5 py-4 border-t border-slate-200/50 dark:border-zinc-800/60 bg-white/70 dark:bg-[#0f0f11]/95 backdrop-blur-md shrink-0 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleRecordOutcome('overcome')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-2xl font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Потяг повністю подолано!</span>
            </button>

            <button
              type="button"
              onClick={() => handleRecordOutcome('relapse')}
              className="w-full py-1.5 text-slate-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 text-[10.5px] font-bold transition-colors cursor-pointer text-center"
            >
              Я зірвався (чесно зафіксувати зрив)
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
