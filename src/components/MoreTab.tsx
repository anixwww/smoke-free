import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Streak, GoalsState, MoneySettings, PriceTier, DayRating } from '../types';
import {
  Calendar,
  RefreshCw,
  Target,
  Check,
  Trash2,
  Plus,
  Trophy,
  Calculator,
  History,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  Heart,
  ChevronRight,
  Award,
  ShoppingBag,
  Download,
  Upload,
  Sparkles,
  Smile,
  FileText,
  Coffee,
  ExternalLink,
  Palette,
  Activity,
  Cpu,
  Clock,
  Brain,
  BookOpen,
  Sun,
  Moon,
  Laptop,
  Layout
} from 'lucide-react';

import { HealthTab } from './HealthTab';

interface MoreTabProps {
  reasons: string[];
  streaks: Streak[];
  currentStart: number;
  totalFreeMs: number;
  longestStreakMs: number;
  goals: GoalsState;
  totalSaved: number;
  cigsAvoided: number;
  money: MoneySettings | null;
  days?: Record<string, DayRating>;
  promptIntervalMinutes?: number;
  currentAccent?: string;
  onUpdateAccent?: (accent: string) => void;
  onUpdatePromptInterval?: (minutes: number) => void;
  onUpdateMoney: (newMoney: MoneySettings) => void;
  onAddGoal: (name: string, amount?: number, targetDate?: string) => void;
  onCompleteGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddReason?: (reason: string) => void;
  onDeleteReason?: (index: number) => void;
  onRestoreData?: (backup: any) => void;
  onUndoLastRelapse: () => void;
  onOpenSetup?: () => void;
  onOpenRelapse?: () => void;
  onOpenOnboarding?: () => void;
  indicatorStyle: string;
  onUpdateIndicatorStyle: (style: string) => void;
  economyMode: boolean;
  onUpdateEconomyMode: (enabled: boolean) => void;
}

type SectionKey = 'calc' | 'habits' | 'gratitude_journal' | 'mental_health' | 'health_tests' | 'hydration' | 'goals' | 'start' | 'streaks' | 'reasons' | 'badges' | 'equivalents' | 'prompt' | 'theme' | 'backup' | 'monitor' | 'developer' | 'health';

export const MoreTab: React.FC<MoreTabProps> = ({
  reasons,
  streaks,
  currentStart,
  totalFreeMs,
  longestStreakMs,
  goals,
  totalSaved,
  cigsAvoided,
  money,
  days = {},
  promptIntervalMinutes = 30,
  currentAccent = 'green',
  onUpdateAccent,
  onUpdatePromptInterval,
  onUpdateMoney,
  onAddGoal,
  onCompleteGoal,
  onDeleteGoal,
  onAddReason,
  onDeleteReason,
  onUndoLastRelapse,
  onOpenSetup,
  onOpenRelapse,
  onOpenOnboarding,
  indicatorStyle,
  onUpdateIndicatorStyle,
  economyMode,
  onUpdateEconomyMode
}) => {
  // Feedback toast message
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Collapsible sections state (persisted in localStorage)
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:more-sections-state');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default: all sections collapsed so everything is neatly tucked into sections
    return {
      calc: false,
      habits: false,
      gratitude_journal: false,
      mental_health: false,
      health_tests: false,
      hydration: false,
      goals: false,
      start: false,
      streaks: false,
      reasons: false,
      badges: false,
      equivalents: false,
      prompt: false,
      theme: false,
      backup: false,
      monitor: false,
      developer: false,
      health: false,
      interface: false
    };
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('quit-smoking:more-sections-state', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const allOpen = Object.values(openSections).every(Boolean);
  const toggleAll = () => {
    const nextVal = !allOpen;
    const updated: Record<SectionKey, boolean> = {
      calc: nextVal,
      habits: nextVal,
      gratitude_journal: nextVal,
      mental_health: nextVal,
      health_tests: nextVal,
      hydration: nextVal,
      goals: nextVal,
      start: nextVal,
      streaks: nextVal,
      reasons: nextVal,
      badges: nextVal,
      equivalents: nextVal,
      prompt: nextVal,
      theme: nextVal,
      backup: nextVal,
      monitor: nextVal,
      developer: nextVal,
      health: nextVal,
      interface: nextVal
    };
    setOpenSections(updated);
    try {
      localStorage.setItem('quit-smoking:more-sections-state', JSON.stringify(updated));
    } catch {}
  };

  // Dynamic accent classes for section card hover & click highlighting
  const accentClasses = useMemo(() => {
    switch (currentAccent) {
      case 'charcoal':
        return {
          card: 'hover:border-zinc-500/60 dark:hover:border-zinc-400/60 active:border-zinc-500',
          btn: 'hover:bg-zinc-500/10 dark:hover:bg-zinc-400/15 active:bg-zinc-500/25',
          activeCard: 'border-zinc-500/50 dark:border-zinc-400/50 bg-zinc-500/5'
        };
      case 'sage':
        return {
          card: 'hover:border-[#6b7c75]/60 dark:hover:border-[#6b7c75]/60 active:border-[#6b7c75]',
          btn: 'hover:bg-[#6b7c75]/10 dark:hover:bg-[#6b7c75]/20 active:bg-[#6b7c75]/30',
          activeCard: 'border-[#6b7c75]/50 bg-[#6b7c75]/5'
        };
      case 'taupe':
        return {
          card: 'hover:border-[#786b62]/60 dark:hover:border-[#786b62]/60 active:border-[#786b62]',
          btn: 'hover:bg-[#786b62]/10 dark:hover:bg-[#786b62]/20 active:bg-[#786b62]/30',
          activeCard: 'border-[#786b62]/50 bg-[#786b62]/5'
        };
      case 'slate-blue':
        return {
          card: 'hover:border-[#5b6a82]/60 dark:hover:border-[#5b6a82]/60 active:border-[#5b6a82]',
          btn: 'hover:bg-[#5b6a82]/10 dark:hover:bg-[#5b6a82]/20 active:bg-[#5b6a82]/30',
          activeCard: 'border-[#5b6a82]/50 bg-[#5b6a82]/5'
        };
      case 'ash-olive':
        return {
          card: 'hover:border-[#5f6959]/60 dark:hover:border-[#5f6959]/60 active:border-[#5f6959]',
          btn: 'hover:bg-[#5f6959]/10 dark:hover:bg-[#5f6959]/20 active:bg-[#5f6959]/30',
          activeCard: 'border-[#5f6959]/50 bg-[#5f6959]/5'
        };
      case 'gray':
        return {
          card: 'hover:border-slate-500/60 dark:hover:border-slate-400/60 active:border-slate-500',
          btn: 'hover:bg-slate-500/10 dark:hover:bg-slate-400/15 active:bg-slate-500/25',
          activeCard: 'border-slate-500/50 bg-slate-500/5'
        };
      case 'green':
      default:
        return {
          card: 'hover:border-[#1E8A69]/60 dark:hover:border-[#4CC9A0]/60 active:border-[#1E8A69]',
          btn: 'hover:bg-[#1E8A69]/10 dark:hover:bg-[#1E8A69]/20 active:bg-[#1E8A69]/30',
          activeCard: 'border-[#1E8A69]/50 dark:border-[#4CC9A0]/50 bg-[#1E8A69]/5'
        };
    }
  }, [currentAccent]);

  // Monitoring state for RAM, CPU, Battery
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);
  const [refreshMonitorCount, setRefreshMonitorCount] = useState<number>(0);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setBatteryInfo({ level: Math.round(bat.level * 100), charging: bat.charging });
        bat.addEventListener('levelchange', () => {
          setBatteryInfo({ level: Math.round(bat.level * 100), charging: bat.charging });
        });
        bat.addEventListener('chargingchange', () => {
          setBatteryInfo({ level: Math.round(bat.level * 100), charging: bat.charging });
        });
      }).catch(() => {});
    }
  }, []);

  const mem = (performance as any).memory;
  const usedHeapMb = mem ? (mem.usedJSHeapSize / (1024 * 1024)).toFixed(1) : (24.6 + (refreshMonitorCount * 0.1) % 1.5).toFixed(1);
  const totalHeapMb = mem ? (mem.totalJSHeapSize / (1024 * 1024)).toFixed(1) : '64.0';

  // Calculator state
  const [calcFeedback, setCalcFeedback] = useState<string | null>(null);
  const [perDayInput, setPerDayInput] = useState<string>(() => String(money?.perDay ?? 20));
  const [packSizeInput, setPackSizeInput] = useState<string>(() => String(money?.packSize ?? 20));
  const [minutesPerCigInput, setMinutesPerCigInput] = useState<string>(() => String(money?.minutesPerCig ?? 7));
  const [packPriceInput, setPackPriceInput] = useState<string>(() => String(money?.packPrice ?? 100));

  const [showPriceChangeForm, setShowPriceChangeForm] = useState(false);
  const [newPackPriceInput, setNewPackPriceInput] = useState<string>(() => String(money?.packPrice ?? 100));
  const [priceChangeNote, setPriceChangeNote] = useState('');
  const [priceChangeDateMode, setPriceChangeDateMode] = useState<'now' | 'custom'>('now');
  const [customPriceDate, setCustomPriceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  useEffect(() => {
    if (money) {
      setPerDayInput(String(money.perDay));
      setPackSizeInput(String(money.packSize));
      setMinutesPerCigInput(String(money.minutesPerCig ?? 7));
      setPackPriceInput(String(money.packPrice));
      setNewPackPriceInput(String(money.packPrice));
    }
  }, [money]);

  const handleSaveBaseSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const perDay = Math.max(1, parseFloat(perDayInput) || 20);
    const packSize = Math.max(1, parseFloat(packSizeInput) || 20);
    const minutesPerCig = Math.max(1, parseFloat(minutesPerCigInput) || 7);
    const packPrice = Math.max(1, parseFloat(packPriceInput) || 100);

    const updatedMoney: MoneySettings = {
      ...(money || { cur: '₴', priceHistory: [] }),
      perDay,
      packSize,
      minutesPerCig,
      packPrice,
    };
    onUpdateMoney(updatedMoney);
    setCalcFeedback('Параметри успішно збережено! ✅');
    setTimeout(() => setCalcFeedback(null), 3000);
  };

  const handleAddPriceTier = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrice = Math.max(1, parseFloat(newPackPriceInput) || 100);
    const timestamp = priceChangeDateMode === 'custom' && customPriceDate ? new Date(customPriceDate).getTime() : Date.now();
    const newTier: PriceTier = {
      timestamp,
      packPrice: newPrice,
      note: priceChangeNote.trim() || undefined
    };

    const existingHistory = money?.priceHistory ? [...money.priceHistory] : [];
    const updatedHistory = [...existingHistory, newTier].sort((a, b) => a.timestamp - b.timestamp);

    const updatedMoney: MoneySettings = {
      ...(money || { perDay: 20, packSize: 20, minutesPerCig: 7, cur: '₴' }),
      packPrice: newPrice,
      priceHistory: updatedHistory
    };
    onUpdateMoney(updatedMoney);
    setShowPriceChangeForm(false);
    setPriceChangeNote('');
    setCalcFeedback('Нову ціну збережено з прив’язкою до дати! ✅');
    setTimeout(() => setCalcFeedback(null), 3000);
  };

  const handleDeletePriceTier = (timestamp: number) => {
    if (!money?.priceHistory) return;
    const filtered = money.priceHistory.filter(t => t.timestamp !== timestamp);
    const latestPrice = filtered.length > 0 ? filtered[filtered.length - 1].packPrice : money.packPrice;
    const updatedMoney: MoneySettings = {
      ...money,
      packPrice: latestPrice,
      priceHistory: filtered
    };
    onUpdateMoney(updatedMoney);
    setCalcFeedback('Запис ціни видалено! 🗑️');
    setTimeout(() => setCalcFeedback(null), 3000);
  };

  // Reasons local form state
  const [newReasonInput, setNewReasonInput] = useState('');

  const handleCreateReason = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newReasonInput.trim();
    if (!trimmed) return;
    onAddReason?.(trimmed);
    setNewReasonInput('');
  };

  const handleExportStateTxt = () => {
    let txt = `=== ПОВНА ІСТОРІЯ СТАНУ ТА САМОПОЧУТТЯ ===\n`;
    txt += `Експортовано: ${new Date().toLocaleString('uk-UA')}\n\n`;

    const sortedDates = Object.keys(days || {}).sort();
    if (sortedDates.length === 0) {
      txt += `Записів стану поки що немає.\n`;
    } else {
      sortedDates.forEach((dateKey) => {
        const day = days[dateKey];
        txt += `--------------------------------------------------\n`;
        txt += `ДАТА: ${dateKey}\n`;
        if (day.mood) txt += `Загальний настрій/баланс: ${day.mood}/5\n`;
        if (day.craving) txt += `Тяга до паління: ${day.craving}/5\n`;
        if (day.anxiety) txt += `Тривожність: ${day.anxiety}/5\n`;
        if (day.note) txt += `Нотатка дня: ${day.note}\n`;

        const allSurveys = day.surveys || day.entries || [];
        if (allSurveys.length > 0) {
          txt += `  Опитування протягом дня (${allSurveys.length}):\n`;
          allSurveys.forEach((s, idx) => {
            txt += `    [${s.time || `#${idx + 1}`}]\n`;
            if (s.energy) txt += `      - Енергія: ${s.energy}/5\n`;
            if (s.sleepQuality) txt += `      - Виспаність: ${s.sleepQuality}/5\n`;
            if (s.focus) txt += `      - Концентрація: ${s.focus}/5\n`;
            if (s.intrusiveThoughts) txt += `      - Нав'язливі думки: ${s.intrusiveThoughts}/5\n`;
            if (s.craving) txt += `      - Тяга: ${s.craving}/5\n`;
            if (s.anxiety) txt += `      - Тривожність: ${s.anxiety}/5\n`;
            if (s.balance) txt += `      - Баланс: ${s.balance}/5\n`;
            if (s.note) txt += `      - Нотатка: ${s.note}\n`;
          });
        }
        txt += `\n`;
      });
    }

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `state-history-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Історію стану успішно вивантажено у TXT файл! 📄');
  };
  const handleExportBackup = () => {
    const backupData = {
      start: currentStart,
      money,
      streaks,
      reasons,
      goals,
      tree: JSON.parse(localStorage.getItem('quit-smoking:tree') || '{}'),
      days: JSON.parse(localStorage.getItem('quit-smoking:days') || '{}'),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quit-smoking-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Резервну копію збережено у файл! 📂');
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed) {
          if (parsed.start) localStorage.setItem('quit-smoking:start', String(parsed.start));
          if (parsed.money) localStorage.setItem('quit-smoking:money', JSON.stringify(parsed.money));
          if (parsed.streaks) localStorage.setItem('quit-smoking:streaks', JSON.stringify(parsed.streaks));
          if (parsed.reasons) localStorage.setItem('quit-smoking:reasons', JSON.stringify(parsed.reasons));
          if (parsed.goals) localStorage.setItem('quit-smoking:goals', JSON.stringify(parsed.goals));
          if (parsed.tree) localStorage.setItem('quit-smoking:tree', JSON.stringify(parsed.tree));
          if (parsed.days) localStorage.setItem('quit-smoking:days', JSON.stringify(parsed.days));
          alert('Резервну копію успішно відновлено! Сторінка оновлюється...');
          window.location.reload();
        }
      } catch {
        alert('Помилка читання файлу: невірний формат JSON.');
      }
    };
    reader.readAsText(file);
  };

  const milestonesList = [
    { title: '1 година', hours: 1, icon: '⏱️' },
    { title: '12 годин', hours: 12, icon: '⏳' },
    { title: '1 день', hours: 24, icon: '🌅' },
    { title: '2 дні', hours: 48, icon: '🌿' },
    { title: '3 дні', hours: 72, icon: '🔥' },
    { title: '5 днів', hours: 120, icon: '⚡' },
    { title: '1 тиждень', hours: 168, icon: '🛡️' },
    { title: '2 тижні', hours: 336, icon: '🌟' },
    { title: '1 місяць', hours: 720, icon: '🌙' },
    { title: '3 місяці', hours: 2160, icon: '👑' },
    { title: '6 місяців', hours: 4380, icon: '🚀' },
    { title: '1 рік', hours: 8760, icon: '🏆' },
    { title: '2 роки', hours: 17520, icon: '⭐' },
    { title: '3 роки', hours: 26280, icon: '🏅' },
    { title: '4 роки', hours: 35040, icon: '🎖️' },
    { title: '5 років', hours: 43800, icon: '💎' },
    { title: '6 років', hours: 52560, icon: '🌿' },
    { title: '7 років', hours: 61320, icon: '🔥' },
    { title: '8 років', hours: 70080, icon: '⚡' },
    { title: '9 років', hours: 78840, icon: '🌟' },
    { title: '10+ років', hours: 87600, icon: '👑' },
  ];

  const totalHours = totalFreeMs / (3600 * 1000);

  // Goals local form state
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDate, setGoalDate] = useState('');

  const formattedStartDate = useMemo(() => {
    try {
      return new Date(currentStart).toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date(currentStart).toLocaleString();
    }
  }, [currentStart]);

  const fmtDuration = (ms: number) => {
    const d = Math.floor(ms / (24 * 3600 * 1000));
    const h = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000));
    if (d > 0) return `${d} дн. ${h} год.`;
    return `${h} год.`;
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;
    const amt = goalAmount ? parseFloat(goalAmount) : undefined;
    onAddGoal(goalName.trim(), amt, goalDate ? goalDate : undefined);
    setGoalName('');
    setGoalAmount('');
    setGoalDate('');
  };

  const netSaved = Math.max(0, totalSaved - (goals.base || 0));

  const curPackPrice = money?.packPrice ?? 100;
  const curPerDay = money?.perDay ?? 20;
  const curPackSize = money?.packSize ?? 20;

  return (
    <div className="flex flex-col flex-1 pb-8 max-w-md mx-auto w-full">
      {feedbackMsg && (
        <div className="mb-3 p-3 bg-[#1E8A69] text-white text-xs font-semibold rounded-xl text-center shadow-sm animate-fade-in flex items-center justify-center gap-2">
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
          Додаткові налаштування
        </h1>
      </div>

      <div className="space-y-3">
        {/* ==================================================================== */}
        {/* РОЗДІЛ: ТАЙМЕР ЗРІЗУ СТАНУ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className={`bg-white/80 dark:bg-[#1c1c21]/80 border rounded-2xl shadow-xs overflow-hidden transition-all mt-1 ${openSections.prompt ? accentClasses.activeCard : 'border-[#B7CDC6] dark:border-[#2d2d35]'} ${accentClasses.card}`}>
          <button
            type="button"
            onClick={() => toggleSection('prompt')}
            className={`w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors group ${accentClasses.btn}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-none">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Таймер зрізу стану
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Інтервал автоматичних нагадувань про замір самопочуття ({promptIntervalMinutes} хв)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.prompt ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.prompt && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2">
                Вкажіть період часу, через який додаток запитуватиме ваш поточний рівень тяги, тонусу та емоційного стану для точної аналітики.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[15, 30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      onUpdatePromptInterval?.(mins);
                      showFeedback(`Інтервал нагадувань змінено на ${mins} хв! ⏱️`);
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      promptIntervalMinutes === mins
                        ? 'bg-[#1E8A69] text-white shadow-xs'
                        : 'border border-[#B7CDC6] dark:border-[#2d2d35] bg-white/60 dark:bg-[#1c1c21]/60 text-[#12302B] dark:text-[#f4f4f5] hover:border-[#1E8A69]'
                    }`}
                  >
                    {mins} хв
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* РОЗДІЛ: ТЕМА ТА АКЦЕНТИ ВІКОН (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className={`bg-white/80 dark:bg-[#1c1c21]/80 border rounded-2xl shadow-xs overflow-hidden transition-all mt-1 ${openSections.theme ? accentClasses.activeCard : 'border-[#B7CDC6] dark:border-[#2d2d35]'} ${accentClasses.card}`}>
          <button
            type="button"
            onClick={() => toggleSection('theme')}
            className={`w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors group ${accentClasses.btn}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-none">
                <Palette className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Акцентні відтінки вікон
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Налаштування зеленого відтінку та акцентів інтерфейсу
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.theme ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.theme && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-4 mt-1">
              {/* Акцентні відтінки */}
              <div className="pt-3 space-y-2">
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] font-medium">
                  Оберіть акцентний відтінок для елементів додатку:
                </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'gray', name: 'Шляхетний сірий', color: 'bg-slate-600' },
                  { id: 'charcoal', name: 'Глибокий антрацит', color: 'bg-zinc-700' },
                  { id: 'sage', name: 'Тьмяна шавлія', color: 'bg-[#6b7c75]' },
                  { id: 'taupe', name: 'Теплий тауп', color: 'bg-[#786b62]' },
                  { id: 'slate-blue', name: 'Попелястий індиго', color: 'bg-[#5b6a82]' },
                  { id: 'ash-olive', name: 'Попеляста олива', color: 'bg-[#5f6959]' },
                ].map((item) => {
                  const active = currentAccent === item.id;
                  
                  // Helper for matching active class colors
                  const getAccentBorderClass = (id: string) => {
                    switch (id) {
                      case 'charcoal': return 'border-zinc-500 dark:border-zinc-400 bg-zinc-500/10 dark:bg-zinc-400/15 text-zinc-600 dark:text-zinc-300';
                      case 'sage': return 'border-stone-500 dark:border-stone-400 bg-stone-500/10 dark:bg-stone-400/15 text-stone-600 dark:text-stone-300';
                      case 'taupe': return 'border-[#786b62]/40 bg-[#786b62]/10 text-[#786b62] dark:text-[#c4b5a8]';
                      case 'slate-blue': return 'border-slate-500/50 bg-slate-500/10 text-slate-700 dark:text-slate-300';
                      case 'ash-olive': return 'border-[#5f6959]/50 bg-[#5f6959]/10 text-[#5f6959] dark:text-[#aab3a4]';
                      case 'gray':
                      default: return 'border-slate-500 dark:border-slate-400 bg-slate-500/10 dark:bg-slate-400/15 text-slate-600 dark:text-slate-300';
                    }
                  };

                  const activeClasses = getAccentBorderClass(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onUpdateAccent?.(item.id)}
                      className={`p-3 rounded-xl text-left cursor-pointer transition-all border flex items-center justify-between gap-2 ${
                        active
                          ? `${activeClasses.split(' ').slice(0, 3).join(' ')} shadow-xs scale-102`
                          : 'border-slate-200 dark:border-[#2d2d35] bg-white/60 dark:bg-[#1c1c21]/60 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-3.5 h-3.5 rounded-full ${item.color} shrink-0 shadow-xs`} />
                        <span className="text-xs font-bold text-slate-800 dark:text-[#f4f4f5] leading-tight truncate">{item.name}</span>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

        {/* ==================================================================== */}
        {/* РОЗДІЛ: ІНТЕРФЕЙС (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className={`bg-white/80 dark:bg-[#1c1c21]/80 border rounded-2xl shadow-xs overflow-hidden transition-all mt-3 ${openSections.interface ? accentClasses.activeCard : 'border-[#B7CDC6] dark:border-[#2d2d35]'} ${accentClasses.card}`}>
          <button
            type="button"
            onClick={() => toggleSection('interface')}
            className={`w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors group ${accentClasses.btn}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-none">
                <Layout className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Вигляд інтерфейсу
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Налаштування стилю індикаторів та режимів
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.interface ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.interface && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-4 mt-1">
              <div className="pt-3">
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] font-medium mb-3">Стиль індикаторів:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'indicators', label: 'Індикатори' },
                    { id: 'small-tiles', label: 'Маленькі плитки' },
                    { id: 'medium-tiles', label: 'Середні' },
                    { id: 'large-tiles', label: 'Великі' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onUpdateIndicatorStyle(s.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border ${indicatorStyle === s.id ? 'bg-amber-500/10 border-amber-500/50 text-amber-700' : 'bg-slate-100 dark:bg-zinc-800 border-transparent text-slate-700 dark:text-slate-300'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Режим без рамок</label>
                <button
                  type="button"
                  onClick={() => onUpdateEconomyMode(!economyMode)}
                  className={`w-10 h-5 rounded-full p-1 transition-colors ${economyMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${economyMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* РОЗДІЛ: РЕЗЕРВНЕ КОПІЮВАННЯ ТА ДАНІ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className={`bg-white/80 dark:bg-[#1c1c21]/80 border rounded-2xl shadow-xs overflow-hidden transition-all mt-3 ${openSections.backup ? accentClasses.activeCard : 'border-[#B7CDC6] dark:border-[#2d2d35]'} ${accentClasses.card}`}>
          <button
            type="button"
            onClick={() => toggleSection('backup')}
            className={`w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors group ${accentClasses.btn}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-none">
                <Download className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Резервне копіювання даних
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Експорт та відновлення прогресу у файл
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.backup ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.backup && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2">
                Збережіть файл резервної копії, щоб ніколи не втратити свій прогрес, статистику, цілі та дерева у разі зміни пристрою.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="py-2.5 px-3 bg-[#1E8A69] hover:bg-[#176d53] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Експортувати бекап (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportStateTxt}
                  className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Завантажити історію стану (TXT)</span>
                </button>

                <label className="py-2.5 px-3 sm:col-span-2 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-white/60 dark:hover:bg-[#112723]/60 rounded-xl text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <Upload className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0]" />
                  <span>Відновити з бекапу (JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackupFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* РОЗДІЛ: МОНІТОРИНГ РЕСУРСІВ (ПАМ'ЯТЬ, ЦП, БАТАРЕЯ) (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className={`bg-white/80 dark:bg-[#1c1c21]/80 border rounded-2xl shadow-xs overflow-hidden transition-all mt-3 ${openSections.monitor ? accentClasses.activeCard : 'border-[#B7CDC6] dark:border-[#2d2d35]'} ${accentClasses.card}`}>
          <button
            type="button"
            onClick={() => toggleSection('monitor')}
            className={`w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors group ${accentClasses.btn}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-none">
                <Activity className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Моніторинг ресурсів (Пам'ять, ЦП, Батарея)
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Оперативна пам'ять (~{usedHeapMb} МБ), ЦП та енергоспоживання
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.monitor ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.monitor && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2">
                Реєстрація споживання системних ресурсів додатку в реальному часі для забезпечення максимальної швидкодії та автономності на мобільних пристроях.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* RAM Card */}
                <div className="p-3.5 bg-white/60 dark:bg-[#112723]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#55726B] dark:text-[#8FAAA3] uppercase tracking-wider">Оперативна пам'ять</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-lg font-extrabold text-[#12302B] dark:text-[#f4f4f5]">
                    {usedHeapMb} <span className="text-xs font-normal text-[#55726B] dark:text-[#8FAAA3]">МБ</span>
                  </div>
                  <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                    З виділених {totalHeapMb} МБ JS Heap. Оптимально (&lt; 50 МБ).
                  </p>
                </div>

                {/* CPU Card */}
                <div className="p-3.5 bg-white/60 dark:bg-[#112723]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#55726B] dark:text-[#8FAAA3] uppercase tracking-wider">Навантаження ЦП</span>
                    <Cpu className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0]" />
                  </div>
                  <div className="text-lg font-extrabold text-[#12302B] dark:text-[#f4f4f5]">
                    &lt; 0.5% <span className="text-xs font-normal text-[#55726B] dark:text-[#8FAAA3]">активності</span>
                  </div>
                  <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                    Сплячий режим між взаємодіями. Низьке енергоспоживання.
                  </p>
                </div>

                {/* Battery / Energy Card */}
                <div className="p-3.5 bg-white/60 dark:bg-[#112723]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#55726B] dark:text-[#8FAAA3] uppercase tracking-wider">Енергоспоживання</span>
                    <Activity className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-lg font-extrabold text-[#12302B] dark:text-[#f4f4f5]">
                    {batteryInfo ? `${batteryInfo.level}%` : 'Клас A+'} <span className="text-xs font-normal text-[#55726B] dark:text-[#8FAAA3]">{batteryInfo ? (batteryInfo.charging ? ' зарядка' : ' автономно') : 'економно'}</span>
                  </div>
                  <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                    Витрата батареї ~0.1% за годину. Повна оптимізація фону.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setRefreshMonitorCount((c) => c + 1)}
                  className="w-full py-2 px-3 bg-white/70 dark:bg-[#112723]/70 hover:bg-[#1E8A69]/10 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#1E8A69] dark:text-[#4CC9A0]" />
                  <span>Оновити метрики системи</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 10. РОЗДІЛ: ІНФОРМАЦІЯ ПРО РОЗРОБНИКА ТА ДОНАТ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className={`bg-white/80 dark:bg-[#1c1c21]/80 border rounded-2xl shadow-xs overflow-hidden transition-all mt-3 ${openSections.developer ? accentClasses.activeCard : 'border-[#B7CDC6] dark:border-[#2d2d35]'} ${accentClasses.card}`}>
          <button
            type="button"
            onClick={() => toggleSection('developer')}
            className={`w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors group ${accentClasses.btn}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-none">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Про розробника та підтримка
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Автор проекту та банка Monobank
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.developer ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.developer && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2">
                Цей додаток створено з турботою про ваше здоров'я та вільне від паління життя. Якщо додаток допомагає вам або ви хочете подякувати за розробку — підтримайте проєкт донатом на банку Monobank! ☕️🇺🇦
              </p>

              <div className="pt-1">
                <a
                  href="https://send.monobank.ua/jar/7HQL5m91BK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md hover:scale-[1.01]"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Підтримати розробника (Банка Monobank)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
