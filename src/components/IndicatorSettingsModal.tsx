import React from 'react';
import { X, Layout, Square, Maximize, CircleDot, Palette, Check } from 'lucide-react';

interface IndicatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayStyle: string;
  onSave: (style: string) => void;
}

export const IndicatorSettingsModal: React.FC<IndicatorSettingsModalProps> = ({
  isOpen,
  onClose,
  displayStyle,
  onSave,
}) => {
  if (!isOpen) return null;

  const styles = [
    { id: 'indicators', label: 'Індикатори', icon: CircleDot },
    { id: 'small-tiles', label: 'Маленькі плитки', icon: Square },
    { id: 'medium-tiles', label: 'Середні плитки', icon: Square },
    { id: 'large-tiles', label: 'Великі плитки', icon: Maximize },
    { id: 'carousel-manual', label: 'Сенсорний диск (ручний)', icon: Layout },
    { id: 'carousel-auto', label: 'Сенсорний диск (авто)', icon: Layout },
    { id: 'alternating', label: 'По одному (чергуються)', icon: Layout },
    { id: 'monochrome', label: 'Без кольорів (білі)', icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-[#151518] w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Вигляд індикаторів</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => onSave(s.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                displayStyle === s.id
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-zinc-900 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <s.icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{s.label}</span>
              {displayStyle === s.id && <Check className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


