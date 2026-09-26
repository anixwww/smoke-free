import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Calendar,
  Clock,
  Coins,
  Activity,
  Compass,
  Heart,
  ShieldCheck,
  User,
  Sliders
} from 'lucide-react';
import { MoneySettings } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    userName: string;
    startDate: number;
    money: MoneySettings;
    mainReason: string;
    initialSurvey?: {
      craving: number;
      mood: number;
      energy: number;
      anxiety: number;
      note: string;
    };
  }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Profile / Name
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem('quit-smoking:user-name') || ''
  );

  // Step 3: Savings Data
  const [perDay, setPerDay] = useState<string>('20');
  const [packPrice, setPackPrice] = useState<string>('100');
  const [packSize, setPackSize] = useState<string>('20');
  const [currency, setCurrency] = useState<'₴' | '$' | '€'>('₴');
  const [minutesPerCig, setMinutesPerCig] = useState<string>('7');

  // Start Date
  const [dateMode, setDateMode] = useState<'now' | 'custom'>('now');
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  // Step 4: State Survey & Motivation
  const [craving, setCraving] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(7);
  const [calmness, setCalmness] = useState<number>(7);
  const [mainReason, setMainReason] = useState<string>('Дихати на повні груди та повернути енергію');

  if (!isOpen) return null;

  // Live calculations for savings
  const numPerDay = Math.max(1, parseFloat(perDay) || 20);
  const numPrice = Math.max(1, parseFloat(packPrice) || 100);
  const numPackSize = Math.max(1, parseInt(packSize, 10) || 20);
  const costPerCig = numPrice / numPackSize;
  const monthlySaved = Math.round(numPerDay * costPerCig * 30.5);
  const yearlySaved = Math.round(numPerDay * costPerCig * 365);
  const yearlyHoursSaved = Math.round((numPerDay * (parseInt(minutesPerCig, 10) || 7) * 365) / 60);

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    let finalStart = Date.now();
    if (dateMode === 'custom') {
      const parsed = new Date(customDate).getTime();
      if (isFinite(parsed) && parsed > 0) {
        finalStart = parsed;
      }
    }

    const moneySettings: MoneySettings = {
      perDay: numPerDay,
      packPrice: numPrice,
      packSize: numPackSize,
      minutesPerCig: Math.max(1, parseInt(minutesPerCig, 10) || 7),
      cur: currency
    };

    const finalName = userName.trim() || 'Мандрівник';
    localStorage.setItem('quit-smoking:user-name', finalName);
    localStorage.setItem('quit-smoking:onboarded', 'true');

    onComplete({
      userName: finalName,
      startDate: finalStart,
      money: moneySettings,
      mainReason,
      initialSurvey: {
        craving,
        mood: calmness,
        energy,
        anxiety: 11 - calmness,
        note: `Початковий стан при старті: ${mainReason}`
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. Верхній Стриманий Індикатор Прогресу */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {step === 1 && 'Привітання'}
              {step === 2 && 'Перші кроки'}
              {step === 3 && 'Розрахунок заощаджень'}
              {step === 4 && 'Опитування стану'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-6 bg-slate-800 dark:bg-zinc-200'
                    : s < step
                    ? 'w-2.5 bg-slate-400 dark:bg-zinc-600'
                    : 'w-1.5 bg-slate-200 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 2. ТІЛО ЕКРАНІВ */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          {/* STEP 1: ПРИВІТАННЯ */}
          {step === 1 && (
            <div className="space-y-4 py-2 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center text-slate-700 dark:text-zinc-200">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-wide text-slate-900 dark:text-zinc-100">
                    Ласкаво просимо до Freedom
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto mt-1">
                    Простір спокійної та усвідомленої відмови від куріння. Без тиску, без почуття провини — через розуміння фізіології та контроль.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2 text-xs">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block">
                  Як до вас звертатися?
                </label>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Наприклад: Андрій"
                    className="flex-1 text-xs font-medium p-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 outline-none focus:border-slate-400 dark:focus:border-zinc-500 transition-colors"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-tight">
                  Ваші дані зберігаються виключно локально у вашому браузері.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-2xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] shadow-xs"
              >
                <span>Дізнатися про перші кроки</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: ПЕРШІ КРОКИ */}
          {step === 2 && (
            <div className="space-y-3.5 py-1 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  Три опори вашої свободи
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Як цей додаток допоможе подолати залежність
                </p>
              </div>

              <div className="space-y-2">
                {/* Опора 1 */}
                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-zinc-800 flex items-center justify-center flex-none text-slate-700 dark:text-zinc-300">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-0.5">
                      1. Регенерація організму
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Пульс, кисень у крові, смакові рецептори та легені відновлюються вже з перших 20 хвилин після останньої сигарети.
                    </p>
                  </div>
                </div>

                {/* Опора 2 */}
                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-zinc-800 flex items-center justify-center flex-none text-slate-700 dark:text-zinc-300">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-0.5">
                      2. Медитативні простори замість тяги
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Фізіологічна хвиля потягу триває лише 90 секунд. Простори «Хвиля», «Орбіти» та «Кіматика» м'яко перемикають увагу.
                    </p>
                  </div>
                </div>

                {/* Опора 3 */}
                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-zinc-800 flex items-center justify-center flex-none text-slate-700 dark:text-zinc-300">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-0.5">
                      3. Фінансова та часова свобода
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Точний щосекундний облік заощаджених коштів і збережених годин вашого життя.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Налаштувати розрахунок</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ВНЕСЕННЯ ДАНИХ ДЛЯ РОЗРАХУНКУ ЗАОЩАДЖЕНЬ */}
          {step === 3 && (
            <div className="space-y-3.5 py-1 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  Параметри куріння
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Для точного підрахунку збережених грошей та часу
                </p>
              </div>

              {/* Поля вводу */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
                      Сигарет на день:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={perDay}
                      onChange={(e) => setPerDay(e.target.value)}
                      className="w-full text-center text-xs font-bold font-mono py-1.5 px-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-400"
                    />
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
                      Ціна пачки ({currency}):
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={packPrice}
                      onChange={(e) => setPackPrice(e.target.value)}
                      className="w-full text-center text-xs font-bold font-mono py-1.5 px-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                {/* Валюта та кількість у пачці */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                    {(['₴', '$', '€'] as const).map((cur) => (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => setCurrency(cur)}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          currency === cur
                            ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-xs'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300'
                        }`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 pr-1">
                    <span>У пачці:</span>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={packSize}
                      onChange={(e) => setPackSize(e.target.value)}
                      className="w-12 text-center text-xs font-bold font-mono py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Час останньої сигарети */}
                <div className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block">
                    Коли була остання сигарета?
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDateMode('now')}
                      className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                        dateMode === 'now'
                          ? 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-semibold shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      Прямо зараз
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateMode('custom')}
                      className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                        dateMode === 'custom'
                          ? 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-semibold shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      Раніше
                    </button>
                  </div>

                  {dateMode === 'custom' && (
                    <input
                      type="datetime-local"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full text-xs p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  )}
                </div>

                {/* Інтерактивний прев'ю-розрахунок */}
                <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700 text-center">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-400 block mb-0.5">
                    Очікувана економія за рік:
                  </span>
                  <div className="text-sm font-bold font-mono text-slate-800 dark:text-zinc-100">
                    ~{yearlySaved.toLocaleString()} {currency} • +{yearlyHoursSaved} годин життя
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Перейти до опитування</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ОПИТУВАННЯ СТАНУ ТА СТАРТ */}
          {step === 4 && (
            <form onSubmit={handleFinish} className="space-y-3.5 py-1 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  Початкова точка відліку
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Зафіксуйте свій стартовий стан для графіка динаміки
                </p>
              </div>

              {/* Повзунки стану */}
              <div className="space-y-2.5">
                {/* 1. Потяг до куріння */}
                <div className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      Рівень потягу:
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {craving} / 10 {craving <= 3 ? '• Штиль' : craving <= 6 ? '• Помірний' : '• Гострий'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={craving}
                    onChange={(e) => setCraving(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-zinc-300"
                  />
                </div>

                {/* 2. Рівень енергії */}
                <div className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      Фізична енергія:
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {energy} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-zinc-300"
                  />
                </div>

                {/* 3. Внутрішній спокій */}
                <div className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      Внутрішній спокій:
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {calmness} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={calmness}
                    onChange={(e) => setCalmness(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-slate-700 dark:accent-zinc-300"
                  />
                </div>

                {/* 4. Головна опора */}
                <div className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block">
                    Головний орієнтир:
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      'Дихати на повні груди',
                      'Здорове серце і судини',
                      'Фінансова незалежність',
                      'Чистий розум і гордість'
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMainReason(preset)}
                        className={`p-1.5 rounded-xl text-[10px] text-left transition-colors cursor-pointer border ${
                          mainReason === preset
                            ? 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-semibold border-transparent'
                            : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Розпочати шлях свободи</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
