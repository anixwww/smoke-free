import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Quote,
  RotateCw,
  Sparkles
} from 'lucide-react';

export type MotivationStyle = 'quote' | 'card' | 'neon' | 'kraft' | 'ticker';

interface MotivationalPhrasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasons: string[];
  onSaveReasons: (newReasons: string[]) => void;
  currentStyle?: MotivationStyle;
  onStyleChange?: (style: MotivationStyle) => void;
  autoRotate?: boolean;
  onAutoRotateChange?: (autoRotate: boolean) => void;
  accent?: string;
}

export const MotivationalPhrasesModal: React.FC<MotivationalPhrasesModalProps> = ({
  isOpen,
  onClose,
  reasons,
  onSaveReasons,
  autoRotate = true,
  onAutoRotateChange
}) => {
  const [phrases, setPhrases] = useState<string[]>(reasons);
  const [newPhraseText, setNewPhraseText] = useState<string>('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // Sync state when modal opens or reasons prop changes
  useEffect(() => {
    if (isOpen) {
      setPhrases(reasons);
      setEditingIdx(null);
      setNewPhraseText('');
    }
  }, [isOpen, reasons]);

  if (!isOpen) return null;

  // Add Phrase
  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPhraseText.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...phrases];
    setPhrases(updated);
    onSaveReasons(updated);
    try {
      localStorage.setItem('quit-smoking:reasons', JSON.stringify(updated));
    } catch {}
    setNewPhraseText('');
  };

  // Delete Phrase
  const handleDeletePhrase = (indexToDelete: number) => {
    const updated = phrases.filter((_, idx) => idx !== indexToDelete);
    setPhrases(updated);
    onSaveReasons(updated);
    try {
      localStorage.setItem('quit-smoking:reasons', JSON.stringify(updated));
    } catch {}
    if (editingIdx === indexToDelete) {
      setEditingIdx(null);
    }
  };

  // Save Phrase Edit
  const handleSaveEdit = (indexToEdit: number) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;

    const updated = phrases.map((text, idx) => (idx === indexToEdit ? trimmed : text));
    setPhrases(updated);
    onSaveReasons(updated);
    try {
      localStorage.setItem('quit-smoking:reasons', JSON.stringify(updated));
    } catch {}
    setEditingIdx(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* 1. Верхня панель */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-zinc-100">
              Мотиваційні цитати
            </h3>
            <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">
              ({phrases.length})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Закрити"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Швидке додавання нової цитати */}
        <form onSubmit={handleAddPhrase} className="mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPhraseText}
              onChange={(e) => setNewPhraseText(e.target.value)}
              placeholder="Введіть власну мотиваційну фразу..."
              className="flex-1 text-xs p-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-slate-800 dark:text-zinc-200 outline-none focus:border-slate-400 dark:focus:border-zinc-500 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newPhraseText.trim()}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white disabled:opacity-40 text-white dark:text-zinc-900 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 flex-none shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Додати</span>
            </button>
          </div>
        </form>

        {/* 3. Список доданих цитат */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
          {phrases.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
              <Sparkles className="w-6 h-6 text-amber-500/70 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Список цитат порожній
              </p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Напишіть слова або причини, які надихають саме вас залишатися вільними від паління.
              </p>
            </div>
          ) : (
            phrases.map((phrase, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex items-start justify-between gap-3 group transition-all"
              >
                {editingIdx === idx ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 text-xs p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-600 rounded-xl text-slate-900 dark:text-zinc-100 outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(idx)}
                      className="p-2 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold cursor-pointer shrink-0"
                      title="Зберегти"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 leading-relaxed italic flex-1">
                      «{phrase}»
                    </p>

                    <div className="flex items-center gap-1 flex-none opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIdx(idx);
                          setEditingText(phrase);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        title="Редагувати"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhrase(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Видалити"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* 4. Нижня панель налаштування авто-зміни */}
        {onAutoRotateChange && (
          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Авто-зміна цитати на екрані:</span>
            </span>
            <button
              type="button"
              onClick={() => onAutoRotateChange(!autoRotate)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                autoRotate ? 'bg-slate-800 dark:bg-zinc-200' : 'bg-slate-200 dark:bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white dark:bg-zinc-900 transition-transform ${
                  autoRotate ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
