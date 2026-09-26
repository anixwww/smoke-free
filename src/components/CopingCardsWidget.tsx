import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Check, Bookmark, Heart, ShieldAlert } from 'lucide-react';

interface CopingCard {
  id: number;
  emoji: string;
  title: string;
  text: string;
  accentColor: string;
  scienceFact: string;
}

const COPING_CARDS: CopingCard[] = [
  {
    id: 1,
    emoji: '⚡',
    title: 'Правило 3-х хвилин',
    text: 'Гостре бажання закурити — це не постійне почуття, а лише короткий хімічний сплеск. Він досягає піку за 3 хвилини й повністю згасає за 5-10 хвилин, якщо не піддатися паніці.',
    accentColor: 'from-amber-500 to-orange-600',
    scienceFact: 'Дослідження доводять: якщо відволікти мозок у перші 180 секунд, тяга відступає на 85%.'
  },
  {
    id: 2,
    emoji: '🌬️',
    title: 'Кисневий детокс',
    text: 'Твоєму мозку бракувало не нікотину, а саме глибокого дихання! Під час куріння ти робив глибокі затяжки, які розслабляли діафрагму. Зроби 3 повільні глибокі вдихи без отруйного диму.',
    accentColor: 'from-sky-500 to-indigo-600',
    scienceFact: 'Глибоке діафрагмальне дихання насичує кров киснем та знижує пульс, зупиняючи викид адреналіну.'
  },
  {
    id: 3,
    emoji: '🧠',
    title: 'Дофамінова пастка',
    text: 'Твій мозок намагається обдурити тебе, кажучи: "сигарета заспокоїть". Насправді нікотин спочатку створює мікро-тривогу через синдром відміни, а потім знімає її. Сигарета лікує ту тривогу, яку сама ж і викликала!',
    accentColor: 'from-rose-500 to-pink-600',
    scienceFact: 'Коли ти терпиш тягу, твої дофамінові рецептори повертаються до природного здорового стану.'
  },
  {
    id: 4,
    emoji: '🩸',
    title: 'Очищення чадного газу',
    text: 'Уже через 12 годин без сигарет рівень чадного газу (CO) у твоїй крові падає до абсолютної норми здорової людини. Твоє серце нарешті отримує чисту, багату на кисень кров.',
    accentColor: 'from-emerald-500 to-teal-600',
    scienceFact: 'Зниження рівня CO миттєво знижує навантаження на серцевий м\'яз і судини.'
  },
  {
    id: 5,
    emoji: '💧',
    title: 'Заміна ритуалу блукаючого нерва',
    text: 'Коли відчуваєш сильний позив, випий склянку холодної води повільними, дрібними ковтками. Ковтальний рефлекс у поєднанні з прохолодою подразнює блукаючий нерв і миттєво перебиває домінантний нікотиновий сигнал у мозку.',
    accentColor: 'from-blue-500 to-cyan-600',
    scienceFact: 'Блукаючий нерв активує парасимпатичну систему, яка миттєво вмикає режим біологічного релаксу.'
  },
  {
    id: 6,
    emoji: '💸',
    title: 'Твоя фінансова свобода',
    text: 'Кожна некуплена пачка — це не просто збережені гроші, а твій особистий бойкот тютюновим корпораціям. Ти більше не платиш мільярди за руйнування власного здоров\'я.',
    accentColor: 'from-amber-600 to-yellow-600',
    scienceFact: 'Людина, що кинула курити, заощаджує в середньому від 24 000 до 35 000 ₴ на рік.'
  },
  {
    id: 7,
    emoji: '🛡️',
    title: 'Пробудження війкових клітин',
    text: 'Твої легені прямо зараз проводять генеральне прибирання! Легеневі війки, які раніше були паралізовані гарячими смолами, прокинулися і вимітають накопичений бруд. Можливе легке першіння — це ознака одужання.',
    accentColor: 'from-purple-500 to-fuchsia-600',
    scienceFact: 'Війковий епітелій повністю відновлює свою очисну функцію вже за перші 2-3 тижні свободи.'
  },
  {
    id: 8,
    emoji: '⏳',
    title: 'Кожна відмова — це перемога',
    text: 'Щоразу, коли ти кажеш "Ні" сигареті під час гострої тяги, ти буквально руйнуєш старі нікотинові нейронні шляхи та будуєш нові, здорові зв\'язки. Кожна перемога робить наступну тягу вдвічі слабшою.',
    accentColor: 'from-orange-500 to-rose-600',
    scienceFact: 'Мозок повністю перебудовує свою нейронну карту та стирає нікотиновий автоматизм за 21-60 днів.'
  }
];

export const CopingCardsWidget: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedCount, setSwipedCount] = useState<number>(0);
  const [showFact, setShowFact] = useState(false);
  const [savedCards, setSavedCards] = useState<number[]>([]);

  const activeCard = COPING_CARDS[currentIndex];

  const handleNext = () => {
    setShowFact(false);
    setCurrentIndex((prev) => (prev + 1) % COPING_CARDS.length);
    setSwipedCount((prev) => prev + 1);
  };

  const handlePrev = () => {
    setShowFact(false);
    setCurrentIndex((prev) => (prev - 1 + COPING_CARDS.length) % COPING_CARDS.length);
  };

  const toggleSaveCard = (id: number) => {
    setSavedCards((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSwipedCount(0);
    setShowFact(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/30 border border-slate-200/80 dark:border-zinc-800/80 rounded-[2rem] p-5 shadow-xs overflow-hidden relative transition-all">
      {/* Background decoration elements */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-lg shadow-sm">
            🃏
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-none">
              Когнітивні картки
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Гортайте картки при гострому бажанні закурити
            </p>
          </div>
        </div>

        <span className="text-[10px] bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold font-mono">
          {currentIndex + 1} / {COPING_CARDS.length}
        </span>
      </div>

      {/* Swipable Tinder Card Display */}
      <div className="relative w-full min-h-[220px] rounded-2xl overflow-hidden shadow-md bg-gradient-to-tr from-slate-50 to-white dark:from-zinc-900/40 dark:to-zinc-900/90 border border-slate-100 dark:border-zinc-800 p-5 flex flex-col justify-between transition-all duration-300">
        {/* Glow behind index */}
        <div className={`absolute inset-0 bg-gradient-to-br ${activeCard.accentColor} opacity-5 dark:opacity-10 pointer-events-none transition-all duration-300`} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeCard.emoji}</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                {activeCard.title}
              </h4>
            </div>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={() => toggleSaveCard(activeCard.id)}
              className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-zinc-800 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
              title="Зберегти картку в улюблене"
            >
              <Heart
                className={`w-4 h-4 ${
                  savedCards.includes(activeCard.id)
                    ? 'fill-rose-500 stroke-rose-500'
                    : 'text-slate-400 dark:text-zinc-500'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
            {activeCard.text}
          </p>
        </div>

        {/* Science fact drawer */}
        <div className="mt-4 relative z-10">
          {showFact ? (
            <div className="p-2.5 rounded-xl bg-teal-500/10 dark:bg-teal-950/20 border border-teal-500/20 text-[10px] leading-relaxed text-teal-900 dark:text-teal-200 font-semibold flex items-start gap-1.5 animate-fadeIn">
              <span className="text-xs">🧬</span>
              <div>
                <span className="text-teal-700 dark:text-teal-400 block font-bold mb-0.5 uppercase tracking-wide text-[9px]">
                  Науковий факт:
                </span>
                {activeCard.scienceFact}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowFact(true)}
              className="w-full py-1.5 text-center text-[10px] text-teal-600 dark:text-teal-400 hover:text-teal-700 font-bold bg-teal-500/5 hover:bg-teal-500/10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-teal-500/10"
            >
              <Sparkles className="w-3 h-3" />
              <span>Дізнатись науковий факт</span>
            </button>
          )}
        </div>
      </div>

      {/* Swipe Actions Controller Buttons */}
      <div className="flex items-center justify-between gap-3 mt-4 relative z-10">
        <button
          type="button"
          onClick={handlePrev}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer transition-colors"
          title="Попередня"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
        >
          <span>Наступна порада</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {swipedCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/40 text-slate-500 transition-colors cursor-pointer"
            title="Скинути відлік спочатку"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
