import React, { useState, useEffect, useMemo } from 'react';
import {
  Wind,
  Droplets,
  Waves,
  Eye,
  Music,
  Compass,
  Gamepad2,
  BookOpen,
  Clock,
  History,
  Trophy,
  ShieldCheck,
  Phone,
  PhoneCall,
  Edit3,
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  Check,
  X,
  Trash2,
  Calendar
} from 'lucide-react';
import { SosSoundscapes } from './SosSoundscapes';
import { HealthyReplacements } from './HealthyReplacements';
import { AntiStressBubbles } from './AntiStressBubbles';
import { CopingCardsWidget } from './CopingCardsWidget';

export interface SosCrisisEntry {
  id: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  protocolName: string;
  outcome: 'overcome' | 'relapse';
}

interface SosTabProps {
  reasons: string[];
  accent?: string;
  onCravingOver: () => void;
  onRelapse: () => void;
  onSwitchTab?: (tab: any) => void;
}

type SosMode = 'menu' | 'breath' | 'wave' | 'grounding' | 'cold' | 'sound' | 'wheel' | 'game' | 'cards' | 'log';
type BreathTechnique = 'sigh' | 'box' | '478';

const CRISIS_LOG_STORAGE_KEY = 'quit-smoking:sos-crisis-log';

export const SosTab: React.FC<SosTabProps> = ({
  reasons,
  accent = 'indigo',
  onCravingOver,
  onRelapse,
  onSwitchTab
}) => {
  const [mode, setMode] = useState<SosMode>('menu');
  const [activeProtocol, setActiveProtocol] = useState<string>('Загальний виклик SOS');
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
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Crisis Log History State
  const [crisisLog, setCrisisLog] = useState<SosCrisisEntry[]>(() => {
    try {
      const saved = localStorage.getItem(CRISIS_LOG_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

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

  const handleSelectMode = (newMode: SosMode, protocolName: string) => {
    setActiveProtocol(protocolName);
    setMode(newMode);
    if (newMode === 'wave') {
      setWaveSecLeft(90);
      setWaveRunning(true);
    } else if (newMode === 'grounding') {
      setGroundingStep(0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleDeleteEntry = (id: string) => {
    const updated = crisisLog.filter((item) => item.id !== id);
    saveCrisisLog(updated);
  };

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

  const overcomeCount = crisisLog.filter((item) => item.outcome === 'overcome').length;
  const totalCrises = crisisLog.length;
  const successRate = totalCrises > 0 ? Math.round((overcomeCount / totalCrises) * 100) : 100;

  const PRACTICES = [
    {
      id: 'breath',
      title: 'Фізіологічне дихання',
      desc: 'Подвійний вдих та подовжений видих. Знижує пульс та рівень кортизолу за 30 секунд.',
      action: 'Почати дихати',
      icon: Wind,
      badge: '30 сек',
      svg: (
        <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-80 group-hover:opacity-100 transition-opacity">
          <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-slate-400 dark:text-zinc-500 animate-spin" style={{ animationDuration: '18s' }} />
          <circle cx="30" cy="30" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500/60" />
          <circle cx="30" cy="30" r="6" fill="currentColor" className="text-emerald-500" />
        </svg>
      )
    },
    {
      id: 'wave',
      title: 'Серфінг хвилі (90с)',
      desc: 'Фізіологічний потяг живе 90 секунд. Спостерігайте за ним як за хвилею, не борючись.',
      action: 'Перечекати хвилю',
      icon: Waves,
      badge: '90 сек',
      svg: (
        <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-80 group-hover:opacity-100 transition-opacity">
          <path d="M10,34 Q20,20 30,34 T50,34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-teal-500" />
          <path d="M12,40 Q22,26 32,40 T52,40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-teal-400/50" />
          <circle cx="30" cy="20" r="3" fill="currentColor" className="text-amber-400" />
        </svg>
      )
    },
    {
      id: 'grounding',
      title: 'Заземлення 5-4-3-2-1',
      desc: 'Повернення у тіло через органи чуття: зір, дотик, слух, нюх і смак.',
      action: 'Увімкнути відчуття',
      icon: Eye,
      badge: 'Фокус',
      svg: (
        <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-80 group-hover:opacity-100 transition-opacity">
          <circle cx="30" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-slate-400 dark:text-zinc-500" />
          <ellipse cx="30" cy="30" rx="14" ry="7" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500" />
          <circle cx="30" cy="30" r="4" fill="currentColor" className="text-indigo-500" />
        </svg>
      )
    },
    {
      id: 'sound',
      title: 'Звукотерапія спокою',
      desc: 'Ембієнт-звуки пригнічують імпульсивне бажання закурити: дощ, океан, ліс.',
      action: 'Слухати звуки',
      icon: Music,
      badge: 'Аудіо',
      svg: (
        <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-80 group-hover:opacity-100 transition-opacity">
          <circle cx="30" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-400 dark:text-zinc-500" />
          <rect x="22" y="24" width="3" height="12" rx="1.5" fill="currentColor" className="text-sky-500" />
          <rect x="28" y="18" width="3" height="24" rx="1.5" fill="currentColor" className="text-sky-500" />
          <rect x="34" y="22" width="3" height="16" rx="1.5" fill="currentColor" className="text-sky-500" />
        </svg>
      )
    },
    {
      id: 'wheel',
      title: 'Колесо замінників',
      desc: 'Отримайте 1-хвилинне корисне завдання замість сигарети від колеса удачі.',
      action: 'Крутити колесо',
      icon: Compass,
      badge: 'Дія',
      svg: (
        <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-80 group-hover:opacity-100 transition-opacity">
          <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500/70" />
          <line x1="30" y1="10" x2="30" y2="50" stroke="currentColor" strokeWidth="1" className="text-slate-400 dark:text-zinc-600" />
          <line x1="10" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="1" className="text-slate-400 dark:text-zinc-600" />
          <circle cx="30" cy="30" r="4" fill="currentColor" className="text-amber-500" />
        </svg>
      )
    },
    {
      id: 'game',
      title: 'Лопай Бульбашки',
      desc: 'Антистрес-гра для перемикання уваги та зайняття рук легкими бульбашками.',
      action: 'Грати (1 хв)',
      icon: Gamepad2,
      badge: 'Гра',
      svg: (
        <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-80 group-hover:opacity-100 transition-opacity">
          <circle cx="24" cy="26" r="10" fill="currentColor" className="text-indigo-500/30" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="38" cy="34" r="8" fill="currentColor" className="text-pink-500/30" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="22" cy="40" r="5" fill="currentColor" className="text-teal-500/30" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    },
    {
      id: 'cards',
      title: 'Когнітивні картки',
      desc: 'Психологічні факти та підтримка при гострому поклику до сигарети.',
      action: 'Читати факти',
      icon: BookOpen,
      badge: 'Психологія',
      svg: (
        <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-80 group-hover:opacity-100 transition-opacity">
          <rect x="18" y="16" width="24" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-500/70" />
          <line x1="23" y1="24" x2="37" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-500 dark:text-zinc-400" />
          <line x1="23" y1="30" x2="33" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-500 dark:text-zinc-400" />
        </svg>
      )
    },
    {
      id: 'monsters',
      title: 'Битва з монстрами-сигаретами',
      desc: 'Знищуйте навалу тютюнових монстрів вогняними кулями, вивільняючи енергію та знімаючи напругу.',
      action: 'Спопелити монстрів',
      icon: Gamepad2,
      badge: '🔥 Аркада',
      svg: (
        <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-80 group-hover:opacity-100 transition-opacity">
          <circle cx="20" cy="30" r="8" fill="#f97316" />
          <circle cx="20" cy="30" r="4" fill="#fde047" />
          <rect x="34" y="16" width="12" height="28" rx="2" fill="#f5f5f4" stroke="#d97706" strokeWidth="1" />
          <rect x="34" y="34" width="12" height="10" fill="#d97706" />
        </svg>
      )
    },
    {
      id: 'cold',
      title: 'Холодовий рефлекс нирця',
      desc: 'Склянка крижаної води або вмивання обличчя. Миттєво перемикає блукаючий нерв.',
      action: 'Дізнатися кроки',
      icon: Droplets,
      badge: 'Тіло',
      svg: (
        <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-80 group-hover:opacity-100 transition-opacity">
          <path d="M30,14 C30,14 18,30 18,37 C18,44 23.4,49 30,49 C36.6,49 42,44 42,37 C42,30 30,14 30,14 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sky-500" />
          <circle cx="28" cy="38" r="3" fill="currentColor" className="text-sky-400/50" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 pb-6 max-w-md mx-auto w-full animate-fadeIn select-none">
      {/* 1. HERO ТАЙМЕР КРИЗИ В ТОЧНОМУ СТИЛІ ГОЛОВНОЇ */}
      <div className="mb-4 p-4 flex flex-col justify-center items-center text-center relative">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Кризовий контроль у реальному часі</span>
        </div>

        {/* Великий цифровий таймер як на Головній */}
        <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-800 dark:text-zinc-100 my-1 animate-pulse">
          {formatElapsed(elapsedSeconds)}
        </h1>

        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed mt-1 font-medium">
          Найгостріша фаза тяги триває лише <span className="font-bold text-slate-700 dark:text-zinc-200">3–5 хвилин</span>. Витримайте цей пік — і хвиля спаде.
        </p>
      </div>

      {/* 4. ВНУТРІШНІ ЕКРАНИ / ПРАКТИКИ (ЯКЩО ВІДКРИТА КОНКРЕТНА ПРАКТИКА) */}
      {mode !== 'menu' && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setMode('menu')}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Назад до всіх практик SOS</span>
          </button>

          {mode === 'sound' && <SosSoundscapes />}
          {mode === 'wheel' && <HealthyReplacements />}
          {mode === 'game' && <AntiStressBubbles />}
          {mode === 'cards' && <CopingCardsWidget />}

          {/* ДИХАННЯ */}
          {mode === 'breath' && (
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#18181c]/80 border border-slate-200/80 dark:border-zinc-800/80 space-y-4 text-center">
              <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
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
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs font-extrabold'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

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

          {/* СЕРФІНГ ХВИЛІ */}
          {mode === 'wave' && (
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#18181c]/80 border border-slate-200/80 dark:border-zinc-800/80 space-y-4 text-center">
              <div className="py-4 flex flex-col items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-slate-50 dark:bg-[#141418] border-2 border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-4xl font-mono font-black text-slate-800 dark:text-zinc-100">
                    {waveSecLeft}с
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold mt-1">до спаду піку</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-zinc-800">
                <div
                  className="bg-emerald-500 h-full transition-all duration-1000 shadow-xs"
                  style={{ width: `${((90 - waveSecLeft) / 90) * 100}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed font-medium">
                Уявіть, що потяг — це хвиля. Ви не зупиняєте океан, ви просто стоїте на березі й спостерігаєте.
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

          {/* ЗАЗЕМЛЕННЯ */}
          {mode === 'grounding' && (
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#18181c]/80 border border-slate-200/80 dark:border-zinc-800/80 space-y-4 text-center">
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

          {/* ХОЛОДОВИЙ ШОК */}
          {mode === 'cold' && (
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#18181c]/80 border border-slate-200/80 dark:border-zinc-800/80 space-y-4">
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

          {/* ЖУРНАЛ КРИЗ */}
          {mode === 'log' && (
            <div className="p-4 rounded-3xl bg-white/80 dark:bg-[#18181c]/80 border border-slate-200/80 dark:border-zinc-800/80 space-y-4">
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

              {crisisLog.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
                  <p className="font-bold text-slate-700 dark:text-zinc-300">Записів кризових ситуацій поки немає</p>
                  <p className="text-[10px] opacity-80 max-w-[220px] mx-auto">При використанні практик SOS кожен виклик буде збережено для аналізу.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
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
            </div>
          )}
        </div>
      )}

      {/* 5. КАРТКИ ПРАКТИК В ТОЧНОМУ СТИЛІ «МЕДИТАТИВНІ ПРОСТОРИ» З ГОЛОВНОЇ */}
      {mode === 'menu' && (
        <div className="space-y-3 mb-6">
          <div className="px-1 flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-widest uppercase text-slate-400 dark:text-zinc-500">
              Практики самодопомоги
            </span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-600 font-mono">
              зняти потяг
            </span>
          </div>

          {PRACTICES.map((p) => {
            const IconComponent = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (p.id === 'monsters' && onSwitchTab) {
                    onSwitchTab('monsters');
                    return;
                  }
                  handleSelectMode(p.id as SosMode, p.title);
                }}
                className="w-full p-4 rounded-3xl bg-white hover:bg-slate-50/90 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 transition-all duration-300 cursor-pointer text-left relative overflow-hidden group active:scale-[0.99] shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-zinc-200">
                        {p.title}
                      </h3>
                      {p.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-slate-600 dark:text-zinc-400 text-[10px] font-mono font-bold leading-none">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-2 font-normal">
                      {p.desc}
                    </p>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors">
                      <span className="font-medium">{p.action}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800/60 flex items-center justify-center flex-none border border-slate-200 dark:border-zinc-700/40 group-hover:border-slate-300 transition-colors">
                    {p.svg}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 6. ГОЛОВНІ КНОПКИ РЕЗУЛЬТАТУ В ТОЧНОМУ СТИЛІ КНОПОК ГОЛОВНОЇ */}
      <div className="pt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleRecordOutcome('overcome')}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Потяг успішно подолано!</span>
        </button>

        <button
          type="button"
          onClick={() => handleRecordOutcome('relapse')}
          className="w-full py-2 text-slate-400 hover:text-rose-500 text-[11px] font-medium transition-colors cursor-pointer text-center"
        >
          Я зірвався (чесно зафіксувати зрив)
        </button>
      </div>
    </div>
  );
};
