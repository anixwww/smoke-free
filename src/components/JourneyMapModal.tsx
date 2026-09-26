import React from 'react';
import { X, Check, Clock, Lock } from 'lucide-react';

export interface TimeAchievement {
  id: string;
  hours: number;
  title: string;
  fact: string;
}

interface JourneyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: TimeAchievement[];
  totalHours: number;
}

export const JourneyMapModal: React.FC<JourneyMapModalProps> = ({
  isOpen,
  onClose,
  achievements,
  totalHours
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => totalHours >= a.hours).length;
  const totalCount = achievements.length;
  const progressPercent = Math.min(100, Math.round((unlockedCount / totalCount) * 100));

  const daysPassed = Math.floor(totalHours / 24);
  const remainingHours = Math.floor(totalHours % 24);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      <div className="bg-[#18181c] border border-zinc-800 rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 tracking-tight">
                Часові досягнення
              </h2>
              <p className="text-[11px] text-zinc-400">
                Фактичні рубежі очищення та оновлення організму
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Закрити"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress summary banner */}
        <div className="my-3 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-200">
              Прогрес досягнень
            </span>
            <span className="font-mono text-[11px] font-bold text-emerald-400">
              {unlockedCount} з {totalCount} ({progressPercent}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10.5px] text-zinc-400 font-medium pt-0.5">
            <span>
              Час без тютюну: <strong className="text-zinc-200 font-mono">{daysPassed > 0 ? `${daysPassed} дн ${remainingHours} год` : `${Math.floor(totalHours)} год`}</strong>
            </span>
            <span>
              {unlockedCount === totalCount ? 'Всі рубежі пройдено' : `Залишилось: ${totalCount - unlockedCount}`}
            </span>
          </div>
        </div>

        {/* Checkpoints List */}
        <div className="flex-1 overflow-y-auto py-1 space-y-2 pr-1 no-scrollbar">
          {achievements.map((ach) => {
            const unlocked = totalHours >= ach.hours;
            const isCurrent = !unlocked && achievements.find((a) => totalHours < a.hours)?.id === ach.id;
            
            // Progress toward this target
            const currentPct = isCurrent ? Math.min(100, Math.floor((totalHours / ach.hours) * 100)) : 0;
            const hoursRemaining = Math.max(0, ach.hours - totalHours);
            const daysRemaining = Math.ceil(hoursRemaining / 24);

            return (
              <div
                key={ach.id}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                  unlocked
                    ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-200'
                    : isCurrent
                    ? 'bg-zinc-900 border-emerald-500/50 text-zinc-100 ring-1 ring-emerald-500/30 shadow-xs'
                    : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-500 opacity-70'
                }`}
              >
                {/* Status indicator icon */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    unlocked
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      : isCurrent
                      ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono text-[10px]'
                      : 'bg-zinc-800/50 border border-zinc-800 text-zinc-600'
                  }`}
                >
                  {unlocked ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : isCurrent ? (
                    `${currentPct}%`
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-xs font-bold ${unlocked ? 'text-zinc-200' : isCurrent ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {ach.title}
                    </h3>

                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md shrink-0 ${
                        unlocked
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : isCurrent
                          ? 'bg-emerald-500/15 text-emerald-300 font-bold'
                          : 'bg-zinc-800/60 text-zinc-500'
                      }`}
                    >
                      {unlocked
                        ? 'Досягнуто'
                        : isCurrent
                        ? `${currentPct}% (ще ${hoursRemaining < 24 ? `${Math.ceil(hoursRemaining)}г` : `${daysRemaining}дн`})`
                        : `${ach.hours < 24 ? `${ach.hours} год` : `${Math.round(ach.hours / 24)} дн`}`}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                    {ach.fact}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2.5 mt-2 border-t border-zinc-800/80 text-center text-[10.5px] text-zinc-500">
          Кожен рубіж підтверджено клінічними дослідженнями регенерації організму
        </div>

      </div>
    </div>
  );
};
