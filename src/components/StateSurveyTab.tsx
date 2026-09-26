import React, { useState, useMemo, useEffect } from 'react';
import { DayRating, StateEntry, MealLog, DrinkLog, SleepLog } from '../types';
import { StateDynamicsChart } from './StateDynamicsChart';
import { MentalHealthCard } from './MentalHealthCard';
import { StangeTestCard } from './StangeTestCard';
import { HydrationCard } from './HydrationCard';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2,
  Check,
  Moon,
  Utensils,
  Coffee,
  Heart,
  Sliders,
  BarChart2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Brain,
  Activity,
  Droplets,
  Footprints,
  Sparkles,
  Award,
  Zap,
  Smile,
  Shield,
  Dumbbell,
  User,
  Scale
} from 'lucide-react';

interface StateSurveyTabProps {
  days: Record<string, DayRating>;
  onSaveRating: (dateKey: string, rating: DayRating) => void;
  onDeleteRating?: (dateKey: string) => void;
  promptIntervalMinutes?: number;
  onUpdatePromptInterval?: (minutes: number) => void;
}

type SectionKey = 'physio' | 'survey' | 'dynamics' | 'sleep' | 'activity' | 'mental' | 'stange' | 'hydration' | 'full_stats';

export const StateSurveyTab: React.FC<StateSurveyTabProps> = ({
  days,
  onSaveRating,
  onDeleteRating,
  promptIntervalMinutes = 30,
  onUpdatePromptInterval
}) => {
  const getTodayKey = () => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());

  // Physio Params State
  const [weight, setWeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:physio-weight');
      return saved ? Number(saved) : 70;
    } catch { return 70; }
  });
  const [height, setHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:physio-height');
      return saved ? Number(saved) : 175;
    } catch { return 175; }
  });
  const [age, setAge] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:physio-age');
      return saved ? Number(saved) : 30;
    } catch { return 30; }
  });
  const [gender, setGender] = useState<'male' | 'female'>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:physio-gender');
      return (saved as 'male' | 'female') || 'male';
    } catch { return 'male'; }
  });

  // Calculate BMI and recommendations
  const bmi = useMemo(() => {
    if (!height || !weight) return 0;
    const hM = height / 100;
    return Number((weight / (hM * hM)).toFixed(1));
  }, [weight, height]);

  const bmiCategory = useMemo(() => {
    if (bmi < 18.5) return { label: 'Дефіцит ваги', color: 'text-amber-500' };
    if (bmi <= 24.9) return { label: 'Нормальна вага', color: 'text-emerald-500' };
    if (bmi <= 29.9) return { label: 'Надлишкова вага', color: 'text-amber-500' };
    return { label: 'Ожиріння', color: 'text-red-500' };
  }, [bmi]);

  const waterNormMl = useMemo(() => Math.round(weight * 35), [weight]);

  const bmr = useMemo(() => {
    if (!weight || !height || !age) return 0;
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  }, [weight, height, age, gender]);

  const handleUpdatePhysio = (field: 'weight' | 'height' | 'age' | 'gender', val: any) => {
    if (field === 'weight') {
      const w = Math.max(20, Math.min(300, Number(val) || 70));
      setWeight(w);
      try { localStorage.setItem('quit-smoking:physio-weight', String(w)); } catch {}
    } else if (field === 'height') {
      const h = Math.max(80, Math.min(250, Number(val) || 175));
      setHeight(h);
      try { localStorage.setItem('quit-smoking:physio-height', String(h)); } catch {}
    } else if (field === 'age') {
      const a = Math.max(10, Math.min(120, Number(val) || 30));
      setAge(a);
      try { localStorage.setItem('quit-smoking:physio-age', String(a)); } catch {}
    } else if (field === 'gender') {
      setGender(val);
      try { localStorage.setItem('quit-smoking:physio-gender', val); } catch {}
    }
  };

  // Collapsible section states (persisted in localStorage)
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:health-sections-state');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      physio: true,
      survey: true,
      dynamics: true,
      sleep: false,
      activity: false,
      mental: false,
      stange: false,
      hydration: false,
      full_stats: true
    };
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('quit-smoking:health-sections-state', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Survey Form State
  const [craving, setCraving] = useState<number>(2);
  const [energy, setEnergy] = useState<number>(7);
  const [calmness, setCalmness] = useState<number>(8);
  const [focus, setFocus] = useState<number>(7);
  const [surveyNote, setSurveyNote] = useState<string>('');
  const [surveySuccessToast, setSurveySuccessToast] = useState<boolean>(false);

  // Sleep Logger State
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [bedtime, setBedtime] = useState<string>('23:30');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [sleepQuality, setSleepQuality] = useState<number>(4); // 1..5
  const [sleepNote, setSleepNote] = useState<string>('');

  // Physical Activity Logger State
  const [stepGoal, setStepGoal] = useState<number>(8000);
  const [currentSteps, setCurrentSteps] = useState<number>(() => {
    try {
      const todayKey = getTodayKey();
      return Number(localStorage.getItem(`quit-smoking:steps-${todayKey}`) || 4500);
    } catch {
      return 4500;
    }
  });
  const [activeExerciseMins, setActiveExerciseMins] = useState<number>(30);

  // Active Day Data
  const currentDayData: DayRating = useMemo(() => {
    return days[selectedDate] || {};
  }, [days, selectedDate]);

  const updateCurrentDay = (updater: (prev: DayRating) => DayRating) => {
    const updated = updater(currentDayData);
    onSaveRating(selectedDate, updated);
  };

  // Date navigation
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    setSelectedDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    setSelectedDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  };

  const isToday = selectedDate === getTodayKey();

  const formattedDateTitle = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const weekday = date.toLocaleDateString('uk-UA', { weekday: 'short' });
    const month = date.toLocaleDateString('uk-UA', { month: 'long', day: 'numeric' });
    return `${isToday ? 'Сьогодні, ' : ''}${d} ${month} (${weekday})`;
  }, [selectedDate, isToday]);

  // Save Survey Entry
  const handleSaveSurveyEntry = () => {
    const nowTime = new Date().toTimeString().slice(0, 5);
    const newEntry: StateEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: nowTime,
      craving,
      energy,
      balance: calmness,
      focus,
      note: surveyNote.trim()
    };

    updateCurrentDay((prev) => {
      const existingSurveys = prev.surveys || prev.entries || [];
      return {
        ...prev,
        surveys: [...existingSurveys, newEntry],
        entries: [...existingSurveys, newEntry]
      };
    });

    setSurveyNote('');
    setSurveySuccessToast(true);
    setTimeout(() => setSurveySuccessToast(false), 3000);
  };

  // Save Sleep Entry
  const handleSaveSleep = () => {
    const sleep: SleepLog = {
      bedtime,
      wakeTime,
      hours: Number(sleepHours),
      note: `Якість: ${sleepQuality}/5. ${sleepNote.trim()}`
    };
    updateCurrentDay((prev) => ({
      ...prev,
      sleep
    }));
    setSleepNote('');
  };

  // Save Steps
  const handleSaveSteps = (delta: number) => {
    const nextVal = Math.max(0, currentSteps + delta);
    setCurrentSteps(nextVal);
    try {
      const todayKey = getTodayKey();
      localStorage.setItem(`quit-smoking:steps-${todayKey}`, String(nextVal));
    } catch {}
  };

  // -------------------------------------------------------------
  // COMPREHENSIVE HEALTH STATISTICS CALCULATIONS (УСЕ ЩО ТІЛЬКИ МОЖНА)
  // -------------------------------------------------------------
  const fullHealthStats = useMemo(() => {
    const dateKeys = Object.keys(days);
    const totalDaysRecorded = dateKeys.length;

    let totalCravingSum = 0;
    let cravingCount = 0;
    let totalEnergySum = 0;
    let energyCount = 0;
    let totalBalanceSum = 0;
    let balanceCount = 0;
    let totalSurveysLogged = 0;
    let totalSleepHours = 0;
    let sleepDaysCount = 0;

    dateKeys.forEach((key) => {
      const day = days[key];
      const surveys = day.surveys || day.entries || [];
      totalSurveysLogged += surveys.length;

      surveys.forEach((s) => {
        if (typeof s.craving === 'number') {
          totalCravingSum += s.craving;
          cravingCount++;
        }
        if (typeof s.energy === 'number') {
          totalEnergySum += s.energy;
          energyCount++;
        }
        if (typeof s.balance === 'number') {
          totalBalanceSum += s.balance;
          balanceCount++;
        }
      });

      if (day.sleep && day.sleep.hours) {
        totalSleepHours += day.sleep.hours;
        sleepDaysCount++;
      }
    });

    const avgCraving = cravingCount > 0 ? (totalCravingSum / cravingCount).toFixed(1) : '1.8';
    const avgEnergy = energyCount > 0 ? (totalEnergySum / energyCount).toFixed(1) : '7.5';
    const avgBalance = balanceCount > 0 ? (totalBalanceSum / balanceCount).toFixed(1) : '8.2';
    const avgSleep = sleepDaysCount > 0 ? (totalSleepHours / sleepDaysCount).toFixed(1) : '7.8';

    // Stange best score from localStorage
    let bestStange = 0;
    try {
      const savedStange = localStorage.getItem('quit-smoking:stange-test-history');
      if (savedStange) {
        const history: any[] = JSON.parse(savedStange);
        bestStange = Math.max(0, ...history.map((h) => h.seconds || 0));
      }
    } catch {}

    return {
      totalDaysRecorded,
      totalSurveysLogged,
      avgCraving,
      avgEnergy,
      avgBalance,
      avgSleep,
      bestStangeSeconds: bestStange || 45
    };
  }, [days]);

  return (
    <div className="flex flex-col flex-1 pb-10 max-w-md mx-auto w-full animate-fadeIn select-none">
      {/* Top Header */}
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
          Куточок здоров'я
        </h1>
      </div>

      {/* Date Switcher Ribbon */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700/80 mb-4">
        <button
          type="button"
          onClick={handlePrevDay}
          className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer transition-all active:scale-95"
          title="Попередній день"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-800 dark:text-zinc-100">
          <Calendar className="w-3.5 h-3.5 text-teal-500" />
          <span>{formattedDateTitle}</span>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer transition-all active:scale-95"
          title="Наступний день"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 0. РОЗДІЛ: ФІЗІОЛОГІЧНІ ПАРАМЕТРИ ТА ДОГЛЯД ЗА СОБОЮ */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/50 transition-all shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('physio')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-teal-500/10 active:bg-teal-500/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-500 shrink-0 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Фізіологічні параметри (вага, зріст, вік)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                ІМТ, метаболізм та персональні рекомендації по догляду за собою
              </p>
            </div>
          </div>
          {openSections.physio ? (
            <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-teal-500 shrink-0 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-teal-500 shrink-0 transition-colors" />
          )}
        </button>

        {openSections.physio && (
          <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800 space-y-4 text-xs">
            {/* Form Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                <label className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase block mb-1">Вага (кг)</label>
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={weight}
                  onChange={(e) => handleUpdatePhysio('weight', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm font-bold font-mono text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                <label className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase block mb-1">Зріст (см)</label>
                <input
                  type="number"
                  min="80"
                  max="250"
                  value={height}
                  onChange={(e) => handleUpdatePhysio('height', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm font-bold font-mono text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                <label className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase block mb-1">Вік (років)</label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={age}
                  onChange={(e) => handleUpdatePhysio('age', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm font-bold font-mono text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                <label className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase block mb-1">Стать</label>
                <div className="flex gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleUpdatePhysio('gender', 'male')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      gender === 'male'
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    Чол
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePhysio('gender', 'female')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      gender === 'female'
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    Жін
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono uppercase">ІМТ</span>
                <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">{bmi}</span>
                <span className={`text-[9px] font-bold mt-0.5 ${bmiCategory.color}`}>{bmiCategory.label}</span>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono uppercase">Норма води</span>
                <span className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">{(waterNormMl / 1000).toFixed(1)} л</span>
                <span className="text-[9px] text-slate-400 mt-0.5">{(waterNormMl / 250).toFixed(0)} склянок/день</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono uppercase">Метаболізм BMR</span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">{bmr}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">ккал/день</span>
              </div>
            </div>

            {/* Personal Recommendations Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 space-y-2.5">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Персональні рекомендації по догляду за собою:</span>
              </div>

              <div className="space-y-2 text-slate-600 dark:text-zinc-300 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none">💧</span>
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-100">Зволоження та відновлення шкіри:</strong>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Випивайте мінімум {(waterNormMl / 1000).toFixed(1)} л води. Перші тижні без куріння відновлюється капілярний кровообіг шкіри обличчя. Використовуйте зволожуючий крем і додайте Вітамін C.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-base leading-none">🥗</span>
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-100">Баланс ваги після відмови від нікотину:</strong>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      При BMR ~{bmr} ккал метаболізм під час відмови тимчасово сповільнюється на 5-8%. Щоб уникнути набору ваги, обирайте білки та клітковину замість простих цукрів.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-base leading-none">🚶</span>
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-100">Легенева самоочистка та тон судин:</strong>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      При зрості {height} см та вазі {weight} кг 30 хвилин бадьорої прогулянки щодня стимулюють бронхіальний дренаж і виведення накопиченої смоли.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-base leading-none">🧘</span>
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-100">Нервова система у віці {age} років:</strong>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Приймайте контрастний або теплий душ увечері, робіть 5 хвилин глибокого дихання животом для зниження кортизолу та нормалізації сну.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 1. РОЗДІЛ: ЗГОДОРНОЇ СТАТИСТИКИ ЗДОРОВ'Я (УСЕ ЩО ТІЛЬКИ МОЖНА) */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('full_stats')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Загальна Статистика Здоров'я
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Зведений дашборд усіх метрик самопочуття та витривалості
              </p>
            </div>
          </div>
          {openSections.full_stats ? (
            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          )}
        </button>

        {openSections.full_stats && (
          <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase">Сер. Тяга</span>
              <span className="text-base font-black text-amber-500">{fullHealthStats.avgCraving} / 5</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Низький рівень потягу</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase">Сер. Енергія</span>
              <span className="text-base font-black text-emerald-500">{fullHealthStats.avgEnergy} / 10</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Високий тонус тіла</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase">Сер. Рівновага</span>
              <span className="text-base font-black text-teal-500">{fullHealthStats.avgBalance} / 10</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Емоційний спокій</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase">Сер. Сон</span>
              <span className="text-base font-black text-indigo-400">{fullHealthStats.avgSleep} год/ніч</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Відновний відпочинок</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase">Затримка Дим.</span>
              <span className="text-base font-black text-sky-400">{fullHealthStats.bestStangeSeconds} сек</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Кращий тест Штанге</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono uppercase">Зрізи стану</span>
              <span className="text-base font-black text-amber-400">{fullHealthStats.totalSurveysLogged} записів</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Заповнених опитувань</span>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. РОЗДІЛ: ПРОХОДЖЕННЯ ОПИТУВАННЯ ТА НАЛАШТУВАННЯ ЗРІЗІВ */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('survey')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Проходження опитування стану
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Зафіксуйте свій поточний рівень тяги, енергії та спокою
              </p>
            </div>
          </div>
          {openSections.survey ? (
            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          )}
        </button>

        {openSections.survey && (
          <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800 space-y-4 text-xs">
            {/* Craving Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Рівень тяги до куріння:</span>
                <span className="font-mono font-bold text-amber-500 text-sm">{craving} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={craving}
                onChange={(e) => setCraving(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1 - Немає</span>
                <span>3 - Помірний</span>
                <span>5 - Сильний</span>
              </div>
            </div>

            {/* Energy Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Енергія та тонус:</span>
                <span className="font-mono font-bold text-emerald-500 text-sm">{energy} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Calmness / Balance Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Емоційна рівновага:</span>
                <span className="font-mono font-bold text-teal-500 text-sm">{calmness} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={calmness}
                onChange={(e) => setCalmness(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Note Input */}
            <div>
              <input
                type="text"
                value={surveyNote}
                onChange={(e) => setSurveyNote(e.target.value)}
                placeholder="Замітка до заміру (напр. після ранкової кави)..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSurveyEntry}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Зберегти замір стану</span>
            </button>

            {surveySuccessToast && (
              <p className="text-[11px] text-emerald-500 font-bold text-center animate-fade-in">
                ✨ Замір стану успішно додано у щоденник!
              </p>
            )}

            {/* Interval Selector Settings */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Інтервал нагадувань:</span>
              <div className="flex items-center gap-1">
                {[15, 30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onUpdatePromptInterval && onUpdatePromptInterval(mins)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                      promptIntervalMinutes === mins
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                    }`}
                  >
                    {mins}хв
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. РОЗДІЛ: ГРАФІК СТАНУ ТА ДИНАМІКА */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('dynamics')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-500 shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Графік стану та тренд
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Динаміка зниження тяги та зростання емоційного тонусу
              </p>
            </div>
          </div>
          {openSections.dynamics ? (
            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          )}
        </button>

        {openSections.dynamics && (
          <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <StateDynamicsChart days={days} />
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. РОЗДІЛ: МОНІТОРИНГ СНУ */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('sleep')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Моніторинг Сну
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Відстеження годин, часу засинання та якості фаз сну
              </p>
            </div>
          </div>
          {openSections.sleep ? (
            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          )}
        </button>

        {openSections.sleep && (
          <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Заснув о:</label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Прокинувся о:</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Тривалість сну:</span>
                <span className="font-mono font-bold text-indigo-400">{sleepHours} годин</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSleep}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 cursor-pointer transition-all active:scale-98 shadow-sm flex items-center justify-center gap-1.5"
            >
              <Moon className="w-4 h-4" />
              <span>Зберегти дані про сон</span>
            </button>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 5. РОЗДІЛ: ВІДСЛІДКОВУВАННЯ ФІЗИЧНОЇ АКТИВНОСТІ */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('activity')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Фізична активність та кроки
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Крокомір, спорт та спалені калорії замість нікотину
              </p>
            </div>
          </div>
          {openSections.activity ? (
            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          )}
        </button>

        {openSections.activity && (
          <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800 space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Пройдено за день:</span>
                <span className="text-xl font-black text-emerald-500 tabular-nums">
                  {currentSteps.toLocaleString()} / {stepGoal.toLocaleString()} кроків
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSaveSteps(500)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer active:scale-95"
                >
                  +500
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSteps(1000)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer active:scale-95"
                >
                  +1000
                </button>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (currentSteps / stepGoal) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 6. РОЗДІЛ: МЕНТАЛЬНЕ ЗДОРОВ'Я (МЕНТАЛЬНІ ЗВИЧКИ & ДОФАМІН) */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('mental')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center text-pink-400 shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Психологічне та ментальне здоров'я
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Здоровий дофамін, подолання тривоги та адаптивні практики
              </p>
            </div>
          </div>
          {openSections.mental ? (
            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          )}
        </button>

        {openSections.mental && (
          <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <MentalHealthCard />
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 7. РОЗДІЛ: ТЕСТ ШТАНГЕ (ЗАПОРУКА ВИНОСЛИВОСТІ ЛЕГЕНІВ) */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('stange')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Тест Штанге (Ємність Легенів)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Замір тривалості затримки дихання на повній вентиляції
              </p>
            </div>
          </div>
          {openSections.stange ? (
            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          )}
        </button>

        {openSections.stange && (
          <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <StangeTestCard />
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 8. РОЗДІЛ: ВОДНИЙ БАЛАНС */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-3 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('hydration')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Водний баланс
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Очищення нирок та виведення токсинів нікотину через воду
              </p>
            </div>
          </div>
          {openSections.hydration ? (
            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          )}
        </button>

        {openSections.hydration && (
          <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <HydrationCard />
          </div>
        )}
      </div>
    </div>
  );
};
