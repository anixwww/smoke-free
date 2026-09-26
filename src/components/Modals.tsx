import React from 'react';
import { Calendar, AlertTriangle, X, Clock } from 'lucide-react';

interface SetupModalProps {
  initialDateMs: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dateMs: number) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  initialDateMs,
  isOpen,
  onClose,
  onSave
}) => {
  const toLocalInput = (ms: number) => {
    const d = new Date(ms);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [dateStr, setDateStr] = React.useState(toLocalInput(initialDateMs));
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setDateStr(toLocalInput(initialDateMs));
    setError('');
  }, [initialDateMs, isOpen]);

  if (!isOpen) return null;

  const handleSetNow = () => {
    setDateStr(toLocalInput(Date.now()));
    setError('');
  };

  const handleSave = () => {
    if (!dateStr) {
      setError('Оберіть дату й час.');
      return;
    }
    const ms = new Date(dateStr).getTime();
    if (!isFinite(ms)) {
      setError('Некоректний формат дати.');
      return;
    }
    if (ms > Date.now() + 60000) {
      setError('Дата не може бути в майбутньому.');
      return;
    }
    onSave(ms);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Час останньої сигарети
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3.5 leading-relaxed">
          Від цієї миті розраховується точний час регенерації органів, врятовані гроші та зернятка дерев.
        </p>

        <div className="mb-4">
          <input
            type="datetime-local"
            value={dateStr}
            max={toLocalInput(Date.now())}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-400"
          />
          {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSetNow}
            className="py-2 px-3 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            Прямо зараз
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
};

interface RelapseModalProps {
  isOpen: boolean;
  currentStart: number;
  onClose: () => void;
  onConfirmRelapse: (whenMs: number, note: string) => void;
}

export const RelapseModal: React.FC<RelapseModalProps> = ({
  isOpen,
  currentStart,
  onClose,
  onConfirmRelapse
}) => {
  const toLocalInput = (ms: number) => {
    const d = new Date(ms);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [whenStr, setWhenStr] = React.useState(toLocalInput(Date.now()));
  const [note, setNote] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setWhenStr(toLocalInput(Date.now()));
    setNote('');
    setError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!whenStr) {
      setError('Вкажіть час.');
      return;
    }
    const whenMs = new Date(whenStr).getTime();
    if (!isFinite(whenMs)) {
      setError('Некоректний формат часу.');
      return;
    }
    if (whenMs < currentStart) {
      setError('Час зриву не може бути раніше, ніж поточний старт.');
      return;
    }
    if (whenMs > Date.now() + 60000) {
      setError('Час не може бути в майбутньому.');
      return;
    }

    onConfirmRelapse(whenMs, note.trim() || 'Зрив. Досвід враховано, продовжую шлях.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Фіксація зриву
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3 leading-relaxed">
          Це не поразка, а досвід. Ваш попередній період чистих днів збережеться в загальній історії, а таймер перезапуститься.
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-300 block mb-1">
              Коли це сталося:
            </label>
            <input
              type="datetime-local"
              value={whenStr}
              max={toLocalInput(Date.now())}
              onChange={(e) => setWhenStr(e.target.value)}
              className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-300 block mb-1">
              Що спровокувало (нотатка для аналізу):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Наприклад: Стрес на роботі, алкоголь у компанії..."
              rows={2}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-400 resize-none"
            />
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
          >
            Почати заново
          </button>
        </div>
      </div>
    </div>
  );
};
