import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  Trash2, 
  History, 
  Sparkles, 
  Check, 
  TrendingUp,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { MoneySettings, PriceTier, Streak } from '../types';

interface SavedResourcesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  money: MoneySettings | null;
  onSave: (newSettings: MoneySettings) => void;
  accent?: string;
  startDate?: number;
  longestStreakMs?: number;
  streaks?: Streak[];
  onOpenSetup?: () => void;
  onOpenRelapse?: () => void;
  onUndoLastRelapse?: () => void;
}

export const SavedResourcesSettingsModal: React.FC<SavedResourcesSettingsModalProps> = ({
  isOpen,
  onClose,
  money,
  onSave,
  accent = 'indigo',
  startDate,
  longestStreakMs,
  streaks = [],
  onOpenSetup,
  onOpenRelapse,
  onUndoLastRelapse
}) => {
  const [packPrice, setPackPrice] = useState<number>(money?.packPrice ?? 100);
  const [packSize, setPackSize] = useState<number>(money?.packSize ?? 20);
  const [perDay, setPerDay] = useState<number>(money?.perDay ?? 15);
  const [minutesPerCig, setMinutesPerCig] = useState<number>(money?.minutesPerCig ?? 7);
  const [currency, setCurrency] = useState<string>(money?.cur ?? '₴');
  const [priceHistory, setPriceHistory] = useState<PriceTier[]>(money?.priceHistory ?? []);

  const [showHistorySection, setShowHistorySection] = useState(false);
  const [economyMode, setEconomyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:economy-mode') === 'true';
    } catch {
      return false;
    }
  });
  const [newTierPrice, setNewTierPrice] = useState<number>(100);
  const [newTierDate, setNewTierDate] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPackPrice(money?.packPrice ?? 100);
      setPackSize(money?.packSize ?? 20);
      setPerDay(money?.perDay ?? 15);
      setMinutesPerCig(money?.minutesPerCig ?? 7);
      setCurrency(money?.cur ?? '₴');
      setPriceHistory(money?.priceHistory ?? []);
      setShowHistorySection(false);
      try {
        setEconomyMode(localStorage.getItem('quit-smoking:economy-mode') === 'true');
      } catch {}
    }
  }, [isOpen, money]);

  if (!isOpen) return null;

  const handleAddPriceTier = () => {
    if (!newTierDate || newTierPrice <= 0) return;
    const ts = new Date(newTierDate).getTime();
    if (!isFinite(ts)) return;

    const updated = [
      ...priceHistory.filter((t) => Math.abs(t.timestamp - ts) > 86400000),
      {
        timestamp: ts,
        packPrice: newTierPrice
      }
    ].sort((a, b) => a.timestamp - b.timestamp);

    setPriceHistory(updated);
    if (ts <= Date.now()) {
      setPackPrice(newTierPrice);
    }
  };

  const handleDeleteTier = (idx: number) => {
    setPriceHistory((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const validPackPrice = Math.max(1, Number(packPrice) || 100);
    const validPackSize = Math.max(1, Number(packSize) || 20);
    const validPerDay = Math.max(1, Number(perDay) || 15);
    const validMinutes = Math.max(1, Math.min(60, Number(minutesPerCig) || 7));

    const updated: MoneySettings = {
      packPrice: validPackPrice,
      packSize: validPackSize,
      perDay: validPerDay,
      minutesPerCig: validMinutes,
      cur: currency || '₴',
      priceHistory: priceHistory.length > 0 ? priceHistory : undefined
    };

    localStorage.setItem('quit-smoking:economy-mode', String(economyMode));
    window.dispatchEvent(new Event('storage'));

    onSave(updated);
    onClose();
  };

  // Live calculations for preview
  const safePackSize = Math.max(1, packSize || 20);
  const safePackPrice = Math.max(0, packPrice || 0);
  const safePerDay = Math.max(0, perDay || 0);
  const safeMinPerCig = Math.max(1, minutesPerCig || 7);

  const costPerCig = safePackSize > 0 ? safePackPrice / safePackSize : 0;
  const costPerDay = (safePerDay / safePackSize) * safePackPrice;
  const costPerMonth = costPerDay * 30;
  const costPerYear = costPerDay * 365;
  const timePerDayMinutes = safePerDay * safeMinPerCig;
  const timePerDayHours = (timePerDayMinutes / 60).toFixed(1);

  const getAccentBtn = () => {
    switch (accent) {
      case 'charcoal': return 'bg-zinc-700 hover:bg-zinc-800 text-white';
      case 'sage': return 'bg-[#5f7068] hover:bg-[#4f5d56] text-white';
      case 'taupe': return 'bg-[#786b62] hover:bg-[#655951] text-white';
      case 'slate-blue': return 'bg-[#5b6a82] hover:bg-[#4a586d] text-white';
      case 'ash-olive': return 'bg-[#5f6959] hover:bg-[#4d5648] text-white';
      case 'gray':
      default: return 'bg-slate-700 hover:bg-slate-800 text-white';
    }
  };

  const getAccentText = () => {
    switch (accent) {
      case 'charcoal': return 'text-zinc-600 dark:text-zinc-400';
      case 'sage': return 'text-stone-600 dark:text-stone-400';
      case 'taupe': return 'text-[#786b62] dark:text-[#c4b5a8]';
      case 'slate-blue': return 'text-[#5b6a82] dark:text-[#9bb0cc]';
      case 'ash-olive': return 'text-[#5f6959] dark:text-[#aab3a4]';
      case 'gray':
      default: return 'text-slate-600 dark:text-slate-300';
    }
  };

  const fmtDuration = (ms: number) => {
    const totalDays = Math.floor(ms / (24 * 3600 * 1000));
    const totalHours = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000));
    if (totalDays > 0) return `${totalDays}дн ${totalHours}год`;
    return `${totalHours}год`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 dark:bg-[#141418] w-full max-w-lg rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-zinc-800 flex-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-none">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#f4f4f5]">
                Параметри ресурсів та початку шляху
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Налаштування фінансів, дати відмови та історії серій
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-3.5 space-y-4 pr-1">
          {/* SECTION A: ПОЧАТОК ШЛЯХУ */}
          <div className="p-3.5 bg-white dark:bg-[#1a1a20] rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Початок шляху (Дата останнього старту)</span>
              </label>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#121215] border border-slate-200/60 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Точна дата та час:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {startDate ? new Date(startDate).toLocaleString('uk-UA', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '—'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {onOpenSetup && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenSetup(); }}
                  className="py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Змінити дату</span>
                </button>
              )}

              {onOpenRelapse && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenRelapse(); }}
                  className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Зафіксувати зрив</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION B: ІСТОРІЯ СЕРІЙ ТА НАЙДОВША СЕРІЯ */}
          <div className="p-3.5 bg-white dark:bg-[#1a1a20] rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                <span>Серії чистоти та найдовший рекорд</span>
              </label>
              {streaks && streaks.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300">
                  {streaks.length} зрив(ів)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121215] border border-slate-200/60 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Найдовша серія:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {longestStreakMs ? fmtDuration(longestStreakMs) : '—'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121215] border border-slate-200/60 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Всього зривів у минулому:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                  {streaks ? streaks.length : 0}
                </span>
              </div>
            </div>

            {streaks && streaks.length > 0 && onUndoLastRelapse && (
              <button
                type="button"
                onClick={onUndoLastRelapse}
                className="w-full py-2 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Скасувати останній зрив</span>
              </button>
            )}
          </div>
          {/* 1. Ціна за пачку (Вручну введення) */}
          <div className="p-3.5 bg-white dark:bg-[#1a1a20] rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Вартість пачки</span>
              </label>
            </div>

            {/* Manual Input Field */}
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={packPrice || ''}
                onChange={(e) => setPackPrice(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 dark:bg-[#121215] border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all placeholder:text-slate-400"
                placeholder="100"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400 dark:text-zinc-500 pointer-events-none">
                {currency}
              </span>
            </div>

            {/* Price change by date toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowHistorySection(!showHistorySection)}
                className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <History className="w-3 h-3 text-slate-400" />
                <span>Історія зміни цін за датами ({priceHistory.length})</span>
              </button>
              <span className="text-[10px] text-slate-400 font-mono">
                {showHistorySection ? '▲' : '▼'}
              </span>
            </div>

            {/* Price change history sub-panel */}
            {showHistorySection && (
              <div className="mt-2 p-3 bg-slate-50 dark:bg-[#121215] rounded-xl border border-slate-200/60 dark:border-zinc-800 space-y-2.5">
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Якщо сигарети змінювали ціну в минулому, вкажіть дату початку нової ціни для точного ретроспективного підрахунку.
                </p>

                {/* Add tier form */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newTierDate}
                    onChange={(e) => setNewTierDate(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#1a1a20] border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                  <div className="relative w-24">
                    <input
                      type="number"
                      min="1"
                      placeholder="Ціна"
                      value={newTierPrice || ''}
                      onChange={(e) => setNewTierPrice(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#1a1a20] border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      {currency}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPriceTier}
                    className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs active:scale-95"
                  >
                    Додати
                  </button>
                </div>

                {/* List of price tiers */}
                {priceHistory.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {priceHistory.map((tier, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#1a1a20] border border-slate-200/60 dark:border-zinc-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600 dark:text-zinc-400">
                            З {new Date(tier.timestamp).toLocaleDateString('uk-UA')}:
                          </span>
                          <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                            {tier.packPrice} {currency}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTier(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-rose-500/10 cursor-pointer transition-colors"
                          title="Видалити період"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 block text-center py-1">
                    Історія цін порожня. Використовується єдина поточна ціна.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 2. Скільки сигарет у пачці (Слайдер) */}
          <div className="p-3.5 bg-white dark:bg-[#1a1a20] rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Сигарет у пачці</span>
              </label>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs">
                {packSize} шт
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="10"
                max="40"
                step="1"
                value={packSize}
                onChange={(e) => setPackSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>10 шт</span>
                <span>20 шт (стандарт)</span>
                <span>40 шт</span>
              </div>
            </div>
          </div>

          {/* 3. Скільки скурював сигарет на день (Слайдер) */}
          <div className="p-3.5 bg-white dark:bg-[#1a1a20] rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span>Сигарет на день</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  ≈ {(safePerDay / safePackSize).toFixed(1)} пач/день
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
                  {perDay} шт/день
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={perDay}
                onChange={(e) => setPerDay(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>1 шт</span>
                <span>20 шт (1 пачка)</span>
                <span>60 шт</span>
              </div>
            </div>
          </div>

          {/* 4. Скільки часу йшло на одну сигарету (Слайдер) */}
          <div className="p-3.5 bg-white dark:bg-[#1a1a20] rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Час на одну сигарету</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  {timePerDayHours} год/день
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs">
                  {minutesPerCig} хв
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={minutesPerCig}
                onChange={(e) => setMinutesPerCig(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>1 хв</span>
                <span>7 хв (середнє)</span>
                <span>25 хв</span>
              </div>
            </div>
          </div>

          {/* 5. Live Calculations Card */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-3">
             <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Економний режим (вимкнути анімації)</span>
              </label>
              <button
                type="button"
                onClick={() => setEconomyMode(!economyMode)}
                className={`w-10 h-5 rounded-full p-1 transition-colors ${economyMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}
              >
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${economyMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <span>Прогноз збережених ресурсів:</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-white dark:bg-[#141418] border border-slate-200/60 dark:border-zinc-800">
                <span className="text-[9.5px] text-slate-400 block uppercase font-bold tracking-wider">
                  На місяць
                </span>
                <span className={`text-xs sm:text-sm font-black font-mono ${getAccentText()}`}>
                  ~{Math.round(costPerMonth).toLocaleString('uk-UA')} {currency}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white dark:bg-[#141418] border border-slate-200/60 dark:border-zinc-800">
                <span className="text-[9.5px] text-slate-400 block uppercase font-bold tracking-wider">
                  На рік
                </span>
                <span className={`text-xs sm:text-sm font-black font-mono ${getAccentText()}`}>
                  ~{Math.round(costPerYear).toLocaleString('uk-UA')} {currency}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white dark:bg-[#141418] border border-slate-200/60 dark:border-zinc-800">
                <span className="text-[9.5px] text-slate-400 block uppercase font-bold tracking-wider">
                  Часу на рік
                </span>
                <span className={`text-xs sm:text-sm font-black font-mono ${getAccentText()}`}>
                  ~{Math.round((timePerDayMinutes * 365) / 60).toLocaleString('uk-UA')} год
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-none gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            Скасувати
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`px-5 py-2.5 ${getAccentBtn()} font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all`}
          >
            <Check className="w-4 h-4" />
            <span>Зберегти налаштування</span>
          </button>
        </div>
      </div>
    </div>
  );
};
