import React, { useState, useEffect } from 'react';
import { MoneySettings, TreeState, GoalsState, DragonState, ZenIslandState, OrbitVoyageState, DayRating, Streak } from '../types';
import { TREE_SPECIES, getTreeStageInfo } from '../data/treeSpecies';
import { getTodayHealthFact, HEALTH_MILESTONES, getBodySystemsRecovery } from '../data/healthData';
import { LEVEL_CONFIG, getLevelCounts } from '../data/sandConfig';
import { DRAGON_UNLOCK_CIGS, getDragonStage, getDragonLevelTitle, calculateCombatPower } from '../data/dragonData';
import {
  User,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Trees,
  ArrowRight,
  Target,
  Check,
  Lock,
  TrendingUp,
  Clock,
  BookOpen,
  Dumbbell,
  Footprints,
  CheckSquare,
  CheckCircle2,
  Brain,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Gift,
  Minimize2,
  Maximize2
} from 'lucide-react';

import { IndicatorSettingsModal } from './IndicatorSettingsModal';
import { JourneyMapModal } from './JourneyMapModal';
import { TriggerActionPlans } from './TriggerActionPlans';
import { HydrationCard } from './HydrationCard';
import { DailyStepsSection } from './DailyStepsSection';
import { DailyStepsPromptModal } from './DailyStepsPromptModal';
import { MentalHealthCard } from './MentalHealthCard';
import { GratitudeJournalCard } from './GratitudeJournalCard';
import { HealthRecoveryWidget } from './HealthRecoveryWidget';
import { MotivationalPhrasesModal, MotivationStyle } from './MotivationalPhrasesModal';
import { SavedResourcesSettingsModal } from './SavedResourcesSettingsModal';
import { GoalSettingsModal } from './GoalSettingsModal';
import { QuickGoalCard } from './QuickGoalCard';
import { 
  X, 
  Bookmark, 
  Pin, 
  Edit3, 
  ChevronLeft, 
  ChevronRight as ChevronRightIcon,
  Coins,
  Hourglass,
  ShieldCheck,
  SlidersHorizontal,
  Settings,
  Zap,
  Sparkle
} from 'lucide-react';

export interface TimeAchievement {
  id: string;
  hours: number;
  title: string;
  fact: string;
}

export const TIME_ACHIEVEMENTS: TimeAchievement[] = [
  { id: 't_1h', hours: 1, title: '1 година', fact: 'Пульс і артеріальний тиск повертаються до нормальних значень' },
  { id: 't_2h', hours: 2, title: '2 години', fact: 'Зниження концентрації нікотину в крові' },
  { id: 't_4h', hours: 4, title: '4 години', fact: 'Початок відновлення рівня кисню в тканинах' },
  { id: 't_8h', hours: 8, title: '8 годин', fact: 'Рівень чадного газу в крові падає на 50%' },
  { id: 't_12h', hours: 12, title: '12 годин', fact: 'Рівень чадного газу в крові повністю в нормі' },
  { id: 't_24h', hours: 24, title: '24 години', fact: 'Ризик серцевого нападу починає знижуватися' },
  { id: 't_48h', hours: 48, title: '48 годин', fact: 'Нікотин виведено з тіла, загострення смаку й нюху' },
  { id: 't_72h', hours: 72, title: '3 дні', fact: 'Пік фізичної ломки позаду, бронхи розслабляються' },
  { id: 't_5d', hours: 120, title: '5 днів', fact: 'Дихання стає легшим, рівень енергії зростає' },
  { id: 't_7d', hours: 168, title: '1 тиждень', fact: 'Критичний фізіологічний бар’єр подолано' },
  { id: 't_10d', hours: 240, title: '10 днів', fact: 'Зниження внутрішнього запалення слизових' },
  { id: 't_14d', hours: 336, title: '2 тижні', fact: 'Поліпшення кровообігу та загальної витривалості' },
  { id: 't_21d', hours: 504, title: '3 тижні', fact: 'Формування стійкої звички жити без тютюну' },
  { id: 't_30d', hours: 720, title: '1 місяць', fact: 'Зменшення задишки, відновлення роботи легень' },
  { id: 't_60d', hours: 1440, title: '2 місяці', fact: 'Покращення функції легень на 15–20%' },
  { id: 't_90d', hours: 2160, title: '3 місяці', fact: 'Значне відновлення серцево-судинної системи' },
  { id: 't_180d', hours: 4380, title: '6 місяців', fact: 'Зникнення хронічного ранкового кашлю' },
  { id: 't_1y', hours: 8760, title: '1 рік', fact: 'Ризик ішемічної хвороби серця зменшено вдвічі' },
  { id: 't_2y', hours: 17520, title: '2 роки', fact: 'Ризик інсульту знизився до показників некурця' },
  { id: 't_3y', hours: 26280, title: '3 роки', fact: 'Ризик серцевого нападу на рівні некурця' },
  { id: 't_5y', hours: 43800, title: '5 років', fact: 'Ризик багатьох видів раку скоротився на 50%' },
  { id: 't_10y', hours: 87600, title: '10 років', fact: 'Ризик смерті від раку легень на рівні некурця' },
];

interface CounterTabProps {
  diffMs: number;
  startDate: number;
  money: MoneySettings | null;
  totalSaved: number;
  cigsAvoided: number;
  treeState: TreeState;
  dragonState?: DragonState;
  zenState?: ZenIslandState;
  orbitState?: OrbitVoyageState;
  daysCount: number;
  reasons: string[];
  streaks?: Streak[];
  longestStreakMs?: number;
  goals?: GoalsState;
  activeGoalName?: string;
  activeGoalPct?: number;
  onOpenSos: () => void;
  onOpenSetup?: () => void;
  onOpenRelapse?: () => void;
  onUndoLastRelapse?: () => void;
  onSwitchTab: (tab: any) => void;
  onAddGoal?: (name: string, amount?: number, targetDate?: string) => void;
  onCompleteGoal?: (goalId: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  dayRatings: Record<string, DayRating>;
  accent?: string;
  onUpdateReasons?: (reasons: string[]) => void;
  onUpdateMoney?: (money: MoneySettings) => void;
}

export type TimerStyleType = 
  | 'zen-breathe' 
  | 'aurora' 
  | 'kyoto' 
  | 'moonlight' 
  | 'sandglass' 
  | 'harmonic'
  | 'nixie' 
  | 'matrix' 
  | 'handwritten' 
  | 'digital' 
  | 'minimal' 
  | 'threed'
  | 'neon'
  | 'leather-gold'
  | 'obsidian-glow'
  | 'parchment'
  | 'nordic-frost';

interface TimerStyleDefinition {
  id: TimerStyleType;
  name: string;
  tag: string;
  icon: string;
  category: 'meditative' | 'classic';
  desc: string;
  preview: string;
}

const TIMER_STYLES: TimerStyleDefinition[] = [
  {
    id: 'zen-breathe',
    name: 'Дихання дзен',
    tag: '5.5с когерентність',
    icon: '🧘‍♂️',
    category: 'meditative',
    desc: 'М\'який ритм 5.5с (когерентне дихання) — синхронізує пульс, заспокоює нервову систему та знімає тягу до паління',
    preview: '10 днів 12 год'
  },
  {
    id: 'aurora',
    name: 'Північне сяйво',
    tag: 'Шовковий спектр',
    icon: '🌌',
    category: 'meditative',
    desc: 'Плавні шовкові переливи смарагдового, бірюзового та фіалкового світла, що заспокоюють думки',
    preview: '10 днів 12 год'
  },
  {
    id: 'kyoto',
    name: 'Сад каменів Кіото',
    tag: 'Wabi-Sabi спокій',
    icon: '🎋',
    category: 'meditative',
    desc: 'Японська естетика внутрішньої тиші, фактура теплого річкового каменю та благородна рівновага',
    preview: '10 днів 12 год'
  },
  {
    id: 'moonlight',
    name: 'Місячне сяйво',
    tag: 'Срібний ореол',
    icon: '🌙',
    category: 'meditative',
    desc: 'Перламутрове сріблясто-синє світло нічного спокою, захищеності та повного відновлення легень',
    preview: '10 днів 12 год'
  },
  {
    id: 'sandglass',
    name: 'Золотий пісок часу',
    tag: 'Ефірний час',
    icon: '⏳',
    category: 'meditative',
    desc: 'М\'яке сяйво бурштину та зоряні піщинки кожної секунди твого поверненого життя',
    preview: '10 днів 12 год'
  },
  {
    id: 'leather-gold',
    name: 'Шкіра та золото',
    tag: 'Люкс текстура',
    icon: '💼',
    category: 'meditative',
    desc: 'Преміальна текстура темної шкіри з тонкими прошитими золотими нитками та благородним золотим шрифтом',
    preview: '10 днів 12 год'
  },
  {
    id: 'obsidian-glow',
    name: 'Чорний обсидіан',
    tag: 'Кристалічний вогонь',
    icon: '🌋',
    category: 'meditative',
    desc: 'Матовий темний обсидіан з пульсуючим неоново-фіолетовим кристалічним світлом у розломі каменю',
    preview: '10 днів 12 год'
  },
  {
    id: 'nordic-frost',
    name: 'Північний лід',
    tag: 'Морозна свіжість',
    icon: '❄️',
    category: 'meditative',
    desc: 'Напівпрозоре матове скло льодовика, вкрите морозними візерунками та крижаними білими іскрами',
    preview: '10 днів 12 год'
  },
  {
    id: 'harmonic',
    name: 'Дзен-Гармонія',
    tag: 'Картки балансу',
    icon: '🏛️',
    category: 'meditative',
    desc: 'Архітектурний порядок: дні, години та хвилини у гармонійних відокремлених блоках спокою',
    preview: '10 д · 12 г · 40 х'
  },
  {
    id: 'nixie',
    name: 'Вінтажна лампа',
    tag: 'Газорозрядна лампа',
    icon: '🔥',
    category: 'classic',
    desc: 'Теплий ламповий вогонь ІН-14, душевний затишок та символ незламної волі',
    preview: '10 днів 12 год'
  },
  {
    id: 'handwritten',
    name: 'Щоденник душі',
    tag: 'Жива каліграфія',
    icon: '✍️',
    category: 'classic',
    desc: 'Живий авторський почерк у теплому блокноті твоїх щоденних перемог',
    preview: '10 днів 12 год'
  },
  {
    id: 'parchment',
    name: 'Древній пергамент',
    tag: 'Ретро-сувій',
    icon: '📜',
    category: 'classic',
    desc: 'Естетика старовинного пожовклого сувою, м’яка текстура волокон та каліграфічне тушеве чорнило',
    preview: '10 днів 12 год'
  },
  {
    id: 'threed',
    name: 'Кристал 3D',
    tag: 'Об\'ємний рельєф',
    icon: '🧊',
    category: 'classic',
    desc: 'Кришталеві грані з інтерактивним відблиском та мерехтінням при дотику',
    preview: '10 днів 12 год'
  },
  {
    id: 'minimal',
    name: 'Чистий мінімал',
    tag: 'Шлях простоти',
    icon: '🕒',
    category: 'classic',
    desc: 'Лаконічна моноширинна типографіка високої чіткості, повна концентрація на головному',
    preview: '10 днів 12 год'
  },
  {
    id: 'matrix',
    name: 'Матриця',
    tag: 'Ретро-термінал',
    icon: '📟',
    category: 'classic',
    desc: 'Смарагдовий люмінофорний термінал комп\'ютерної ретро-естетики',
    preview: '10 днів 12 год'
  },
  {
    id: 'digital',
    name: 'LCD Хронометр',
    tag: 'Секундомір точності',
    icon: '⏱️',
    category: 'classic',
    desc: 'Електронний цифровий дисплей із сотими долями секунди невпинного прогресу',
    preview: '10:12:45:80'
  }
];

export const CounterTab: React.FC<CounterTabProps> = ({
  diffMs,
  startDate,
  money,
  totalSaved,
  cigsAvoided,
  treeState,
  dragonState,
  zenState,
  orbitState,
  daysCount,
  reasons,
  streaks = [],
  longestStreakMs = 0,
  goals,
  activeGoalName,
  activeGoalPct,
  onOpenSos,
  onOpenSetup,
  onOpenRelapse,
  onUndoLastRelapse,
  onSwitchTab,
  onAddGoal,
  onCompleteGoal,
  onDeleteGoal,
  dayRatings,
  accent = 'indigo',
  onUpdateReasons,
  onUpdateMoney
}) => {
  const [currentReasonIdx, setCurrentReasonIdx] = React.useState(0);
  const [timerStyle, setTimerStyle] = React.useState<TimerStyleType>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:timer-style');
      if (saved && [
        'zen-breathe', 'aurora', 'kyoto', 'moonlight', 'sandglass', 'harmonic',
        'nixie', 'matrix', 'handwritten', 'digital', 'minimal', 'threed', 'neon',
        'leather-gold', 'obsidian-glow', 'parchment', 'nordic-frost'
      ].includes(saved)) {
        return saved as TimerStyleType;
      }
    } catch {}
    return 'zen-breathe';
  });
  const [showStyleModal, setShowStyleModal] = React.useState(false);
  const [styleFilter, setStyleFilter] = React.useState<'all' | 'meditative' | 'classic'>('all');
  const [isZenMode, setIsZenMode] = React.useState(false);

  // Modals for Gratitude Journal & Daily Steps
  const [isGratitudeModalOpen, setIsGratitudeModalOpen] = React.useState(false);
  const [isDailyStepsModalOpen, setIsDailyStepsModalOpen] = React.useState(false);
  const [indicatorRefreshTrigger, setIndicatorRefreshTrigger] = React.useState(0);
  const refreshIndicators = React.useCallback(() => {
    setIndicatorRefreshTrigger((prev) => prev + 1);
  }, []);

  // Gratitude status indicator helper
  const isGratitudeDoneToday = React.useMemo(() => {
    try {
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const saved = localStorage.getItem('quit-smoking:gratitude-journal-entries');
      if (saved) {
        const parsed: any[] = JSON.parse(saved);
        const entry = parsed.find((e) => e.date === todayStr);
        if (entry && (entry.g1?.trim() || entry.g2?.trim() || entry.g3?.trim())) {
          return true;
        }
      }
    } catch {}
    return false;
  }, [indicatorRefreshTrigger, isGratitudeModalOpen]);

  // Daily steps status indicator helper
  const dailyStepsCounts = React.useMemo(() => {
    try {
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      let steps = [
        { id: 'step-water', title: '💧 Випити склянку води з лимоном при потязі' },
        { id: 'step-breath', title: '🧘 5 хвилин глибокого розслабляючого дихання' },
        { id: 'step-walk', title: '🚶 15 хвилин свіжої прогулянки на повітрі' },
        { id: 'step-apple', title: '🍏 Корисний перекус (яблуко/горіхи) замість диму' },
        { id: 'step-tea', title: '☕ Запашний трав\'яний чай увечері' }
      ];

      const savedSteps = localStorage.getItem('quit-smoking:daily-micro-steps');
      if (savedSteps) {
        const parsed = JSON.parse(savedSteps);
        if (Array.isArray(parsed) && parsed.length > 0) steps = parsed;
      }

      const savedHistory = localStorage.getItem('quit-smoking:daily-steps-history');
      let doneIds: string[] = [];
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        doneIds = parsed[todayStr] || [];
      }

      const total = steps.length;
      const done = steps.filter((s) => doneIds.includes(s.id)).length;
      return { done, total, isAllDone: total > 0 && done === total };
    } catch {
      return { done: 0, total: 5, isAllDone: false };
    }
  }, [indicatorRefreshTrigger, isDailyStepsModalOpen]);

  // Active cat sleep timer and critical needs check for game badge
  const [catSleepMinutes, setCatSleepMinutes] = React.useState<number>(0);
  const [catNeedsAttention, setCatNeedsAttention] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkCatState = () => {
      try {
        const su = localStorage.getItem('quit-smoking:cat-sleep-until');
        if (su) {
          const time = Number(su);
          setCatSleepMinutes(Math.max(0, Math.ceil((time - Date.now()) / 60000)));
        } else {
          setCatSleepMinutes(0);
        }

        // Check if any Tamagotchi need (Food, Water, Joy, Litter) is at or near 0
        const last = localStorage.getItem('quit-smoking:cat-last-time');
        const elapsedSec = last ? (Date.now() - Number(last)) / 1000 : 0;

        const food = Number(localStorage.getItem('quit-smoking:cat-food') ?? 85) - elapsedSec * 0.0025;
        const water = Number(localStorage.getItem('quit-smoking:cat-water') ?? 90) - elapsedSec * 0.0035;
        const joy = Number(localStorage.getItem('quit-smoking:cat-joy') ?? 80) - elapsedSec * 0.0028;
        const litter = Number(localStorage.getItem('quit-smoking:cat-litter') ?? 95) - elapsedSec * 0.002;

        const isCritical = food <= 5 || water <= 5 || joy <= 5 || litter <= 5;
        setCatNeedsAttention(isCritical);
      } catch {
        setCatSleepMinutes(0);
        setCatNeedsAttention(false);
      }
    };

    checkCatState();
    const interval = setInterval(checkCatState, 3000);
    window.addEventListener('storage', checkCatState);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkCatState);
    };
  }, []);

  const updateTimerStyle = (style: TimerStyleType) => {
    setTimerStyle(style);
    try {
      localStorage.setItem('quit-smoking:timer-style', style);
    } catch {}
    if (navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
  };

  // Timer long press
  const isLongPressRef = React.useRef(false);
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    isLongPressRef.current = false;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (navigator.vibrate) {
        try {
          navigator.vibrate(35);
        } catch {}
      }
      setShowStyleModal(true);
    }, 450);
  };

  const handleMouseUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleTimerClick = () => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    if (timerStyle === 'threed') {
      triggerTimerFlicker();
    }
  };

  const [hideStars, setHideStars] = React.useState<boolean>(() => sessionStorage.getItem('hide_star_achievements') === 'true');
  const [dragonToast, setDragonToast] = React.useState<string | null>(null);
  const [isJourneyMapOpen, setIsJourneyMapOpen] = React.useState(false);
  const [flickerActive, setFlickerActive] = React.useState(false);
  const [flickeringIndices, setFlickeringIndices] = React.useState<number[]>([]);
  const [extinguishedIndices, setExtinguishedIndices] = React.useState<number[]>([]);
  const [globalBlackout, setGlobalBlackout] = React.useState(false);

  const [isHydrationOpen, setIsHydrationOpen] = React.useState(false);
  const [isStepsOpen, setIsStepsOpen] = React.useState(false);
  const [isStepsPromptOpen, setIsStepsPromptOpen] = React.useState(false);
  const [isMentalHealthOpen, setIsMentalHealthOpen] = React.useState(false);
  const [isGratitudeOpen, setIsGratitudeOpen] = React.useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
  const [isMotivationsModalOpen, setIsMotivationsModalOpen] = React.useState(false);
  const [isSavedResourcesModalOpen, setIsSavedResourcesModalOpen] = React.useState(false);

  const [goalToast, setGoalToast] = React.useState<{ goalName: string; amount: number; goalId: string } | null>(null);

  // Check if active goal target reached and trigger festive celebration toast
  React.useEffect(() => {
    const activeGoal = goals?.queue && goals.queue.length > 0 ? goals.queue[0] : null;
    if (!activeGoal) return;

    const amount = activeGoal.amount || 0;
    if (amount <= 0) return;

    const spentMoney = (goals?.base || 0) + (goals?.done?.reduce((acc, g) => acc + (g.amount || g.total || 0), 0) || 0);
    const availableMoney = Math.max(0, totalSaved - spentMoney);

    if (availableMoney >= amount) {
      const notifiedKey = `quit-smoking:goal-celebrated-${activeGoal.id}`;
      try {
        if (localStorage.getItem(notifiedKey) !== 'true') {
          localStorage.setItem(notifiedKey, 'true');
          setGoalToast({
            goalName: activeGoal.name,
            amount: amount,
            goalId: activeGoal.id
          });
        }
      } catch {}
    }
  }, [goals, totalSaved]);

  const sessionStartRef = React.useRef<number>(Date.now());

  // 5-minute activity check: prompt to fill daily steps if empty
  React.useEffect(() => {
    const checkFiveMinActivity = () => {
      const elapsedMs = Date.now() - sessionStartRef.current;
      if (elapsedMs >= 5 * 60 * 1000) { // 5 minutes (300,000 ms)
        const d = new Date();
        const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const promptShownKey = `quit-smoking:daily-steps-prompt-date-${todayKey}`;

        try {
          const savedSteps = localStorage.getItem('quit-smoking:daily-micro-steps');
          const steps = savedSteps ? JSON.parse(savedSteps) : [];
          const promptAlreadyShown = localStorage.getItem(promptShownKey) === 'true';

          if ((!Array.isArray(steps) || steps.length === 0) && !promptAlreadyShown) {
            localStorage.setItem(promptShownKey, 'true');
            setIsStepsPromptOpen(true);
          }
        } catch {}
      }
    };

    const interval = setInterval(checkFiveMinActivity, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const [motivationStyle, setMotivationStyle] = React.useState<MotivationStyle>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:motivational-style');
      if (saved === 'quote' || saved === 'card' || saved === 'neon' || saved === 'kraft' || saved === 'ticker') {
        return saved;
      }
    } catch {}
    return 'quote';
  });

  const [autoRotateMotivations, setAutoRotateMotivations] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:motivational-autorotate') === 'true';
    } catch {
      return false;
    }
  });

  const handleStyleChange = (style: MotivationStyle) => {
    setMotivationStyle(style);
    try {
      localStorage.setItem('quit-smoking:motivational-style', style);
    } catch {}
  };

  const handleAutoRotateChange = (val: boolean) => {
    setAutoRotateMotivations(val);
    try {
      localStorage.setItem('quit-smoking:motivational-autorotate', String(val));
    } catch {}
  };

  // Auto-rotate effect
  React.useEffect(() => {
    if (!autoRotateMotivations || reasons.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReasonIdx((prev) => (prev + 1) % (reasons.length || 1));
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRotateMotivations, reasons.length]);

  const [isCompactGoals, setIsCompactGoals] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:use-compact-goals') === 'true';
    } catch {
      return false;
    }
  });

  const [isGoalsDocked, setIsGoalsDocked] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:goals-docked') === 'true';
    } catch {
      return false;
    }
  });

  const [isIndicatorSettingsOpen, setIsIndicatorSettingsOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState<string>(() => {
    return localStorage.getItem('quit-smoking:indicator-style') || 'indicators';
  });

  const saveIndicatorStyle = (style: string) => {
    setIndicatorStyle(style);
    localStorage.setItem('quit-smoking:indicator-style', style);
    setIsIndicatorSettingsOpen(false);
  };

  const [economyMode, setEconomyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:economy-mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-economy', String(economyMode));
  }, [economyMode]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setEconomyMode(localStorage.getItem('quit-smoking:economy-mode') === 'true');
      } catch {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [isQuickGoalDocked, setIsQuickGoalDocked] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:quick-goal-docked') === 'true';
    } catch {
      return false;
    }
  });

  const [isHealthDocked, setIsHealthDocked] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:health-docked') === 'true';
    } catch {
      return false;
    }
  });

  const [quickGoalData, setQuickGoalData] = React.useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:quick-goal');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [quickGoalNow, setQuickGoalNow] = React.useState<number>(Date.now());

  React.useEffect(() => {
    if (!isQuickGoalDocked || !quickGoalData) return;
    const interval = setInterval(() => {
      setQuickGoalNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isQuickGoalDocked, quickGoalData]);

  const [gamePlaytimes, setGamePlaytimes] = React.useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:game-playtimes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { tree: 144, orbit: 12, sand: 8 };
  });

  const handlePlayGame = (gameId: string) => {
    setGamePlaytimes((prev) => {
      const current = prev[gameId] || 0;
      const updated = { ...prev, [gameId]: current + 5 };
      try {
        localStorage.setItem('quit-smoking:game-playtimes', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    onSwitchTab(gameId);
  };

  React.useEffect(() => {
    const handleDockChange = () => {
      try {
        setIsGoalsDocked(localStorage.getItem('quit-smoking:goals-docked') === 'true');
        setIsQuickGoalDocked(localStorage.getItem('quit-smoking:quick-goal-docked') === 'true');
        setIsHealthDocked(localStorage.getItem('quit-smoking:health-docked') === 'true');
        
        const saved = localStorage.getItem('quit-smoking:quick-goal');
        setQuickGoalData(saved ? JSON.parse(saved) : null);
      } catch {}
    };

    const handleQuickGoalCustomEvent = () => {
      try {
        const saved = localStorage.getItem('quit-smoking:quick-goal');
        setQuickGoalData(saved ? JSON.parse(saved) : null);
      } catch {}
    };

    window.addEventListener('storage', handleDockChange);
    window.addEventListener('quick-goal-docked-change', handleDockChange);
    window.addEventListener('goals-docked-change', handleDockChange);
    window.addEventListener('health-docked-change', handleDockChange);
    window.addEventListener('quick-goal-change', handleQuickGoalCustomEvent);
    return () => {
      window.removeEventListener('storage', handleDockChange);
      window.removeEventListener('quick-goal-docked-change', handleDockChange);
      window.removeEventListener('goals-docked-change', handleDockChange);
      window.removeEventListener('health-docked-change', handleDockChange);
      window.removeEventListener('quick-goal-change', handleQuickGoalCustomEvent);
    };
  }, []);

  const toggleCompactGoals = () => {
    const nextVal = !isCompactGoals;
    setIsCompactGoals(nextVal);
    try {
      localStorage.setItem('quit-smoking:use-compact-goals', String(nextVal));
      window.dispatchEvent(new Event('compact-goals-change'));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  React.useEffect(() => {
    const handleCompactChange = () => {
      try {
        setIsCompactGoals(localStorage.getItem('quit-smoking:use-compact-goals') === 'true');
      } catch {}
    };
    window.addEventListener('storage', handleCompactChange);
    window.addEventListener('compact-goals-change', handleCompactChange);
    return () => {
      window.removeEventListener('storage', handleCompactChange);
      window.removeEventListener('compact-goals-change', handleCompactChange);
    };
  }, []);
  const [refreshTick, setRefreshTick] = React.useState(0);
  const handleUpdate = () => setRefreshTick(prev => prev + 1);

  const accentThemeInfo = React.useMemo(() => {
    switch (accent) {
      case 'charcoal':
        return {
          glowColor: '#71717a', // zinc-500
          offColor: '#18181b',  // zinc-900
          shadowColor: '#3f3f46',
          gradientClass: 'bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-400 dark:to-zinc-200 bg-clip-text text-transparent'
        };
      case 'sage':
        return {
          glowColor: '#8a9a92',
          offColor: '#1c2420',
          shadowColor: '#4f5c56',
          gradientClass: 'bg-gradient-to-r from-[#21352c] to-[#3f5349] dark:from-[#8fa097] dark:to-[#c3d1cb] bg-clip-text text-transparent'
        };
      case 'taupe':
        return {
          glowColor: '#a89c93',
          offColor: '#2b2420',
          shadowColor: '#63574f',
          gradientClass: 'bg-gradient-to-r from-[#3e322b] to-[#5a483e] dark:from-[#a39488] dark:to-[#d6cac0] bg-clip-text text-transparent'
        };
      case 'slate-blue':
        return {
          glowColor: '#7d8da4',
          offColor: '#171f2b',
          shadowColor: '#475569',
          gradientClass: 'bg-gradient-to-r from-[#0f172a] to-[#334155] dark:from-[#8899b3] dark:to-[#c5d2e3] bg-clip-text text-transparent'
        };
      case 'ash-olive':
        return {
          glowColor: '#7c8874',
          offColor: '#1a1f17',
          shadowColor: '#4d5746',
          gradientClass: 'bg-gradient-to-r from-[#242c20] to-[#3f4a38] dark:from-[#8a9683] dark:to-[#c4cec0] bg-clip-text text-transparent'
        };
      case 'gray':
      default:
        return {
          glowColor: '#94a3b8', // slate-400
          offColor: '#1e293b',   // slate-800
          shadowColor: '#475569', // slate-600
          gradientClass: 'bg-gradient-to-r from-slate-950 to-slate-750 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent'
        };
    }
  }, [accent]);

  const getAccentBorderClass = (id: string) => {
    switch (id) {
      case 'charcoal': return 'border-zinc-500/30 dark:border-zinc-400/30';
      case 'sage': return 'border-stone-500/30 dark:border-stone-400/30';
      case 'taupe': return 'border-[#786b62]/30 dark:border-[#a39488]/30';
      case 'slate-blue': return 'border-[#5b6a82]/30 dark:border-[#8899b3]/30';
      case 'ash-olive': return 'border-[#5f6959]/30 dark:border-[#8a9683]/30';
      case 'gray':
      default: return 'border-slate-400/30 dark:border-slate-500/30';
    }
  };

  const getAccentBgClass = (id: string) => {
    switch (id) {
      case 'charcoal': return 'bg-zinc-500/10 dark:bg-zinc-400/15';
      case 'sage': return 'bg-stone-500/10 dark:bg-stone-400/15';
      case 'taupe': return 'bg-[#786b62]/10 dark:bg-[#786b62]/20';
      case 'slate-blue': return 'bg-[#5b6a82]/10 dark:bg-[#5b6a82]/20';
      case 'ash-olive': return 'bg-[#5f6959]/10 dark:bg-[#5f6959]/20';
      case 'gray':
      default: return 'bg-slate-500/10 dark:bg-slate-400/15';
    }
  };

  const getAccentTextClass = (id: string) => {
    switch (id) {
      case 'charcoal': return 'text-zinc-900 dark:text-zinc-300';
      case 'sage': return 'text-emerald-950 dark:text-stone-300';
      case 'taupe': return 'text-[#3e322b] dark:text-[#c4b5a8]';
      case 'slate-blue': return 'text-slate-950 dark:text-[#9bb0cc]';
      case 'ash-olive': return 'text-[#242c20] dark:text-[#aab3a4]';
      case 'gray':
      default: return 'text-slate-900 dark:text-slate-200';
    }
  };

  const triggerTimerFlicker = () => {
    if (flickerActive) return;
    
    const textLen = humanQuitTimeText.length;
    if (textLen === 0) return;
    
    setFlickerActive(true);
    
    // Choose if this click triggered a long/severe malfunction combination (45% chance)
    const isLongMalfunction = Math.random() < 0.45;

    if (isLongMalfunction) {
      // --- LONG SEVERE MALFUNCTION SEQUENCE (~3.1 seconds of agonizing struggle) ---
      
      // Stage L1: Immediate global blackout
      setGlobalBlackout(true);
      if (navigator.vibrate) {
        try {
          navigator.vibrate([100, 60, 100]);
        } catch (e) {}
      }

      // Stage L2: Power returns weakly. Most chars are extinguished (completely out) and a few flicker
      setTimeout(() => {
        setGlobalBlackout(false);
        // Almost all chars extinguished
        const extIdxs = Array.from({ length: textLen }, (_, i) => i)
          .filter(() => Math.random() < 0.7); // 70% of chars go dead
        setExtinguishedIndices(extIdxs);

        const flickIdxs = Array.from({ length: textLen }, (_, i) => i)
          .filter(i => !extIdxs.includes(i) && Math.random() < 0.5);
        setFlickeringIndices(flickIdxs);
        
        if (navigator.vibrate) {
          try {
            navigator.vibrate([40, 40, 40]);
          } catch (e) {}
        }
      }, 250);

      // Stage L3: Power drops again (second blackout)
      setTimeout(() => {
        setGlobalBlackout(true);
      }, 950);

      // Stage L4: Rapid chaotic flickering on all segments (neon buzzes furiously)
      setTimeout(() => {
        setGlobalBlackout(false);
        setExtinguishedIndices([]);
        // All characters flicker rapidly like a dying lamp
        const allIdxs = Array.from({ length: textLen }, (_, i) => i);
        setFlickeringIndices(allIdxs);
        if (navigator.vibrate) {
          try {
            navigator.vibrate([30, 20, 30, 20, 30, 20]);
          } catch (e) {}
        }
      }, 1150);

      // Stage L5: Third quick drop to darkness
      setTimeout(() => {
        setGlobalBlackout(true);
        setFlickeringIndices([]);
      }, 1800);

      // Stage L6: Partial return. Only a few letters spark.
      setTimeout(() => {
        setGlobalBlackout(false);
        const extIdxs = Array.from({ length: textLen }, (_, i) => i)
          .filter(() => Math.random() < 0.4); // 40% dead
        setExtinguishedIndices(extIdxs);
        
        const flickCount = Math.floor(Math.random() * 3) + 1;
        const flickIdxs: number[] = [];
        while (flickIdxs.length < flickCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!flickIdxs.includes(randIdx) && !extIdxs.includes(randIdx)) {
            flickIdxs.push(randIdx);
          }
        }
        setFlickeringIndices(flickIdxs);
      }, 2050);

      // Stage L7: Stabilization and full bright return!
      setTimeout(() => {
        setFlickerActive(false);
        setFlickeringIndices([]);
        setExtinguishedIndices([]);
        setGlobalBlackout(false);
        if (navigator.vibrate) {
          try {
            navigator.vibrate([40, 200]);
          } catch (e) {}
        }
      }, 3100);

    } else {
      // --- STANDARD QUICK FLICKER SEQUENCE (~1.6 seconds) ---
      
      // Stage S1: Immediate total blackout of the entire neon board!
      setGlobalBlackout(true);
      if (navigator.vibrate) {
        try {
          navigator.vibrate([80, 50, 40]);
        } catch (e) {}
      }

      // Stage S2: Turn back on, but with some characters flickering and some completely extinguished
      setTimeout(() => {
        setGlobalBlackout(false);
        
        const flickCount = Math.floor(Math.random() * 3) + 2;
        const flickIdxs: number[] = [];
        while (flickIdxs.length < flickCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!flickIdxs.includes(randIdx)) flickIdxs.push(randIdx);
        }
        setFlickeringIndices(flickIdxs);

        const extCount = Math.floor(Math.random() * 2) + 1;
        const extIdxs: number[] = [];
        while (extIdxs.length < extCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!extIdxs.includes(randIdx)) extIdxs.push(randIdx);
        }
        setExtinguishedIndices(extIdxs);

        if (navigator.vibrate) {
          try {
            navigator.vibrate([30, 100, 30]);
          } catch (e) {}
        }
      }, 180);

      // Stage S3: A momentary second full blackout (power drop) after 700ms
      setTimeout(() => {
        setGlobalBlackout(true);
      }, 700);

      // Stage S4: Restore with different flickering indices, and some extinguished
      setTimeout(() => {
        setGlobalBlackout(false);
        
        const extCount = Math.floor(Math.random() * 2) + 1;
        const extIdxs: number[] = [];
        while (extIdxs.length < extCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!extIdxs.includes(randIdx)) extIdxs.push(randIdx);
        }
        setExtinguishedIndices(extIdxs);
        
        const flickCount = Math.floor(Math.random() * 2) + 1;
        const flickIdxs: number[] = [];
        while (flickIdxs.length < flickCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!flickIdxs.includes(randIdx) && !extIdxs.includes(randIdx)) flickIdxs.push(randIdx);
        }
        setFlickeringIndices(flickIdxs);
      }, 850);

      // Stage S5: Final neon stabilization and fully restore
      setTimeout(() => {
        setFlickerActive(false);
        setFlickeringIndices([]);
        setExtinguishedIndices([]);
        setGlobalBlackout(false);
        if (navigator.vibrate) {
          try {
            navigator.vibrate([20]);
          } catch (e) {}
        }
      }, 1600);
    }
  };

  // Auto-rotate reasons every 10 seconds
  React.useEffect(() => {
    if (reasons.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReasonIdx((prev) => (prev + 1) % reasons.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [reasons.length]);

  // Check hydration for today
  const hydrationState = React.useMemo(() => {
    try {
      const d = new Date();
      const key = `quit-smoking:hydration-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const goalKey = 'quit-smoking:hydration-goal';
      const showIndicatorKey = 'quit-smoking:hydration-show-indicator';
      const saved = localStorage.getItem(key);
      const savedGoal = localStorage.getItem(goalKey);
      const savedShow = localStorage.getItem(showIndicatorKey);
      const ml = saved !== null ? parseInt(saved, 10) || 0 : 0;
      const goal = savedGoal !== null ? parseInt(savedGoal, 10) || 2000 : 2000;
      const showIndicator = savedShow !== null ? savedShow === 'true' : true;
      const pct = Math.min(100, Math.round((ml / goal) * 100));
      const isLow = ml < Math.round(goal * 0.25);
      return { ml, isLow, goal, pct, showIndicator };
    } catch {
      return { ml: 0, isLow: true, goal: 2000, pct: 0, showIndicator: true };
    }
  }, [refreshTick]);

  // Check mental health for today
  const mentalHealthState = React.useMemo(() => {
    try {
      const d = new Date();
      const todayKey = `quit-smoking:mental-health-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const habitsKey = 'quit-smoking:mental-health-habits-config';
      const showIndicatorKey = 'quit-smoking:mental-health-show-indicator';

      const savedLog = localStorage.getItem(todayKey);
      const savedHabits = localStorage.getItem(habitsKey);
      const savedShow = localStorage.getItem(showIndicatorKey);

      const log = savedLog ? JSON.parse(savedLog) : {};
      const habits = savedHabits ? JSON.parse(savedHabits) : [];
      const showIndicator = savedShow !== null ? savedShow === 'true' : true;

      const list = Array.isArray(habits) && habits.length > 0 ? habits : [
        { id: 'hugs', type: 'checkbox' },
        { id: 'chat', type: 'checkbox' },
        { id: 'cold_splash', type: 'checkbox' },
        { id: 'sun_walk', type: 'checkbox' },
        { id: 'music', type: 'checkbox' },
        { id: 'gratitude', type: 'checkbox' },
        { id: 'dark_chocolate', type: 'checkbox' },
        { id: 'breathing', type: 'checkbox' },
        { id: 'micro_win', type: 'checkbox' },
        { id: 'smile', type: 'checkbox' }
      ];

      let score = 0;
      list.forEach((h: any) => {
        const val = log[h.id];
        if (h.type === 'counter') {
          const target = h.targetCount || 10;
          const count = typeof val === 'number' ? val : 0;
          score += Math.min(1, count / target);
        } else if (val === true) {
          score += 1;
        }
      });

      const pct = list.length > 0 ? Math.round((score / list.length) * 100) : 0;
      return { pct, showIndicator };
    } catch {
      return { pct: 0, showIndicator: true };
    }
  }, [refreshTick]);

  // Check gratitude journal state for today and reminder visibility
  const gratitudeState = React.useMemo(() => {
    try {
      const d = new Date();
      const todayDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const showKey = 'quit-smoking:gratitude-show-indicator';
      const timeKey = 'quit-smoking:gratitude-indicator-time';
      const storageKey = 'quit-smoking:gratitude-journal-entries';

      const savedShow = localStorage.getItem(showKey);
      const savedTime = localStorage.getItem(timeKey);
      const savedEntries = localStorage.getItem(storageKey);

      const showIndicator = savedShow !== null ? savedShow === 'true' : true;
      const indicatorTime = savedTime || 'always';

      let isVisibleByTime = true;
      if (indicatorTime !== 'always') {
        const targetHour = parseInt(indicatorTime.split(':')[0], 10) || 18;
        const currentHour = d.getHours();
        if (currentHour < targetHour) {
          isVisibleByTime = false;
        }
      }

      const list = savedEntries ? JSON.parse(savedEntries) : [];
      const todayEntry = Array.isArray(list) ? list.find((e: any) => e.date === todayDateStr) : null;

      let count = 0;
      if (todayEntry) {
        if (todayEntry.g1 && todayEntry.g1.trim()) count++;
        if (todayEntry.g2 && todayEntry.g2.trim()) count++;
        if (todayEntry.g3 && todayEntry.g3.trim()) count++;
      }

      return {
        count,
        showIndicator: showIndicator && isVisibleByTime,
        isCompleted: count >= 3
      };
    } catch {
      return { count: 0, showIndicator: true, isCompleted: false };
    }
  }, [refreshTick]);

  const isDragonUnlocked = cigsAvoided >= DRAGON_UNLOCK_CIGS;
  const dragonStage = getDragonStage(cigsAvoided);
  const dragonLeft = Math.max(0, Math.ceil(DRAGON_UNLOCK_CIGS - cigsAvoided));
  const dragonProgressPct = Math.min(100, Math.max(3, (cigsAvoided / DRAGON_UNLOCK_CIGS) * 100));

  const handleDragonClick = () => {
    if (!isDragonUnlocked) {
      setDragonToast(`Ще ${dragonLeft} невикурених сигарет до пробудження Космічного Дракона! 🐉✨`);
      setTimeout(() => setDragonToast(null), 3500);
      return;
    }
    onSwitchTab('dragon');
  };

  const handleHealthClick = () => {
    try {
      const saved = localStorage.getItem('quit-smoking:more-sections-open');
      const current = saved ? JSON.parse(saved) : {};
      current.health = true;
      localStorage.setItem('quit-smoking:more-sections-open', JSON.stringify(current));
    } catch (e) {}
    onSwitchTab('more');
  };

  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null && event.beta !== null) {
        const x = Math.max(-5, Math.min(5, event.gamma / 5));
        const y = Math.max(-5, Math.min(5, event.beta / 5));
        setTilt({ x, y });
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const DAY_MS = 24 * 60 * 60 * 1000;
  const HOUR_MS = 60 * 60 * 1000;
  const MIN_MS = 60 * 1000;
  const SEC_MS = 1000;

  const days = Math.floor(diffMs / DAY_MS);
  const hours = Math.floor((diffMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((diffMs % HOUR_MS) / MIN_MS);
  const seconds = Math.floor((diffMs % MIN_MS) / SEC_MS);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Digital format: D:HH:MM:SS:CC
  const digitalTimeText = React.useMemo(() => {
    const ms = diffMs % 1000;
    const cs = Math.floor(ms / 10);
    if (days > 0) {
      return `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(cs)}`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(cs)}`;
  }, [days, hours, minutes, seconds, diffMs]);

  const todayFact = getTodayHealthFact(diffMs);
  const currentReason = reasons.length > 0 ? reasons[currentReasonIdx % reasons.length] : null;

  const nextReason = () => {
    if (reasons.length > 1) {
      setCurrentReasonIdx((prev) => (prev + 1) % reasons.length);
    }
  };

  const formattedStartDate = React.useMemo(() => {
    try {
      return new Date(startDate).toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date(startDate).toLocaleString();
    }
  }, [startDate]);

  // Formatted human quit time with Ukrainian declensions
  // e.g. "Ти не куриш 10 днів, 12 годин і 13хв"
  const humanQuitTimeText = React.useMemo(() => {
    const getDaysWord = (d: number) => {
      const m10 = d % 10;
      const m100 = d % 100;
      if (m100 >= 11 && m100 <= 14) return 'днів';
      if (m10 === 1) return 'день';
      if (m10 >= 2 && m10 <= 4) return 'дні';
      return 'днів';
    };

    const getHoursWord = (h: number) => {
      const m10 = h % 10;
      const m100 = h % 100;
      if (m100 >= 11 && m100 <= 14) return 'годин';
      if (m10 === 1) return 'година';
      if (m10 >= 2 && m10 <= 4) return 'години';
      return 'годин';
    };

    if (days > 0) {
      return `${days} ${getDaysWord(days)} ${hours} ${getHoursWord(hours)} ${minutes}хв`;
    }
    if (hours > 0) {
      return `${hours} ${getHoursWord(hours)} ${minutes}хв`;
    }
    return `${Math.max(1, minutes)}хв`;
  }, [days, hours, minutes]);

  // Freedom duration human-readable text

  // Packs avoided human-readable text (e.g. "123.8 пачки", "5 пачок", "1 пачка")
  const packsAvoidedText = React.useMemo(() => {
    if (!money || !money.packSize) return '0 пачок';
    const packs = cigsAvoided / money.packSize;
    const str = packs.toFixed(1);
    if (str.endsWith('.0')) {
      const intVal = Math.round(packs);
      const mod10 = intVal % 10;
      const mod100 = intVal % 100;
      if (mod100 >= 11 && mod100 <= 14) return `${intVal} пачок`;
      if (mod10 === 1) return `${intVal} пачка`;
      if (mod10 >= 2 && mod10 <= 4) return `${intVal} пачки`;
      return `${intVal} пачок`;
    }
    return `${str} пачки`;
  }, [cigsAvoided, money]);

  // Dream economy calculations
  const spentOnDreams = React.useMemo(() => {
    return (goals?.done || []).reduce((acc, g) => acc + (g.total || g.amount || 0), 0);
  }, [goals?.done]);

  const availableForDreams = React.useMemo(() => {
    return Math.max(0, totalSaved - (goals?.base || 0));
  }, [totalSaved, goals?.base]);

  // Current active smoking expense rates
  const curPerDay = money?.perDay ?? 20;
  const curPackSize = money?.packSize ?? 20;
  const curPackPrice = money?.packPrice ?? 100;

  const costPerCig = curPackSize > 0 ? curPackPrice / curPackSize : 0;
  const costPerDay = curPackSize > 0 ? (curPerDay / curPackSize) * curPackPrice : 0;
  const costPerMonth = costPerDay * 30;
  const costPerYear = costPerDay * 365;

  // Sand level badges breakdown
  const sandLevelBadges = React.useMemo(() => {
    const items = getLevelCounts(daysCount).filter(item => item.count > 0).slice(-4).reverse();

    if (items.length === 0) {
      return (
        <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] font-medium">
          🌱 Менше 1 хвилини (перша піщинка формується)
        </span>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {items.map((item) => (
          <span
            key={item.level}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/5 dark:bg-black/30 border border-[#B7CDC6]/50 dark:border-[#2d2d35] text-[10px] font-mono font-bold"
            style={{ color: item.config.color }}
          >
            <span>{item.count} × {item.config.name}</span>
          </span>
        ))}
      </div>
    );
  }, [daysCount]);

  // Tree stats for clickable card
  const currentTree = treeState.current;
  const currentSpecies = (currentTree && TREE_SPECIES[currentTree.speciesId]) ? TREE_SPECIES[currentTree.speciesId] : TREE_SPECIES.pine;
  const currentStage = currentTree ? getTreeStageInfo(currentTree.growth) : null;
  const treeGrowth = currentTree ? Math.floor(currentTree.growth) : 8;

  // Calculation of returned time: 1 cigarette takes user-defined minutes (default 7 min)
  const returnedTimeData = React.useMemo(() => {
    const minutesPerCig = money?.minutesPerCig ?? 7;
    const totalMinutes = Math.round(cigsAvoided * minutesPerCig);
    const wholeHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    const getBooksDeclension = (b: number) => {
      const m10 = b % 10;
      const m100 = b % 100;
      if (m100 >= 11 && m100 <= 14) return 'книг';
      if (m10 === 1) return 'книга';
      if (m10 >= 2 && m10 <= 4) return 'книги';
      return 'книг';
    };

    const getWorkoutsDeclension = (w: number) => {
      const m10 = w % 10;
      const m100 = w % 100;
      if (m100 >= 11 && m100 <= 14) return 'тренувань';
      if (m10 === 1) return 'тренування';
      if (m10 >= 2 && m10 <= 4) return 'тренування';
      return 'тренувань';
    };

    let timeText = '';
    if (wholeHours >= 24) {
      const d = Math.floor(wholeHours / 24);
      const h = wholeHours % 24;
      timeText = `${wholeHours} год (${d} дн. ${h > 0 ? `${h} год` : ''})`.trim();
    } else if (wholeHours > 0) {
      timeText = `${wholeHours} год${remainingMinutes > 0 ? ` ${remainingMinutes} хв` : ''}`;
    } else {
      timeText = `${Math.max(1, totalMinutes)} хв`;
    }

    // Realistic equivalents
    const booksCount = Math.max(1, Math.round(Math.max(1, wholeHours) / 10));
    const workoutsCount = Math.max(1, Math.round(Math.max(1, wholeHours) / 1));

    const perDay = money?.perDay ?? 15;
    const yearlyMinutes = perDay * minutesPerCig * 365;
    const yearlyHours = Math.round(yearlyMinutes / 60);

    return {
      totalMinutes,
      wholeHours,
      timeText,
      yearlyHoursText: `${yearlyHours.toLocaleString('uk-UA')} / рік`,
      booksText: `${booksCount} ${getBooksDeclension(booksCount)}`,
      workoutsText: `${workoutsCount} ${getWorkoutsDeclension(workoutsCount)}`
    };
  }, [cigsAvoided, money?.minutesPerCig, money?.perDay]);

  const gamesList = React.useMemo(() => {
    const list = [
      {
        id: 'sand',
        title: 'Піщинки часу',
        desc: 'Квантовий організм спокою. Торкніться, щоб відчути плин чистого часу.',
        icon: (
          <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-85 group-hover:opacity-100 transition-opacity">
            <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" className="text-amber-500/40 dark:text-amber-400/35 animate-spin" style={{ animationDuration: '30s' }} />
            <circle cx="30" cy="30" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-amber-500/60 dark:text-amber-400/55" />
            <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-amber-500 dark:text-amber-400" />
            <polygon points="30,22 36,30 30,38 24,30" fill="currentColor" className="text-amber-500 dark:text-amber-400" />
            <circle cx="30" cy="30" r="1.5" fill="#ffffff" />
          </svg>
        ),
        bgClass: 'bg-slate-50/70 hover:bg-slate-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border-slate-200/80 dark:border-zinc-800',
        iconBgClass: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 group-hover:border-amber-500/45 transition-colors',
      },
      {
        id: 'tree',
        title: 'Святилище дерева',
        desc: 'Тихе пробудження насінини у теплій землі. Плекайте життя дотиком.',
        icon: (
          <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-85 group-hover:opacity-100 transition-opacity">
            <ellipse cx="30" cy="46" rx="20" ry="4" fill="currentColor" className="text-emerald-800/40 dark:text-emerald-700/40" />
            <path d="M30,46 Q29,32 30,22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" className="text-emerald-600 dark:text-emerald-500" />
            <ellipse cx="25" cy="24" rx="5" ry="3" fill="currentColor" transform="rotate(-30 25 24)" className="text-emerald-500 dark:text-emerald-400" />
            <ellipse cx="35" cy="22" rx="5" ry="3" fill="currentColor" transform="rotate(30 35 22)" className="text-emerald-500 dark:text-emerald-400" />
            <circle cx="30" cy="18" r="2" fill="currentColor" className="text-emerald-300" />
          </svg>
        ),
        bgClass: 'bg-slate-50/70 hover:bg-slate-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border-slate-200/80 dark:border-zinc-800',
        iconBgClass: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 group-hover:border-emerald-500/45 transition-colors',
      },
      {
        id: 'orbit',
        title: 'Гравітаційні орбіти',
        desc: 'Музика небесних сфер. Запускайте космічні тіла у плавний вічний танець.',
        icon: (
          <svg viewBox="0 0 60 60" className="w-10 h-10 select-none opacity-85 group-hover:opacity-100 transition-opacity">
            <ellipse cx="30" cy="30" rx="22" ry="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" transform="rotate(-25 30 30)" className="text-indigo-400/50 dark:text-indigo-300/40" />
            <ellipse cx="30" cy="30" rx="14" ry="7" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(35 30 30)" className="text-indigo-400/70 dark:text-indigo-300/60" />
            <circle cx="30" cy="30" r="5" fill="currentColor" className="text-indigo-500 dark:text-indigo-400" />
            <circle cx="30" cy="30" r="1.5" fill="#ffffff" />
            <circle cx="45" cy="22" r="2.5" fill="currentColor" className="text-amber-400" />
          </svg>
        ),
        bgClass: 'bg-slate-50/70 hover:bg-slate-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border-slate-200/80 dark:border-zinc-800',
        iconBgClass: 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/25 group-hover:border-indigo-500/45 transition-colors',
      }
    ];

    return [...list].sort((a, b) => {
      const timeA = gamePlaytimes[a.id] || 0;
      const timeB = gamePlaytimes[b.id] || 0;
      return timeB - timeA;
    });
  }, [gamePlaytimes]);

  return (
    <div className="flex flex-col flex-1 pb-6 max-w-md mx-auto w-full">
      {/* 1. ТАЙМЕР */}
      <div 
        className="mb-6 p-4 flex flex-col justify-center items-center relative"
        style={{
          transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
         <style dangerouslySetInnerHTML={{ __html: `
          @keyframes neonFlicker {
            0%, 18%, 22%, 25%, 53%, 57%, 100% {
              opacity: 1;
              color: ${accentThemeInfo.glowColor};
              text-shadow: 0 0 6px ${accentThemeInfo.glowColor}, 0 0 12px ${accentThemeInfo.shadowColor}, 0 0 20px ${accentThemeInfo.shadowColor};
            }
            20%, 24%, 55% {
              opacity: 0.1;
              color: ${accentThemeInfo.offColor};
              text-shadow: none;
            }
          }
          .neon-flickering-char {
            animation: neonFlicker 0.18s infinite;
          }
          .neon-extinguished-char {
            opacity: 0.04 !important;
            color: ${accentThemeInfo.offColor} !important;
            text-shadow: none !important;
          }

          /* Vintage Nixie Tube Lamp (Газорозрядна лампа ІН-14) - спокійне стабільне тепле світіння */
          .timer-nixie-wrapper {
            background: radial-gradient(ellipse at center, rgba(30,15,5,0.92) 0%, rgba(12,6,3,0.98) 100%);
            border: 1px solid rgba(249, 115, 22, 0.4);
            box-shadow: inset 0 0 16px rgba(234, 88, 12, 0.25), 0 4px 20px rgba(0, 0, 0, 0.5);
            padding: 8px 18px;
            border-radius: 16px;
            font-family: 'Share Tech Mono', monospace;
            position: relative;
          }
          .timer-nixie-char {
            color: #fff7ed;
            text-shadow: 0 0 4px #ffedd5, 0 0 10px #fb923c, 0 0 20px #ea580c, 0 0 32px #c2410c;
            font-weight: 700;
          }

          /* Matrix Terminal - чіткий спокійний зелений дисплей */
          .timer-matrix-wrapper {
            background: #020c04;
            border: 1px solid rgba(34, 197, 94, 0.4);
            box-shadow: inset 0 0 14px rgba(34, 197, 94, 0.2), 0 0 15px rgba(34, 197, 94, 0.15);
            padding: 6px 16px;
            border-radius: 10px;
            font-family: 'VT323', monospace;
            letter-spacing: 2px;
          }
          .timer-matrix-char {
            color: #22c55e;
            text-shadow: 0 0 4px #22c55e, 0 0 10px #15803d;
          }

          /* Handwritten Calligraphy (Рукописний стиль) */
          .timer-handwritten-text {
            font-family: 'Caveat', cursive;
            font-weight: 700;
            font-size: 1.35em;
            letter-spacing: 0.5px;
            transform: rotate(-1.5deg);
            filter: drop-shadow(1px 2px 3px rgba(0,0,0,0.15));
          }

          /* 3D Modern - єдиний стиль з активним мерехтінням/підсвіткою */
          @keyframes threedFlicker {
            0%, 100% {
              color: #f8fafc;
              text-shadow: 
                1px 1px 0px #94a3b8,
                2px 2px 0px #64748b,
                3px 3px 0px #475569,
                4px 4px 6px rgba(0,0,0,0.35);
              filter: drop-shadow(0 0 4px rgba(255,255,255,0.4));
            }
            50% {
              color: #e2e8f0;
              text-shadow: 
                1px 1px 0px #64748b,
                2px 2px 0px #475569,
                3px 3px 0px #334155,
                4px 4px 8px rgba(0,0,0,0.5);
              filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.7));
            }
          }
          .timer-3d {
            animation: threedFlicker 2s infinite ease-in-out;
            transform: skew(-2deg, 1deg);
          }
          html:not(.dark) .timer-3d {
            color: #0f172a !important;
            animation: none !important;
            text-shadow: 
              1px 1px 0px #cbd5e1,
              2px 2px 0px #94a3b8,
              3px 3px 0px #64748b,
              4px 4px 6px rgba(0,0,0,0.15) !important;
            filter: drop-shadow(0 0 2px rgba(0,0,0,0.08)) !important;
          }

          /* Vintage Digital LCD */
          .timer-digital-wrapper {
            font-family: 'Share Tech Mono', monospace;
            background: #09090b;
            color: #ef4444;
            padding: 6px 16px;
            border-radius: 8px;
            box-shadow: inset 0 0 12px #000, 0 0 15px rgba(239, 68, 68, 0.25);
            border: 1px solid #27272a;
            letter-spacing: 1px;
          }

          /* 1. Coherent Zen Breathing Pulse (Дихання дзен) - 5.5с резонансний ритм */
          @keyframes zenBreathPulse {
            0%, 100% {
              transform: scale(0.985);
              opacity: 0.92;
            }
            50% {
              transform: scale(1.025);
              opacity: 1;
            }
          }
          @keyframes zenBreathHaloDark {
            0%, 100% {
              filter: drop-shadow(0 0 8px rgba(45, 212, 191, 0.35)) drop-shadow(0 0 16px rgba(20, 184, 166, 0.15));
            }
            50% {
              filter: drop-shadow(0 0 16px rgba(45, 212, 191, 0.75)) drop-shadow(0 0 32px rgba(20, 184, 166, 0.35));
            }
          }
          @keyframes zenBreathHaloLight {
            0%, 100% {
              filter: drop-shadow(0 1px 2px rgba(15, 23, 42, 0.08)) drop-shadow(0 0 8px rgba(13, 148, 136, 0.2));
            }
            50% {
              filter: drop-shadow(0 1px 3px rgba(15, 23, 42, 0.12)) drop-shadow(0 0 18px rgba(13, 148, 136, 0.45));
            }
          }
          .timer-zen-breathe {
            font-family: 'Marcellus', serif;
            letter-spacing: 0.04em;
          }
          html.dark .timer-zen-breathe {
            color: #ccfbf1;
            text-shadow: 0 0 10px rgba(45, 212, 191, 0.55), 0 0 20px rgba(20, 184, 166, 0.3);
            animation: zenBreathPulse 5.5s ease-in-out infinite, zenBreathHaloDark 5.5s ease-in-out infinite;
          }
          html:not(.dark) .timer-zen-breathe {
            color: #042f2e;
            text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
            animation: zenBreathPulse 5.5s ease-in-out infinite, zenBreathHaloLight 5.5s ease-in-out infinite;
          }

          /* 2. Aurora Borealis (Північне сяйво) */
          @keyframes auroraGradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .timer-aurora {
            font-family: 'Marcellus', serif;
            letter-spacing: 0.04em;
            background-size: 300% 300%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent !important;
            animation: auroraGradientShift 12s ease-in-out infinite;
          }
          html.dark .timer-aurora {
            background-image: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 25%, #818cf8 50%, #c084fc 75%, #2dd4bf 100%);
            filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.4));
          }
          html:not(.dark) .timer-aurora {
            background-image: linear-gradient(135deg, #0f766e 0%, #0369a1 25%, #4338ca 50%, #7e22ce 75%, #0f766e 100%);
            filter: drop-shadow(0 1px 2px rgba(15, 23, 42, 0.12));
          }

          /* 3. Kyoto Rock Garden (Сад каменів) */
          .timer-kyoto-box {
            font-family: 'Marcellus', serif;
            letter-spacing: 0.08em;
            padding: 4px 16px;
            border-radius: 20px;
            transition: all 0.3s ease;
          }
          html.dark .timer-kyoto-box {
            background: rgba(28, 25, 23, 0.7);
            border: 1px solid rgba(168, 162, 158, 0.25);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 4px 16px rgba(0, 0, 0, 0.4);
            color: #f5f5f4;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8), 0 0 14px rgba(214, 211, 209, 0.25);
          }
          html:not(.dark) .timer-kyoto-box {
            background: rgba(250, 250, 249, 0.85);
            border: 1px solid rgba(120, 113, 108, 0.25);
            box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.9), 0 2px 8px rgba(120, 113, 108, 0.12);
            color: #1c1917;
            text-shadow: 0 1px 1px rgba(255, 255, 255, 0.9);
          }

          /* 4. Moonlight (Місячне сяйво) */
          @keyframes moonlightBreathe {
            0%, 100% {
              filter: drop-shadow(0 0 6px rgba(186, 230, 253, 0.35)) drop-shadow(0 0 16px rgba(147, 197, 253, 0.15));
              opacity: 0.94;
            }
            50% {
              filter: drop-shadow(0 0 14px rgba(224, 242, 254, 0.7)) drop-shadow(0 0 28px rgba(186, 230, 253, 0.35));
              opacity: 1;
            }
          }
          .timer-moonlight {
            font-family: 'Marcellus', serif;
            letter-spacing: 0.05em;
            animation: moonlightBreathe 7s ease-in-out infinite;
          }
          html.dark .timer-moonlight {
            color: #f8fafc;
            text-shadow: 0 0 10px rgba(224, 242, 254, 0.7), 0 0 22px rgba(147, 197, 253, 0.35);
          }
          html:not(.dark) .timer-moonlight {
            color: #0f172a;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9), 0 0 12px rgba(56, 189, 248, 0.25);
          }

          /* 5. Sandglass (Золотий пісок часу) */
          @keyframes sandflowPulse {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          .timer-sandglass {
            font-family: 'Marcellus', serif;
            letter-spacing: 0.04em;
            background-size: 250% 250%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent !important;
            animation: sandflowPulse 9s ease-in-out infinite;
          }
          html.dark .timer-sandglass {
            background-image: linear-gradient(135deg, #fef3c7 0%, #f59e0b 30%, #fbbf24 60%, #d97706 85%, #fef3c7 100%);
            filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.45));
          }
          html:not(.dark) .timer-sandglass {
            background-image: linear-gradient(135deg, #78350f 0%, #b45309 30%, #d97706 60%, #92400e 100%);
            filter: drop-shadow(0 1px 2px rgba(15, 23, 42, 0.1));
          }

          /* Zen Star: Реалістична ніжна мерехтлива зірка з повільним медитативним подихом */
          @keyframes realisticStarBreathe {
            0% {
              transform: scale(0.92);
              opacity: 0.72;
              background-color: #ffffff;
              box-shadow: 
                0 0 2px 1px #ffffff,
                0 0 6px 2px rgba(186, 230, 253, 0.8),   /* льодисто-блакитний відблиск */
                0 0 14px 4px rgba(56, 189, 248, 0.35),
                0 0 24px 8px rgba(14, 165, 233, 0.15);
            }
            15% {
              transform: scale(1.05);
              opacity: 0.95;
              box-shadow: 
                0 0 3px 1.5px #ffffff,
                0 0 8px 3px rgba(191, 219, 254, 0.9),   /* кришталевий блакитний */
                0 0 18px 6px rgba(96, 165, 250, 0.4),
                0 0 32px 10px rgba(37, 99, 235, 0.18);
            }
            32% {
              transform: scale(0.85);
              opacity: 0.58;
              box-shadow: 
                0 0 2px 1px #ffffff,
                0 0 5px 2px rgba(233, 213, 255, 0.7),   /* ніжний лавандовий */
                0 0 12px 3px rgba(192, 132, 252, 0.3),
                0 0 20px 6px rgba(168, 85, 247, 0.12);
            }
            48% {
              transform: scale(1.12);
              opacity: 1;
              box-shadow: 
                0 0 3px 1.5px #ffffff,
                0 0 9px 3px rgba(244, 114, 182, 0.85),  /* м'який рожево-фіолетовий спектр */
                0 0 20px 6px rgba(217, 70, 239, 0.45),
                0 0 36px 12px rgba(147, 51, 234, 0.2);
            }
            65% {
              transform: scale(0.9);
              opacity: 0.65;
              box-shadow: 
                0 0 2px 1px #ffffff,
                0 0 6px 2px rgba(254, 205, 211, 0.75),  /* ніжний рубіновий відблиск */
                0 0 14px 4px rgba(251, 113, 133, 0.35),
                0 0 24px 8px rgba(244, 63, 94, 0.15);
            }
            82% {
              transform: scale(1.08);
              opacity: 0.92;
              box-shadow: 
                0 0 3px 1.5px #ffffff,
                0 0 8px 3px rgba(216, 180, 254, 0.85),  /* фіалково-блакитний перехід */
                0 0 18px 6px rgba(167, 139, 250, 0.4),
                0 0 30px 10px rgba(124, 58, 237, 0.18);
            }
            100% {
              transform: scale(0.92);
              opacity: 0.72;
              background-color: #ffffff;
              box-shadow: 
                0 0 2px 1px #ffffff,
                0 0 6px 2px rgba(186, 230, 253, 0.8),
                0 0 14px 4px rgba(56, 189, 248, 0.35),
                0 0 24px 8px rgba(14, 165, 233, 0.15);
            }
          }

          /* Повільне органічне мерехтіння атмосфери (scintillation) */
          @keyframes gentleScintillation {
            0%, 100% {
              opacity: 0.45;
              transform: rotate(0deg) scale(0.95);
            }
            25% {
              opacity: 0.75;
              transform: rotate(1.5deg) scale(1.06);
            }
            50% {
              opacity: 0.35;
              transform: rotate(0deg) scale(0.9);
            }
            75% {
              opacity: 0.8;
              transform: rotate(-1.5deg) scale(1.08);
            }
          }

          /* Тонкий дифракційний хрест оптичного телескопа/ока */
          @keyframes diffractionPulse {
            0%, 100% {
              opacity: 0.28;
              transform: scaleX(0.9) scaleY(0.9);
            }
            50% {
              opacity: 0.65;
              transform: scaleX(1.15) scaleY(1.15);
            }
          }

          .zen-star-pinpoint {
            animation: realisticStarBreathe 10s infinite ease-in-out;
          }
          .zen-star-diffraction {
            animation: diffractionPulse 7s infinite ease-in-out;
          }
          .zen-star-halo {
            animation: gentleScintillation 14s infinite ease-in-out;
          }

          /* 13. Leather and Gold Style */
          .timer-leather-gold-box {
            background: radial-gradient(circle at center, #2e2621 0%, #171311 100%);
            border: 2px solid #b45309;
            outline: 1.5px dashed #f59e0b;
            outline-offset: -5px;
            box-shadow: inset 0 0 14px rgba(0,0,0,0.9), 0 5px 20px rgba(0,0,0,0.65);
            color: #f59e0b;
            font-family: 'Cinzel', 'Marcellus', serif;
            letter-spacing: 0.05em;
            padding: 8px 20px;
            border-radius: 16px;
            text-shadow: 1px 1px 0px #78350f, 0 0 8px rgba(245, 158, 11, 0.45);
          }

          /* 14. Obsidian Glow Style */
          @keyframes obsidianPulse {
            0%, 100% {
              filter: drop-shadow(0 0 5px rgba(168, 85, 247, 0.45)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.2));
              border-color: rgba(168, 85, 247, 0.4);
            }
            50% {
              filter: drop-shadow(0 0 14px rgba(168, 85, 247, 0.9)) drop-shadow(0 0 28px rgba(236, 72, 153, 0.45));
              border-color: rgba(236, 72, 153, 0.65);
            }
          }
          .timer-obsidian-glow-box {
            background: radial-gradient(circle at center, #18181b 0%, #09090b 100%);
            border: 1px solid rgba(168, 85, 247, 0.45);
            box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.95), 0 4px 18px rgba(168, 85, 247, 0.15);
            color: #f3e8ff;
            font-family: 'Marcellus', serif;
            letter-spacing: 0.05em;
            padding: 8px 20px;
            border-radius: 14px;
            animation: obsidianPulse 4.5s infinite ease-in-out;
            text-shadow: 0 0 8px rgba(168, 85, 247, 0.75);
          }

          /* 15. Ancient Parchment Style */
          .timer-parchment-box {
            background-color: #f7ebd3;
            background-image: radial-gradient(rgba(242, 232, 212, 0.5) 30%, rgba(212, 192, 166, 0.65) 100%);
            border: 1px solid #c2a67e;
            box-shadow: inset 0 0 10px rgba(139, 92, 26, 0.18), 0 4px 12px rgba(0, 0, 0, 0.15);
            color: #3f2d1e;
            font-family: 'Caveat', cursive;
            font-weight: 700;
            font-size: 1.25em;
            letter-spacing: 0.5px;
            padding: 6px 18px;
            border-radius: 10px;
            text-shadow: 0.5px 0.5px 1px rgba(255,255,255,0.75);
          }

          /* 16. Nordic Frost Style */
          @keyframes frostBreathe {
            0%, 100% {
              background-color: rgba(224, 242, 254, 0.16);
              box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.25), 0 4px 16px rgba(56, 189, 248, 0.16);
            }
            50% {
              background-color: rgba(224, 242, 254, 0.3);
              box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.4), 0 6px 24px rgba(56, 189, 248, 0.32);
            }
          }
          .timer-nordic-frost-box {
            background-color: rgba(224, 242, 254, 0.18);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            color: #f0f9ff;
            font-family: 'Marcellus', serif;
            letter-spacing: 0.05em;
            padding: 8px 20px;
            border-radius: 20px;
            animation: frostBreathe 6.5s infinite ease-in-out;
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.85), 0 0 16px rgba(56, 189, 248, 0.45);
          }

          /* General bottom slide drawer animation for style menu */
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slideUp {
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          /* Occasional rotating gear animation */
          @keyframes gearRotate {
            0%, 75%, 100% {
              transform: rotate(0deg);
            }
            80% {
              transform: rotate(180deg);
            }
            85% {
              transform: rotate(360deg);
            }
          }
          .animate-gear-occasional {
            display: inline-block;
            animation: gearRotate 12s infinite ease-in-out;
          }

          /* Occasional sparkle spin/pulse animation */
          @keyframes sparkleOccasional {
            0%, 70%, 100% {
              transform: rotate(0deg) scale(1);
            }
            75% {
              transform: rotate(45deg) scale(1.15);
            }
            80% {
              transform: rotate(90deg) scale(1);
            }
            85% {
              transform: rotate(135deg) scale(1.15);
            }
            90% {
              transform: rotate(180deg) scale(1);
            }
          }
          .animate-sparkle-occasional {
            display: inline-block;
            animation: sparkleOccasional 10s infinite ease-in-out;
          }
        `}} />

        <div className="relative group flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <h1 
              onClick={handleTimerClick}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              onTouchCancel={handleMouseUp}
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums whitespace-nowrap cursor-pointer select-none active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-[0.5px] ${
                timerStyle === 'zen-breathe' ? 'timer-zen-breathe font-semibold' :
                timerStyle === 'aurora' ? 'timer-aurora font-bold' :
                timerStyle === 'kyoto' ? 'timer-kyoto-box' :
                timerStyle === 'moonlight' ? 'timer-moonlight font-bold' :
                timerStyle === 'sandglass' ? 'timer-sandglass font-bold' :
                timerStyle === 'harmonic' ? 'select-none' :
                timerStyle === 'nixie' ? 'timer-nixie-wrapper text-amber-500' :
                timerStyle === 'matrix' ? 'timer-matrix-wrapper text-emerald-400' :
                timerStyle === 'digital' ? 'timer-digital-wrapper' :
                timerStyle === 'handwritten' ? 'timer-handwritten-text text-slate-800 dark:text-emerald-300' :
                timerStyle === 'minimal' ? 'font-mono text-slate-700 dark:text-slate-300 font-semibold' :
                timerStyle === 'threed' ? 'animate-breathing ' + (globalBlackout ? 'opacity-5' : '') :
                timerStyle === 'leather-gold' ? 'timer-leather-gold-box' :
                timerStyle === 'obsidian-glow' ? 'timer-obsidian-glow-box' :
                timerStyle === 'parchment' ? 'timer-parchment-box' :
                timerStyle === 'nordic-frost' ? 'timer-nordic-frost-box' :
                `${accentThemeInfo.gradientClass}`
              }`}
              title="Затисніть для вибору стилю циферблату."
            >
              {timerStyle === 'harmonic' ? (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 select-none">
                  {days > 0 && (
                    <div className="flex flex-col items-center px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
                      <span className="text-xl sm:text-2xl font-bold font-['Marcellus',serif] text-slate-800 dark:text-zinc-100 leading-none">{days}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-1 font-sans">днів</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
                    <span className="text-xl sm:text-2xl font-bold font-['Marcellus',serif] text-slate-800 dark:text-zinc-100 leading-none">{hours}</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-1 font-sans">год</span>
                  </div>
                  <span className="text-slate-400/60 dark:text-zinc-500/60 font-serif text-lg leading-none">:</span>
                  <div className="flex flex-col items-center px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
                    <span className="text-xl sm:text-2xl font-bold font-['Marcellus',serif] text-slate-800 dark:text-zinc-100 leading-none">{minutes}</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-1 font-sans">хв</span>
                  </div>
                  <span className="text-slate-400/60 dark:text-zinc-500/60 font-serif text-lg leading-none">:</span>
                  <div className="flex flex-col items-center px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
                    <span className="text-xl sm:text-2xl font-bold font-['Marcellus',serif] text-slate-800 dark:text-zinc-100 leading-none">{seconds}</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-1 font-sans">сек</span>
                  </div>
                </div>
              ) : timerStyle === 'threed' ? (
                humanQuitTimeText.split('').map((char, index) => {
                  const isFlickering = flickerActive && flickeringIndices.includes(index);
                  const isExtinguished = flickerActive && extinguishedIndices.includes(index);
                  let charClass = 'timer-3d inline-block font-black';
                  if (isExtinguished) charClass = 'opacity-10 inline-block font-black';
                  else if (isFlickering) charClass = 'timer-3d opacity-40 inline-block font-black';
                  return (
                    <span key={index} className={charClass}>
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  );
                })
              ) : timerStyle === 'digital' ? (
                <span>{digitalTimeText}</span>
              ) : timerStyle === 'nixie' ? (
                <span className="timer-nixie-char">{humanQuitTimeText}</span>
              ) : timerStyle === 'matrix' ? (
                <span className="timer-matrix-char">{humanQuitTimeText}</span>
              ) : (
                <span>{humanQuitTimeText}</span>
              )}
            </h1>

            {/* Напівпрозора кнопка-шестерня ліворуч від таймера */}
            <button
              type="button"
              onClick={() => setShowStyleModal(true)}
              className="absolute -left-7 sm:-left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-300 dark:text-slate-200 hover:text-slate-100 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 opacity-90 hover:opacity-100 cursor-pointer active:scale-90"
              title="Оберіть естетику часу"
              aria-label="Оберіть естетику часу"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-gear-occasional" />
            </button>

            {/* Красива кнопка-іскорка праворуч від таймера */}
            <button
              type="button"
              onClick={() => setIsZenMode(true)}
              className="absolute -right-7 sm:-right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-300 dark:text-slate-200 hover:text-slate-100 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 opacity-90 hover:opacity-100 cursor-pointer active:scale-90"
              title="Режим дзен: спокій та занурення"
              aria-label="Увімкнути режим дзен"
            >
              <Sparkle className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-sparkle-occasional" />
            </button>
          </div>
        </div>



        {/* Current active time achievement badge under timer */}
        {!hideStars && (() => {
          const totalHours = diffMs / (3600 * 1000);
          const unlocked = TIME_ACHIEVEMENTS.filter((ach) => totalHours >= ach.hours);
          const targetBadge = TIME_ACHIEVEMENTS.find((ach) => totalHours < ach.hours) || TIME_ACHIEVEMENTS[TIME_ACHIEVEMENTS.length - 1];
          const isAllUnlocked = unlocked.length === TIME_ACHIEVEMENTS.length;

          // Progress calculation: percentage toward this milestone
          const progressPct = isAllUnlocked
            ? 100
            : Math.min(100, Math.max(0, Math.round((totalHours / targetBadge.hours) * 100)));

          return (
            <div className="mt-3.5 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setIsJourneyMapOpen(true)}
                className="relative overflow-hidden group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-800/90 hover:border-zinc-700/90 shadow-sm transition-all duration-200 cursor-pointer active:scale-95 text-left"
                title="Відкрити часові досягнення"
              >
                {/* Subtle progress fill */}
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500/15 border-r border-emerald-500/30 transition-all duration-500 pointer-events-none"
                  style={{ width: `${progressPct}%` }}
                />

                <span className="relative z-10 w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

                <span className="relative z-10 text-xs font-medium text-zinc-300 tabular-nums">
                  {isAllUnlocked ? (
                    <span className="text-emerald-400 font-semibold">Усі досягнення: 100%</span>
                  ) : (
                    <span>
                      <span className="text-zinc-200 font-semibold">{targetBadge.title}</span>
                      <span className="text-zinc-500 mx-1">:</span>
                      <span className="font-mono text-emerald-400 font-bold">{progressPct}%</span>
                    </span>
                  )}
                </span>

                <span className="relative z-10 text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  →
                </span>
              </button>
            </div>
          );
        })()}

        {/* ПРИЧИНИ КИНУТИ ПАЛИТИ ПІД ТАЙМЕРОМ */}
        <div className="mt-4 w-full flex flex-col items-start gap-2">
          {/* Причина кинути (клікабельна для відкриття модалки або перемикання) */}
          <div className="w-full">
            {reasons.length > 0 ? (
              <div 
                onClick={() => setIsMotivationsModalOpen(true)}
                className="w-full text-center cursor-pointer group relative py-1.5 px-4 rounded-xl hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-all"
                title="Натисніть для редагування цитат"
              >
                <p className={`text-xs font-medium text-slate-700 dark:text-[#f4f4f5] italic transition-colors group-hover:${getAccentTextClass(accent)} inline-flex items-center gap-1.5 justify-center`}>
                  <span>«{currentReason}»</span>
                  <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity flex-none" />
                </p>
                {reasons.length > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-80 transition-opacity">
                    {reasons.slice(0, 6).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentReasonIdx(idx);
                        }}
                        className={`h-1 rounded-full transition-all cursor-pointer ${
                          idx === currentReasonIdx % reasons.length
                            ? 'bg-emerald-500 w-3'
                            : 'bg-slate-300 dark:bg-slate-600 w-1 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={() => setIsMotivationsModalOpen(true)}
                className="w-full text-center cursor-pointer group py-1.5 px-4 rounded-xl hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-all"
                title="Додати власні мотиваційні цитати"
              >
                <span className="text-xs text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5">
                  <Edit3 className="w-3 h-3 opacity-70" />
                  <span>Додати особисті мотиваційні цитати</span>
                </span>
              </div>
            )}
          </div>

          {/* Індикатори (ліворуч) та Статус (праворуч) */}
            <div className="w-full flex items-center justify-between mt-4">
              <div 
                className={`indicators-container ${indicatorStyle.includes('tiles') ? '' : 'flex-wrap flex'}`}
                data-indicator-style={indicatorStyle}
              >
                {/* Гідратація */}
                {hydrationState.showIndicator && (
                  <button
                    type="button"
                    onClick={() => setIsHydrationOpen(true)}
                    className={`indicator-button flex items-center gap-1.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold font-mono border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      hydrationState.isLow
                        ? 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/30 text-rose-600 dark:text-rose-400'
                        : 'bg-sky-500/10 dark:bg-sky-950/30 border-sky-500/30 text-sky-600 dark:text-sky-400'
                    }`}
                    title={`Випито ${hydrationState.ml} з ${hydrationState.goal} мл (${hydrationState.pct}%). Натисніть для перегляду.`}
                  >
                    <span className="text-[10px]">💧</span>
                    <span>{hydrationState.pct}%</span>
                  </button>
                )}

                {/* Щоденні кроки */}
                {(() => {
                  const STEPS_STORAGE_KEY = 'quit-smoking:daily-micro-steps';
                  const HISTORY_STORAGE_KEY = 'quit-smoking:daily-steps-history';
                  const SHOW_INDICATOR_KEY = 'quit-smoking:daily-steps-show-indicator';
                  
                  let total = 0;
                  let done = 0;
                  let show = true;
                  let pct = 0;
                  
                  try {
                    const savedSteps = localStorage.getItem(STEPS_STORAGE_KEY);
                    const steps = savedSteps ? JSON.parse(savedSteps) : [];
                    total = steps.length;
                    
                    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
                    const history = savedHistory ? JSON.parse(savedHistory) : {};
                    const savedShow = localStorage.getItem(SHOW_INDICATOR_KEY);
                    show = savedShow !== null ? savedShow === 'true' : true;
                    
                    const d = new Date();
                    const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const todayDone = history[todayKey] || [];
                    done = steps.filter((s: any) => todayDone.includes(s.id)).length;
                    pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  } catch {}

                  if (total === 0 || !show) return null;

                  let indicatorClass = 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400';
                  if (pct >= 0 && pct <= 20) {
                    indicatorClass = 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/30 text-rose-600 dark:text-rose-400';
                  } else if (pct >= 50 && pct <= 80) {
                    indicatorClass = 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30 text-amber-600 dark:text-amber-400';
                  } else if (pct > 80) {
                    indicatorClass = 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
                  } else {
                    indicatorClass = 'bg-orange-500/10 dark:bg-orange-950/30 border-orange-500/30 text-orange-600 dark:text-orange-400';
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => setIsStepsOpen(true)}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold font-mono border transition-all cursor-pointer shadow-2xs active:scale-95 ${indicatorClass}`}
                      title={`Виконано ${done} з ${total} щоденних справ (${pct}%). Натисніть для перегляду.`}
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span>{done}/{total}</span>
                    </button>
                  );
                })()}

                {/* Ментальне здоров'я */}
                {mentalHealthState.showIndicator && (() => {
                  const pct = mentalHealthState.pct;
                  let colorClass = 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/30 text-rose-600 dark:text-rose-400';
                  if (pct >= 20 && pct < 80) {
                    colorClass = 'bg-indigo-500/10 dark:bg-indigo-950/30 border-indigo-500/30 text-indigo-600 dark:text-indigo-400';
                  } else if (pct >= 80) {
                    colorClass = 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => setIsMentalHealthOpen(true)}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold font-mono border transition-all cursor-pointer shadow-2xs active:scale-95 ${colorClass}`}
                      title={`Індекс ментального ресурсу: ${pct}%. Натисніть для відкриття щоденника та практик.`}
                    >
                      <Brain className="w-3 h-3" />
                      <span>{pct}%</span>
                    </button>
                  );
                })()}

                {/* Щоденник вдячності */}
                {gratitudeState.showIndicator && (() => {
                  const count = gratitudeState.count;
                  const isDone = gratitudeState.isCompleted;
                  let colorClass = 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30 text-amber-600 dark:text-amber-400';
                  if (isDone) {
                    colorClass = 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => setIsGratitudeOpen(true)}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold font-mono border transition-all cursor-pointer shadow-2xs active:scale-95 ${colorClass}`}
                      title={`Щоденник вдячності: ${count}/3 заповнено. Натисніть для відкриття.`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{count}/3</span>
                    </button>
                  );
                })()}

                {/* Pair: Docked Goal and Quick Goal */}
                <div className="flex items-center gap-1.5">
                  {isGoalsDocked && (() => {
                    const activeGoals = goals?.queue || [];
                    const activeGoal = activeGoals.length > 0 ? activeGoals[0] : null;
                    const netSaved = Math.max(0, totalSaved - (goals?.base || 0));
                    const amount = activeGoal?.amount || 0;
                    const pct = amount > 0 ? Math.min(100, Math.floor((netSaved / amount) * 100)) : 0;
                    return (
                      <div className="flex items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold font-mono border bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setIsGoalModalOpen(true)}
                          className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                          title={`Ціль: ${activeGoal ? activeGoal.name : 'Немає'} (${pct}%). Натисніть для відкриття.`}
                        >
                          <Gift className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Ціль: {pct}%</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsGoalsDocked(false);
                            try {
                              localStorage.setItem('quit-smoking:goals-docked', 'false');
                              window.dispatchEvent(new Event('goals-docked-change'));
                              window.dispatchEvent(new Event('storage'));
                            } catch {}
                          }}
                          className="ml-1 p-0.5 hover:bg-amber-500/20 rounded-md text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                          title="Розгорнути ціль"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })()}

                  {/* Docked Quick Goal Indicator */}
                  {isQuickGoalDocked && (() => {
                    let text = "Швидка";
                    let titleAttr = "Швидка ціль. Натисніть для відкриття.";
                    
                    if (quickGoalData) {
                      const isFailed = Boolean(
                        startDate && startDate > quickGoalData.createdAt && !quickGoalData.isCompleted
                      );
                      const timeLeftMs = Math.max(0, quickGoalData.targetTime - quickGoalNow);
                      const isReached = quickGoalNow >= quickGoalData.targetTime;

                      if (isFailed) {
                        text = "Зрив 💔";
                        titleAttr = "Швидку ціль провалено через зрив. Натисніть для скидання.";
                      } else if (isReached) {
                        text = "Готово 🎁";
                        titleAttr = "Швидку ціль досягнуто! Натисніть, щоб забрати винагороду.";
                      } else {
                        const totalSecs = Math.floor(timeLeftMs / 1000);
                        const h = Math.floor(totalSecs / 3600);
                        const m = Math.floor((totalSecs % 3600) / 60);
                        const s = totalSecs % 60;
                        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
                        const timeStr = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
                        
                        text = `Швидка: ${timeStr}`;
                        titleAttr = `Швидка ціль: ${quickGoalData.title}. Залишилось ${timeStr}. Натисніть для перегляду.`;
                      }
                    } else {
                      text = "Швидка: +Ціль";
                      titleAttr = "Немає активної швидкої цілі. Натисніть для створення.";
                    }

                    return (
                      <div className="flex items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold font-mono border bg-fuchsia-500/10 dark:bg-fuchsia-950/30 border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(new Event('open-quick-goal-modal'));
                          }}
                          className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                          title={titleAttr}
                        >
                          <Zap className="w-3 h-3 text-fuchsia-500 shrink-0" />
                          <span>{text}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsQuickGoalDocked(false);
                            try {
                              localStorage.setItem('quit-smoking:quick-goal-docked', 'false');
                              window.dispatchEvent(new Event('quick-goal-docked-change'));
                              window.dispatchEvent(new Event('storage'));
                            } catch {}
                          }}
                          className="ml-1 p-0.5 hover:bg-fuchsia-500/20 rounded-md text-slate-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                          title="Розгорнути швидку ціль"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Docked Health Recovery Indicator */}
                {isHealthDocked && (() => {
                  const allSystems = getBodySystemsRecovery(diffMs);
                  const avgRecovery = Math.round(allSystems.reduce((acc, s) => acc + s.progress, 0) / allSystems.length);
                  return (
                    <div className="flex items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold font-mono border bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                      <button
                        type="button"
                        onClick={handleHealthClick}
                        className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                        title={`Відновлення організму: ${avgRecovery}%. Натисніть для детального перегляду.`}
                      >
                        <HeartPulse className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Здоров'я: {avgRecovery}%</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsHealthDocked(false);
                          try {
                            localStorage.setItem('quit-smoking:health-docked', 'false');
                            window.dispatchEvent(new Event('health-docked-change'));
                            window.dispatchEvent(new Event('storage'));
                          } catch {}
                        }}
                        className="ml-1 p-0.5 hover:bg-emerald-500/20 rounded-md text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                        title="Розгорнути віджет відновлення"
                      >
                        <Maximize2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Статус відновлення */}
            </div>
          </div>
        </div>

      {/* 1. ЄДИНИЙ ЛАКОНІЧНИЙ БЛОК: ЗБЕРЕЖЕНІ РЕСУРСИ (ГРОШІ, ЧАС, ТЮТЮН) */}
      <div className="mt-4 mb-4 p-3.5 bg-white/80 dark:bg-[#18181c]/80 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs backdrop-blur-xs">
        {/* 3 головні показники: Заощаджено, Вільного часу, Не викурено */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
          {/* 1. Заощаджено */}
          <button
            type="button"
            onClick={() => setIsSavedResourcesModalOpen(true)}
            className="flex flex-col justify-between items-center p-2.5 sm:p-3 bg-slate-50/70 dark:bg-[#141418]/70 hover:bg-white dark:hover:bg-[#1a1a20] border border-slate-200/70 dark:border-zinc-800/70 hover:border-amber-500/40 dark:hover:border-amber-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] text-center"
            title="Натисніть для налаштування вартості пачки та розрахунку заощаджень"
          >
            <div className="flex items-center justify-center gap-1 text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors mb-1 w-full text-center leading-tight">
              <Coins className="w-3 h-3 text-amber-500/80 dark:text-amber-400/80 flex-none" />
              <span className="break-words">Заощаджено</span>
            </div>
            
            <div className="my-auto py-1 w-full flex items-center justify-center">
              <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${getAccentTextClass(accent)} block truncate`}>
                {Math.floor(totalSaved).toLocaleString('uk-UA')}&nbsp;₴
              </span>
            </div>
            
            <div className="mt-1 pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/60 w-full">
              <span className="text-[9.5px] sm:text-[10px] font-medium text-slate-500 dark:text-zinc-400 block truncate" title={`Прогноз економії за 1 рік: ~${Math.round(costPerYear).toLocaleString('uk-UA')} ₴`}>
                ~{Math.round(costPerYear).toLocaleString('uk-UA')}&nbsp;₴/рік
              </span>
            </div>
          </button>

          {/* 2. Вільного часу */}
          <button
            type="button"
            onClick={() => setIsSavedResourcesModalOpen(true)}
            className="flex flex-col justify-between items-center p-2.5 sm:p-3 bg-slate-50/70 dark:bg-[#141418]/70 hover:bg-white dark:hover:bg-[#1a1a20] border border-slate-200/70 dark:border-zinc-800/70 hover:border-sky-500/40 dark:hover:border-sky-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] text-center"
            title="Натисніть для налаштування часу на одну сигарету"
          >
            <div className="flex items-center justify-center gap-1 text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors mb-1 w-full text-center leading-tight">
              <Hourglass className="w-3 h-3 text-sky-500/80 dark:text-sky-400/80 flex-none" />
              <span className="break-words">Вільного часу</span>
            </div>
            
            <div className="my-auto py-1 w-full flex items-center justify-center">
              <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${getAccentTextClass(accent)} block truncate`}>
                {returnedTimeData.timeText}
              </span>
            </div>
            
            <div className="mt-1 pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/60 w-full">
              <span className="text-[9.5px] sm:text-[10px] font-medium text-slate-500 dark:text-zinc-400 block truncate" title={`Час за 1 рік: ~${returnedTimeData.yearlyHoursText} (${returnedTimeData.booksText})`}>
                ~{returnedTimeData.yearlyHoursText}
              </span>
            </div>
          </button>

          {/* 3. Не викурено */}
          <button
            type="button"
            onClick={() => setIsSavedResourcesModalOpen(true)}
            className="flex flex-col justify-between items-center p-2.5 sm:p-3 bg-slate-50/70 dark:bg-[#141418]/70 hover:bg-white dark:hover:bg-[#1a1a20] border border-slate-200/70 dark:border-zinc-800/70 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] text-center"
            title="Натисніть для налаштування кількості сигарет на день та у пачці"
          >
            <div className="flex items-center justify-center gap-1 text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors mb-1 w-full text-center leading-tight">
              <ShieldCheck className="w-3 h-3 text-emerald-500/80 dark:text-emerald-400/80 flex-none" />
              <span className="break-words">Не викурено</span>
            </div>
            
            <div className="my-auto py-1 w-full flex items-center justify-center">
              <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${getAccentTextClass(accent)} block truncate`}>
                {Math.floor(cigsAvoided).toLocaleString('uk-UA')}&nbsp;<span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">шт</span>
              </span>
            </div>
            
            <div className="mt-1 pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/60 w-full">
              <span className={`text-[9.5px] sm:text-[10px] font-medium ${getAccentTextClass(accent)} block truncate`} title={`Упаковок сигарет: ${packsAvoidedText}`}>
                ~{packsAvoidedText}
              </span>
            </div>
          </button>
        </div>

        {/* 2. БЛОК: ЦІЛЬ ТА ІНДИКАТОРИ */}
        {!isGoalsDocked && (() => {
          const activeGoals = goals?.queue || [];
          const netSaved = Math.max(0, totalSaved - (goals?.base || 0));

          if (isCompactGoals) {
            if (activeGoals.length === 0) {
              return (
                <div className="mt-3">
                  <div
                    onClick={() => setIsGoalModalOpen(true)}
                    className="w-full py-1.5 px-2.5 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-amber-950/30 border border-amber-400/30 dark:border-amber-500/20 rounded-xl hover:border-amber-500/50 transition-all text-left relative overflow-hidden cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1.5 relative z-10 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Натисніть, щоб додати ціль ✨</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompactGoals();
                      }}
                      className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer rounded-lg hover:bg-amber-500/10 transition-colors"
                      title="Розгорнути ціль"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            const primaryGoal = activeGoals[0];
            const amount = primaryGoal?.amount || 0;
            const pct = amount > 0 ? Math.min(100, Math.floor((netSaved / amount) * 100)) : 0;
            const isGoalReached = pct >= 100;

            return (
              <div className="mt-3">
                <div
                  className={`w-full py-1.5 px-2.5 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-amber-950/30 border ${
                    isGoalReached
                      ? 'border-emerald-500/60 shadow-xs animate-pulse'
                      : 'border-amber-400/30 dark:border-amber-500/20'
                  } rounded-xl transition-all hover:border-amber-500/50 text-left relative overflow-hidden flex items-center justify-between gap-2`}
                >
                  <div
                    onClick={() => setIsGoalModalOpen(true)}
                    className="flex items-center gap-1.5 min-w-0 flex-1 relative z-10 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-[#f4f4f5] truncate">
                      {primaryGoal.name}
                    </span>
                    {amount > 0 && (
                      <div className="w-12 h-1 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isGoalReached
                              ? 'bg-emerald-400 animate-pulse'
                              : 'bg-gradient-to-r from-amber-500 to-rose-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 relative z-10">
                    {amount > 0 && (
                      <div className="font-mono text-[10px] font-bold flex items-center gap-1">
                        <span className="text-amber-600 dark:text-amber-400">{pct}%</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {netSaved.toLocaleString('uk-UA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / {amount.toLocaleString('uk-UA')} ₴
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompactGoals();
                      }}
                      className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer rounded-lg hover:bg-amber-500/10 transition-colors ml-0.5"
                      title="Розгорнути ціль"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsGoalsDocked(true);
                        try {
                          localStorage.setItem('quit-smoking:goals-docked', 'true');
                          window.dispatchEvent(new Event('goals-docked-change'));
                          window.dispatchEvent(new Event('storage'));
                        } catch {}
                      }}
                      className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer rounded-lg hover:bg-amber-500/10 transition-colors ml-0.5"
                      title="Мінімізувати до індикатора"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          const activeGoal = activeGoals.length > 0 ? activeGoals[0] : null;
          const amount = activeGoal?.amount || 0;
          const pct = amount > 0 ? Math.min(100, Math.floor((netSaved / amount) * 100)) : 0;
          const isGoalReached = pct >= 100;

          // Estimate target accumulation date
          const dailyRate = money ? (money.perDay / (money.packSize || 20)) * money.packPrice : 0;
          const remainingAmount = Math.max(0, amount - netSaved);
          
          let estDateText = '';
          if (isGoalReached) {
            estDateText = '🎉 Мета вже накопичена!';
          } else if (remainingAmount > 0 && dailyRate > 0) {
            const daysLeft = Math.ceil(remainingAmount / dailyRate);
            const targetDate = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000);
            const formattedTargetDate = targetDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
            
            const daysWord = (d: number) => {
              const m10 = d % 10;
              const m100 = d % 100;
              if (m100 >= 11 && m100 <= 14) return 'днів';
              if (m10 === 1) return 'день';
              if (m10 >= 2 && m10 <= 4) return 'дні';
              return 'днів';
            };

            estDateText = `Очікувана дата: ~${formattedTargetDate} (ще ~${daysLeft} ${daysWord(daysLeft)})`;
          }

          return (
            <div
              onClick={() => setIsGoalModalOpen(true)}
              className={`w-full mt-3 p-3.5 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-rose-950/30 dark:to-amber-950/40 border ${
                isGoalReached
                  ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10 animate-pulse'
                  : 'border-amber-400/40 dark:border-amber-500/30 shadow-xs'
              } rounded-2xl transition-all hover:scale-[1.01] hover:shadow-md active:scale-[0.98] text-left relative overflow-hidden group cursor-pointer`}
            >
              {/* Festive background glowing gradient accent */}
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-[#f4f4f5]">
                    Ціль
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGoalsDocked(true);
                    try {
                      localStorage.setItem('quit-smoking:goals-docked', 'true');
                      window.dispatchEvent(new Event('goals-docked-change'));
                      window.dispatchEvent(new Event('storage'));
                    } catch {}
                  }}
                  className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer rounded-lg hover:bg-amber-500/10 transition-colors"
                  title="Мінімізувати до індикатора"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeGoal ? (
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-[#f4f4f5] truncate">
                      {activeGoal.name}
                    </span>
                    {amount > 0 && (
                      <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300">
                        {amount.toLocaleString('uk-UA')} ₴
                      </span>
                    )}
                  </div>

                  {amount > 0 && (
                    <div>
                      <div className="w-full h-2 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isGoalReached
                              ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 animate-pulse'
                              : 'bg-gradient-to-r from-amber-500 via-rose-400 to-amber-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[10px]">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          {netSaved.toLocaleString('uk-UA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ₴ з {amount.toLocaleString('uk-UA')} ₴
                        </span>
                        <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                          {pct}%
                        </span>
                      </div>

                      {estDateText && (
                        <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500 flex-none" />
                          <span>{estDateText}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-amber-700 dark:text-amber-300/80 italic flex items-center gap-1 relative z-10">
                  <span>✨ Натисніть, щоб обрати бажану ціль або подарунок</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* ШВИДКА ЦІЛЬ (ДО 24 ГОДИН) */}
        {!isQuickGoalDocked && <QuickGoalCard accent={accent} startDate={startDate} />}

        {/* ЄДИНИЙ ЗАГАЛЬНИЙ ВІДЖЕТ ВІДНОВЛЕННЯ ЗДОРОВ'Я ТА МЕДИЧНИХ ЕТАПІВ */}
        {!isHealthDocked && (
          <HealthRecoveryWidget
            diffMs={diffMs}
            startDate={startDate}
            accent={accent}
            onOpenFullHealth={handleHealthClick}
            isDocked={isHealthDocked}
            onDockChange={(docked) => {
              setIsHealthDocked(docked);
              try {
                localStorage.setItem('quit-smoking:health-docked', String(docked));
                window.dispatchEvent(new Event('health-docked-change'));
                window.dispatchEvent(new Event('storage'));
              } catch {}
            }}
          />
        )}
      </div>

      {/* МЕДИТАТИВНІ ПРОСТОРИ / СВІТИ ДЛЯ ЗАНУРЕННЯ (В ЄДИНОМУ СТИЛІ) */}
      <div className="space-y-3 mb-6">
        <div className="px-1 flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-widest uppercase text-slate-400 dark:text-zinc-500">
            Медитативні простори
          </span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-600 font-mono">
            бути в моменті
          </span>
        </div>

        {gamesList.map((game, index) => {
          const playtime = gamePlaytimes[game.id] || 0;
          
          const getPopularityBadge = (idx: number) => {
            if (idx === 0) {
              return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/10 dark:from-amber-400/20 dark:via-yellow-300/25 dark:to-amber-500/10 border border-amber-400/50 dark:border-amber-400/40 text-amber-700 dark:text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)] select-none">
                  🥇 Top 1
                </span>
              );
            }
            if (idx === 1) {
              return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-400/20 via-slate-300/25 to-slate-400/10 dark:from-slate-400/20 dark:via-slate-300/25 dark:to-slate-400/10 border border-slate-400/50 dark:border-slate-400/40 text-slate-700 dark:text-slate-300 shadow-[0_0_8px_rgba(148,163,184,0.18)] select-none">
                  🥈 Top 2
                </span>
              );
            }
            if (idx === 2) {
              return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-700/20 via-amber-700/25 to-orange-700/10 dark:from-orange-600/20 dark:via-amber-600/25 dark:to-orange-700/10 border border-orange-600/50 dark:border-orange-500/40 text-orange-700 dark:text-orange-400 shadow-[0_0_8px_rgba(234,88,12,0.18)] select-none">
                  🥉 Top 3
                </span>
              );
            }
            return null;
          };

          return (
            <button
              key={game.id}
              type="button"
              onClick={() => handlePlayGame(game.id)}
              className={`w-full p-4 rounded-3xl ${game.bgClass} transition-all duration-300 cursor-pointer text-left relative overflow-hidden group active:scale-[0.99]`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {getPopularityBadge(index)}
                    <h3 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-zinc-200">
                      {game.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-2 font-normal">
                    {game.desc}
                  </p>
                  <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors">
                    <span>Ви грали в цю гру {playtime}хв</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className={`w-16 h-16 rounded-2xl ${game.iconBgClass} flex items-center justify-center flex-none`}>
                  {game.icon}
                </div>
              </div>
            </button>
          );
        })}
      </div>





      {/* Festive Toast Notification when Savings Reach Active Goal */}
      {goalToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl shadow-2xl border-2 border-amber-300 dark:border-amber-400 animate-bounce-short flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0 shadow-inner">
              🎉
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ціль накопичено!</span>
              </div>
              <h4 className="text-xs sm:text-sm font-black truncate text-white">
                «{goalToast.goalName}» ({goalToast.amount.toLocaleString('uk-UA')} ₴)
              </h4>
              <p className="text-[10px] text-amber-100 font-medium leading-tight">
                Вітаємо! Сума вашої цілі повністю заощаджена!
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setGoalToast(null);
                setIsGoalModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white text-amber-900 rounded-xl font-extrabold text-[11px] shadow-sm hover:bg-amber-50 cursor-pointer transition-colors"
            >
              Відкрити
            </button>
            <button
              type="button"
              onClick={() => setGoalToast(null)}
              className="p-1 text-white/80 hover:text-white cursor-pointer self-center"
              title="Закрити"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <IndicatorSettingsModal
        isOpen={isIndicatorSettingsOpen}
        onClose={() => setIsIndicatorSettingsOpen(false)}
        displayStyle={indicatorStyle}
        onSave={saveIndicatorStyle}
      />
      <JourneyMapModal
        isOpen={isJourneyMapOpen}
        onClose={() => setIsJourneyMapOpen(false)}
        achievements={TIME_ACHIEVEMENTS}
        totalHours={diffMs / (3600 * 1000)}
      />

      {isHydrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-50 dark:bg-[#121212] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative">
            <button
              onClick={() => setIsHydrationOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
              title="Закрити"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">
              <HydrationCard onUpdate={handleUpdate} />
            </div>
          </div>
        </div>
      )}

      {isStepsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-50 dark:bg-[#121212] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative">
            <button
              onClick={() => setIsStepsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
              title="Закрити"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">
              <DailyStepsSection isOpen={true} onToggle={() => {}} onUpdate={handleUpdate} />
            </div>
          </div>
        </div>
      )}

      {/* 5-minute activity proposal modal for daily steps */}
      <DailyStepsPromptModal
        isOpen={isStepsPromptOpen}
        onClose={() => setIsStepsPromptOpen(false)}
        onSaveSteps={() => {
          handleUpdate();
        }}
      />

      {isMentalHealthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-[#121212] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative my-auto">
            <button
              onClick={() => setIsMentalHealthOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
              title="Закрити"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">
              <MentalHealthCard onUpdate={handleUpdate} />
            </div>
          </div>
        </div>
      )}

      {isGratitudeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-[#121212] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative my-auto">
            <button
              onClick={() => setIsGratitudeOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
              title="Закрити"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">
              <GratitudeJournalCard onUpdate={handleUpdate} />
            </div>
          </div>
        </div>
      )}

      {goals && (
        <GoalSettingsModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          goals={goals}
          totalSaved={totalSaved}
          money={money}
          onAddGoal={onAddGoal || (() => {})}
          onCompleteGoal={onCompleteGoal || (() => {})}
          onDeleteGoal={onDeleteGoal || (() => {})}
        />
      )}

      {/* Модальне вікно редагування мотиваційних фраз та стилів */}
      <MotivationalPhrasesModal
        isOpen={isMotivationsModalOpen}
        onClose={() => setIsMotivationsModalOpen(false)}
        reasons={reasons}
        onSaveReasons={(newReasons) => {
          onUpdateReasons?.(newReasons);
          try {
            localStorage.setItem('quit-smoking:reasons', JSON.stringify(newReasons));
            window.dispatchEvent(new Event('storage'));
          } catch {}
        }}
        currentStyle={motivationStyle}
        onStyleChange={handleStyleChange}
        autoRotate={autoRotateMotivations}
        onAutoRotateChange={handleAutoRotateChange}
        accent={accent}
      />

      {/* Модальне вікно параметрів розрахунку збережених ресурсів */}
      <SavedResourcesSettingsModal
        isOpen={isSavedResourcesModalOpen}
        onClose={() => setIsSavedResourcesModalOpen(false)}
        money={money}
        onSave={(newMoney) => {
          onUpdateMoney?.(newMoney);
        }}
        accent={accent}
        startDate={startDate}
        longestStreakMs={longestStreakMs}
        streaks={streaks}
        onOpenSetup={onOpenSetup}
        onOpenRelapse={onOpenRelapse}
        onUndoLastRelapse={onUndoLastRelapse}
      />

      {/* PREMIUM BOTTOM DRAWER / SHEET DIAL SELECTOR (MOVED OUT OF 3D CONTAINER FOR VIEWPORT FREEDOM) */}
      {showStyleModal && (
        <div 
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn p-0 sm:p-4" 
          onClick={() => setShowStyleModal(false)}
        >
          <div 
            className="bg-white dark:bg-[#151518] border-t sm:border border-slate-200/90 dark:border-zinc-800/90 rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl transition-transform duration-300 animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Drag Handler Bar (Only visual for native feel) */}
            <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 mx-auto mb-4 shrink-0" />

            {/* Header */}
            <div className="flex justify-between items-start mb-3.5 px-1 shrink-0">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Циферблати свідомості</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100">
                  Оберіть естетику часу
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Медитативні циферблати допомагають заспокоїти розум та дихати свідомо
                </p>
              </div>
              <button 
                onClick={() => setShowStyleModal(false)} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 shrink-0"
                aria-label="Закрити"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Filter */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-zinc-900/60 rounded-xl mb-3.5 shrink-0 border border-slate-200/40 dark:border-zinc-800/40">
              <button
                type="button"
                onClick={() => setStyleFilter('all')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  styleFilter === 'all'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                Всі ({TIMER_STYLES.length})
              </button>
              <button
                type="button"
                onClick={() => setStyleFilter('meditative')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  styleFilter === 'meditative'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                🌿 Медіа ({TIMER_STYLES.filter(s => s.category === 'meditative').length})
              </button>
              <button
                type="button"
                onClick={() => setStyleFilter('classic')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  styleFilter === 'classic'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                ⚡ Класика ({TIMER_STYLES.filter(s => s.category === 'classic').length})
              </button>
            </div>

            {/* Styles List */}
            <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1 no-scrollbar pb-3">
              {TIMER_STYLES
                .filter(style => styleFilter === 'all' || style.category === styleFilter)
                .map((style) => {
                  const isSelected = timerStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        updateTimerStyle(style.id);
                        setShowStyleModal(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99] ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-[#1a1a1f] hover:bg-slate-50/50 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="text-2xl shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:scale-105 transition-transform shadow-2xs">
                          {style.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs sm:text-sm font-extrabold ${
                              isSelected 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-slate-800 dark:text-zinc-200'
                            }`}>
                              {style.name}
                            </span>
                            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/50">
                              {style.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug line-clamp-2">
                            {style.desc}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isSelected ? (
                          <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5.5 h-5.5 rounded-full border border-slate-300 dark:border-zinc-700 group-hover:border-emerald-400 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 shrink-0">
              <span>Оберіть улюблений дизайн</span>
              <button
                type="button"
                onClick={() => setShowStyleModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ЩОДЕННИК ВДЯЧНОСТІ */}
      {isGratitudeModalOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn p-0 sm:p-4"
          onClick={() => setIsGratitudeModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#151518] border-t sm:border border-slate-200/90 dark:border-zinc-800/90 rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl transition-transform duration-300 animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Drag Handler Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 mx-auto mb-4 shrink-0" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  Щоденник вдячності
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsGratitudeModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              <GratitudeJournalCard onUpdate={refreshIndicators} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ЩОДЕННІ СПРАВИ ТА МІКРО-КРОКИ */}
      {isDailyStepsModalOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn p-0 sm:p-4"
          onClick={() => setIsDailyStepsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#151518] border-t sm:border border-slate-200/90 dark:border-zinc-800/90 rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl transition-transform duration-300 animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Drag Handler Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 mx-auto mb-4 shrink-0" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  Щоденні справи та мікро-кроки
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDailyStepsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              <DailyStepsSection isOpen={true} onToggle={() => {}} onUpdate={refreshIndicators} />
            </div>
          </div>
        </div>
      )}

      {/* РЕЖИМ ДЗЕН: Стандартний фон, реалістична ніжна зірка (блакитно-червоно-фіолетове мерехтіння) */}
      {isZenMode && (
        <div
          onClick={() => setIsZenMode(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden bg-[#F8FAFC] dark:bg-[#121215]"
          style={{ animation: 'fadeIn 1.2s ease-out forwards' }}
          aria-label="Режим дзен"
        >
          {/* Реалістична ніжна мерехтлива зірка у центрі */}
          <div className="relative flex items-center justify-center pointer-events-none">
            {/* Тонкі дифракційні промені світла (притаманні справжнім зорям) */}
            <div className="absolute w-36 h-36 flex items-center justify-center zen-star-diffraction pointer-events-none">
              <div className="absolute w-full h-[0.75px] bg-gradient-to-r from-transparent via-sky-300/40 to-transparent blur-[0.3px]" />
              <div className="absolute h-full w-[0.75px] bg-gradient-to-b from-transparent via-purple-300/40 to-transparent blur-[0.3px]" />
              <div className="absolute w-2/3 h-[0.5px] rotate-45 bg-gradient-to-r from-transparent via-rose-300/25 to-transparent blur-[0.3px]" />
              <div className="absolute w-2/3 h-[0.5px] -rotate-45 bg-gradient-to-r from-transparent via-blue-300/25 to-transparent blur-[0.3px]" />
            </div>

            {/* М'яка розсіяна хроматична аура */}
            <div className="w-24 h-24 rounded-full blur-2xl opacity-40 zen-star-halo bg-radial from-violet-400/30 via-sky-400/20 to-transparent pointer-events-none" />

            {/* Крихітне, яскраве, живе ядро зірки (2.5px), що плавно дихає крізь спектр */}
            <div className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full zen-star-pinpoint" />
          </div>
        </div>
      )}
    </div>
  );
};
