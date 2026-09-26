import React, { useState } from 'react';
import { CheckSquare, Sparkles, X, Plus, Check, ListTodo, ShieldCheck, Clock } from 'lucide-react';
import { DailyMicroStep } from '../types';

interface DailyStepsPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSteps: (steps: DailyMicroStep[]) => void;
}

const PRESET_IDEAS = [
  '💧 Випити склянку холодної води з лимоном',
  '🧘 Зробити 5 хвилин дихальної релаксації',
  '🚶 Зробити прогулянку 15 хвилин на свіжому повітрі',
  '🍏 З\'їсти свіже яблуко чи горіхи при бажанні закурити',
  '☕ Заварити соковитий трав\'яний чай замість перекуру',
  '🏋️ Зробити 15 віджимань чи лёгку зарядку',
  '📖 Прочитати 5 сторінок натхненної книги',
  '🧘‍♂️ Написати 3 вдячності у щоденник'
];

const STEPS_STORAGE_KEY = 'quit-smoking:daily-micro-steps';
const SHOW_INDICATOR_KEY = 'quit-smoking:daily-steps-show-indicator';

export const DailyStepsPromptModal: React.FC<DailyStepsPromptModalProps> = ({
  isOpen,
  onClose,
  onSaveSteps
}) => {
  if (!isOpen) return null;

  const [selectedPresets, setSelectedPresets] = useState<string[]>([
    PRESET_IDEAS[0],
    PRESET_IDEAS[1],
    PRESET_IDEAS[3]
  ]);
  const [customSteps, setCustomSteps] = useState<string[]>([]);
  const [customInputText, setCustomInputText] = useState('');

  const togglePreset = (preset: string) => {
    setSelectedPresets((prev) =>
      prev.includes(preset) ? prev.filter((p) => p !== preset) : [...prev, preset]
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInputText.trim();
    if (!trimmed) return;
    setCustomSteps((prev) => [...prev, trimmed]);
    setCustomInputText('');
  };

  const handleRemoveCustom = (idx: number) => {
    setCustomSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const allTitles = [...selectedPresets, ...customSteps];
    if (allTitles.length === 0) {
      onClose();
      return;
    }

    const newSteps: DailyMicroStep[] = allTitles.map((title, index) => ({
      id: `step_${Date.now()}_${index}`,
      title,
      isCustom: true,
      createdAt: Date.now()
    }));

    try {
      localStorage.setItem(STEPS_STORAGE_KEY, JSON.stringify(newSteps));
      localStorage.setItem(SHOW_INDICATOR_KEY, 'true');
    } catch {}

    onSaveSteps(newSteps);
    onClose();
  };

  const totalCount = selectedPresets.length + customSteps.length;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-[#18181c] border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Background glow accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shadow-2xs">
              📋
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
                <span>Сплануйте справи на день</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Ви в додатку вже 5 хвилин • Створіть список дій
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="my-3 p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-2.5 text-xs relative z-10">
          <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-none mt-0.5" />
          <p className="text-teal-900 dark:text-teal-200 leading-relaxed text-[11px]">
            Маленькі щоденні кроки полегшують відмову від нікотину. Оберіть декілька готових ідей або додайте власні справи на сьогодні!
          </p>
        </div>

        {/* Presets and Custom Inputs Container */}
        <div className="flex-1 overflow-y-auto space-y-3.5 py-1 pr-1 relative z-10 no-scrollbar">
          
          {/* Preset Ideas Selection */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-2">
              Рекомендовані корисні звички:
            </label>

            <div className="space-y-1.5">
              {PRESET_IDEAS.map((preset) => {
                const isSelected = selectedPresets.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => togglePreset(preset)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-500/40 text-teal-950 dark:text-teal-100 font-medium'
                        : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="pr-2">{preset}</span>
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-none transition-colors ${
                        isSelected
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Task Input */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              Додати власну справу:
            </label>

            <form onSubmit={handleAddCustom} className="flex gap-2">
              <input
                type="text"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="Наприклад: Випити склянку чаю..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!customInputText.trim()}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Додати</span>
              </button>
            </form>

            {/* Added Custom Tasks List */}
            {customSteps.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {customSteps.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-900 dark:text-teal-200 flex items-center justify-between"
                  >
                    <span>✍️ {task}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustom(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800 flex flex-col gap-2 relative z-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={totalCount === 0}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Зберегти ({totalCount}) та активувати індикатор</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-[11px] font-medium text-center transition-colors cursor-pointer"
          >
            Заповнити пізніше
          </button>
        </div>

      </div>
    </div>
  );
};
