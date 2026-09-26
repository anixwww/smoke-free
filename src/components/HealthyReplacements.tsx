import React, { useState, useRef } from 'react';
import { Sparkles, Play, RotateCcw, Clock, CheckCircle2, Trophy } from 'lucide-react';

interface ReplacementOption {
  id: number;
  title: string;
  emoji: string;
  description: string;
  actionText: string;
  color: string;
  bgGrad: string;
}

const REPLACEMENT_OPTIONS: ReplacementOption[] = [
  {
    id: 1,
    title: 'Енергетичний сплеск',
    emoji: '🏃',
    description: 'Зроби 10 швидких присідань або стрибків на місці.',
    actionText: 'Фізична активність спалює надлишок адреналіну в крові, викликаний стресом відвикання, та миттєво вивільняє здоровий дофамін.',
    color: '#ef4444',
    bgGrad: 'from-rose-500 to-red-600'
  },
  {
    id: 2,
    title: 'Рецепторний шок',
    emoji: '🍋',
    description: 'З\'їж часточку лимона, грейпфрута або кисле яблуко.',
    actionText: 'Інтенсивний кислий чи гострий смак діє як миттєвий тактильний перемикач для твого мозку, стираючи ментальний поклик до сигарети.',
    color: '#eab308',
    bgGrad: 'from-yellow-400 to-amber-500'
  },
  {
    id: 3,
    title: 'Сенсорний масаж',
    emoji: '💆',
    description: 'Розітри долоні до тепла та помасажуй мочки вух 1 хвилину.',
    actionText: 'Масаж біоактивних точок стимулює нервові закінчення, знімає спазм судин головного мозку та повертає відчуття контролю.',
    color: '#a855f7',
    bgGrad: 'from-purple-500 to-fuchsia-600'
  },
  {
    id: 4,
    emoji: '💧',
    title: 'Анти-нікотиновий ковток',
    description: 'Випий склянку холодної води максимально дрібними ковтками.',
    actionText: 'Дрібні ковтальні рухи стимулюють блукаючий нерв, який уповільнює пульс і вмикає парасимпатичний режим повного розслаблення.',
    color: '#0ea5e9',
    bgGrad: 'from-sky-500 to-blue-600'
  },
  {
    id: 5,
    emoji: '✍️',
    title: 'Креативний дудлінг',
    description: 'Візьми ручку та намалюй будь-яку абстрактну каракулю.',
    actionText: 'Це займає дрібну моторику рук і пальців, відтворюючи звичний моторний жест тримання сигарети, але спрямовує його в безпечне русло.',
    color: '#ec4899',
    bgGrad: 'from-pink-500 to-rose-600'
  },
  {
    id: 6,
    emoji: '🍊',
    title: 'Цитрусовий вдих',
    description: 'Почисти мандарин, апельсин або вдихни ефірну олію м\'яти.',
    actionText: 'Аромати цитрусових та м\'яти бадьорять дихальні центри, стимулюють виділення серотоніну та покращують вентиляцію легень.',
    color: '#f97316',
    bgGrad: 'from-orange-500 to-amber-600'
  },
  {
    id: 7,
    emoji: '🧹',
    title: 'Дзен-прибирання',
    description: 'Наведи ідеальний лад на столі або розклади речі по місцях.',
    actionText: 'Фізичне структурування хаосу навколо себе перемикає мозок з тривожного стану на впорядкований і заспокоює імпульсивність.',
    color: '#10b981',
    bgGrad: 'from-emerald-500 to-teal-600'
  },
  {
    id: 8,
    emoji: '💬',
    title: 'Окситоцинова СМС',
    description: 'Напиши близькій людині тепле повідомлення з компліментом.',
    actionText: 'Фокус на емпатії та висловленні підтримки активує вироблення гормону близькості окситоцину, що повністю нейтралізує почуття тривоги.',
    color: '#14b8a6',
    bgGrad: 'from-teal-500 to-emerald-600'
  }
];

export const HealthyReplacements: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedOption, setSelectedOption] = useState<ReplacementOption | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedOption(null);
    setIsCompleted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(null);

    // Random spin from 3 to 6 full rotations + random offset
    const targetIdx = Math.floor(Math.random() * REPLACEMENT_OPTIONS.length);
    const degreePerSegment = 360 / REPLACEMENT_OPTIONS.length;
    
    // Calculate rotation so the selected segment stops at the top indicator (270 degrees offset or relative translation)
    // Wheel segment indices go clockwise
    const stopAngle = 360 - (targetIdx * degreePerSegment) + 1440; // 4 full rotations
    
    setRotation((prev) => prev + stopAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedOption(REPLACEMENT_OPTIONS[targetIdx]);
    }, 2800); // Animation duration
  };

  const startTaskTimer = () => {
    setIsCompleted(false);
    setCountdown(60);

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsCompleted(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/30 border border-slate-200/80 dark:border-zinc-800/80 rounded-[2rem] p-5 shadow-xs relative overflow-hidden transition-all text-left">
      {/* Background radial soft light */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-lg shadow-sm">
          🎡
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-none">
            Колесо здорових замінників
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight">
            Отримайте 1-хвилинне корисне завдання замість сигарети
          </p>
        </div>
      </div>

      {/* Interactive Layout: Split on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        {/* Left Side: Spinning Wheel Graphics */}
        <div className="relative flex-none flex flex-col items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute top-0 z-20 -mt-1 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-rose-500 filter drop-shadow-xs animate-bounce" />

          {/* Wheel Frame */}
          <div className="w-44 h-44 rounded-full p-1.5 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-zinc-800 dark:to-zinc-900 shadow-lg border border-slate-300/40 dark:border-zinc-800 flex items-center justify-center relative">
            {/* Spinning Canvas Circle Container */}
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 2.8s cubic-bezier(0.2, 0.8, 0.1, 1)' : 'none',
              }}
              className="w-full h-full rounded-full overflow-hidden relative border border-slate-300 dark:border-zinc-800"
            >
              {/* Pie segments created using SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full select-none transform rotate-[22.5deg]">
                {REPLACEMENT_OPTIONS.map((opt, idx) => {
                  const angle = 45; // 360 / 8 segments
                  const startAngle = idx * angle;
                  // SVG arc path formulas for 45-degree segment slices
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * (startAngle + angle)) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * (startAngle + angle)) / 180);

                  return (
                    <path
                      key={opt.id}
                      d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`}
                      fill={idx % 2 === 0 ? 'rgba(20, 184, 166, 0.1)' : 'rgba(245, 158, 11, 0.1)'}
                      stroke="currentColor"
                      strokeWidth="0.3"
                      className="text-slate-300/50 dark:text-zinc-800"
                    />
                  );
                })}
              </svg>

              {/* Text/Emoji Placed circularly on segments */}
              {REPLACEMENT_OPTIONS.map((opt, idx) => {
                const angle = 45;
                const midAngle = idx * angle + angle / 2;
                // Calculate position for emoji
                const r = 32; // Distance from center
                const x = 50 + r * Math.cos((Math.PI * midAngle) / 180);
                const y = 50 + r * Math.sin((Math.PI * midAngle) / 180);

                return (
                  <div
                    key={opt.id}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute text-sm select-none"
                    title={opt.title}
                  >
                    {opt.emoji}
                  </div>
                );
              })}
            </div>

            {/* Central Spinner Button Hub */}
            <button
              type="button"
              onClick={spinWheel}
              disabled={isSpinning}
              className={`absolute w-12 h-12 rounded-full border-2 border-white dark:border-zinc-800 shadow-md flex flex-col items-center justify-center cursor-pointer transition-transform duration-150 active:scale-90 ${
                isSpinning
                  ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400'
                  : 'bg-rose-500 hover:bg-rose-600 text-white hover:scale-105'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                {isSpinning ? '🌀' : 'Крути'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Side: Displaying current task / reward status */}
        <div className="flex-1 w-full min-h-[140px] flex flex-col justify-between">
          {isSpinning ? (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full border-3 border-rose-500 border-t-transparent animate-spin" />
              <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                Колесо обертається... Шукаємо ідеальну заміну!
              </p>
            </div>
          ) : selectedOption ? (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex items-start gap-3">
                <span className="text-3xl filter drop-shadow-xs">{selectedOption.emoji}</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wide">
                    {selectedOption.title}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 mt-0.5">
                    {selectedOption.description}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-relaxed font-semibold bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-2xl border border-slate-100 dark:border-zinc-850">
                💡 <span className="text-slate-800 dark:text-zinc-300 font-extrabold">Чому це працює: </span>
                {selectedOption.actionText}
              </p>

              {/* Action Buttons & Timer */}
              <div className="flex items-center gap-3">
                {countdown !== null ? (
                  <div className="flex-1 py-2 px-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl flex items-center justify-between font-mono text-xs font-black">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Виконуй завдання:</span>
                    </span>
                    <span>{countdown} сек</span>
                  </div>
                ) : isCompleted ? (
                  <div className="flex-1 py-2.5 px-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold animate-pulse">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                    <span>Чудово! Сигнал тяги успішно нейтралізовано! 🎉</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startTaskTimer}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm hover:from-emerald-700 hover:to-teal-750 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Почати 1-хвилинний виклик</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={spinWheel}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 cursor-pointer transition-colors"
                  title="Крутити знову"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-3">
              <span className="text-3xl animate-bounce">🎯</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Готові замінити звичку?
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 max-w-[240px] mx-auto">
                  Натисніть кнопку «Крути» в центрі колеса, щоб отримати миттєве заспокійливе завдання.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
