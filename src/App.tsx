import React, { useState } from 'react';
import {
  TabType,
  MoneySettings,
  DayRating,
  Streak,
  GoalsState,
  TreeState,
  DragonState,
  ZenIslandState,
  OrbitVoyageState,
  SavingsGoal,
  CompletedGoal,
} from './types';
import { CounterTab } from './components/CounterTab';
import { HealthTab } from './components/HealthTab';
import { StateSurveyTab } from './components/StateSurveyTab';
import { TreeTab } from './components/TreeTab';
import { SandTab } from './components/SandTab';
import { CatTab } from './components/CatTab';
import { ZenIslandTab } from './components/ZenIslandTab';
import { OrbitVoyageTab } from './components/OrbitVoyageTab';
import { WaveTab } from './components/WaveTab';
import { BeaconTab } from './components/BeaconTab';
import { HarmonographTab } from './components/HarmonographTab';
import { CymaticsTab } from './components/CymaticsTab';
import { MusicStudioTab } from './components/MusicStudioTab';
import { CigaretteMonstersGameTab } from './components/CigaretteMonstersGameTab';
import { HydraulicPressTab } from './components/HydraulicPressTab';
import { LavaLampTab } from './components/LavaLampTab';
import { WhackACigTab } from './components/WhackACigTab';
import { EcoCityTab } from './components/EcoCityTab';
import { VacuumCleanerTab } from './components/VacuumCleanerTab';
import { BlockCrushTab } from './components/BlockCrushTab';
import { DartTargetTab } from './components/DartTargetTab';
import { MoreTab } from './components/MoreTab';
import { SosTab } from './components/SosTab';
import { SosModal } from './components/SosModal';
import { SetupModal, RelapseModal } from './components/Modals';
import { OnboardingModal } from './components/OnboardingModal';
import { StardustBackground } from './components/StardustBackground';
import { IntermediatePromptModal } from './components/IntermediatePromptModal';
import { calculateCigsAvoided, calculateTotalSaved } from './utils/moneyCalculator';
import {
  Clock,
  HeartPulse,
  Smile,
  Trees,
  Hourglass,
  MoreHorizontal,
  ShieldAlert
} from 'lucide-react';

const STORAGE_KEYS = {
  START: 'quit-smoking:start',
  MONEY: 'quit-smoking:money',
  DAYS: 'quit-smoking:days',
  STREAKS: 'quit-smoking:streaks',
  REASONS: 'quit-smoking:reasons',
  GOALS: 'quit-smoking:goals',
  TREE: 'quit-smoking:tree',
  DRAGON: 'quit-smoking:dragon',
  ZEN: 'quit-smoking:zen-island',
  ORBIT: 'quit-smoking:orbit',
  THEME: 'quit-smoking:theme',
  ACCENT: 'quit-smoking:accent'
};

const DEFAULT_REASONS: string[] = [];

export default function App() {
  const [accent, setAccent] = React.useState<string>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.ACCENT);
      if (v) return v;
    } catch {}
    return 'gray';
  });

  // Load initial state with safe localStorage parsing
  const [startDate, setStartDate] = React.useState<number>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.START);
      if (v) {
        const n = Number(v);
        if (isFinite(n) && n > 0) return n;
      }
    } catch {}
    // Default to 3 days ago if first open for friendly preview
    return Date.now() - 3 * 24 * 3600 * 1000;
  });

  const [money, setMoney] = React.useState<MoneySettings | null>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.MONEY);
      if (v) return JSON.parse(v);
    } catch {}
    return { perDay: 15, packPrice: 100, packSize: 20, cur: '₴' };
  });

  const [days, setDays] = React.useState<Record<string, DayRating>>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.DAYS);
      if (v) return JSON.parse(v);
    } catch {}
    return {};
  });

  const [streaks, setStreaks] = React.useState<Streak[]>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.STREAKS);
      if (v) return JSON.parse(v);
    } catch {}
    return [];
  });

  const [reasons, setReasons] = React.useState<string[]>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.REASONS);
      if (v) return JSON.parse(v);
    } catch {}
    return DEFAULT_REASONS;
  });

  const [goals, setGoals] = React.useState<GoalsState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (v) return JSON.parse(v);
    } catch {}
    return {
      base: 0,
      queue: [
        { id: 'g1', name: 'Бездротові навушники', amount: 2500 },
        { id: 'g2', name: 'Вікенд у горах', amount: 6000 }
      ],
      done: []
    };
  });

  const [treeState, setTreeState] = React.useState<TreeState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.TREE);
      if (v) return JSON.parse(v);
    } catch {}
    return { forest: [], current: null };
  });

  const [indicatorStyle, setIndicatorStyle] = useState<string>(() => {
    return localStorage.getItem('quit-smoking:indicator-style') || 'indicators';
  });
  const [economyMode, setEconomyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:economy-mode') === 'true';
    } catch {
      return false;
    }
  });

  // Persist indicator style and economy mode
  React.useEffect(() => {
    localStorage.setItem('quit-smoking:indicator-style', indicatorStyle);
  }, [indicatorStyle]);
  
  React.useEffect(() => {
    localStorage.setItem('quit-smoking:economy-mode', String(economyMode));
    document.documentElement.setAttribute('data-economy', String(economyMode));
  }, [economyMode]);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TREE, JSON.stringify(treeState));
    } catch {}
  }, [treeState]);

  const [dragonState, setDragonState] = React.useState<DragonState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.DRAGON);
      if (v) {
        const parsed = JSON.parse(v);
        return {
          ...parsed,
          level: parsed.level || 1,
          infernalDust: parsed.infernalDust || 0,
          dungeonFloor: parsed.dungeonFloor || 1,
          dungeonWins: parsed.dungeonWins || 0
        };
      }
    } catch {}
    return {
      name: 'Астрал',
      level: 1,
      energy: 85,
      stardust: 15,
      infernalDust: 0,
      dungeonFloor: 1,
      dungeonWins: 0,
      totalBreaths: 0,
      unlockedConstellations: [],
      relics: []
    };
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAGON, JSON.stringify(dragonState));
    } catch {}
  }, [dragonState]);

  // Real-time dynamic background gradient selection
  React.useEffect(() => {
    const getDynamicGradient = (hour: number, currentAccent: string): string => {
      switch (currentAccent) {
        case 'charcoal':
          if (hour >= 22 || hour < 6) return 'linear-gradient(135deg, #050506 0%, #0d0d10 50%, #010102 100%)';
          if (hour >= 6 && hour < 12) return 'linear-gradient(135deg, #111114 0%, #1e1e24 50%, #08080a 100%)';
          if (hour >= 12 && hour < 18) return 'linear-gradient(135deg, #18181c 0%, #2c2c35 50%, #0e0e11 100%)';
          return 'linear-gradient(135deg, #0f0e12 0%, #1d1c24 50%, #060608 100%)';
        case 'sage':
          if (hour >= 22 || hour < 6) return 'linear-gradient(135deg, #030605 0%, #0e1713 50%, #010201 100%)';
          if (hour >= 6 && hour < 12) return 'linear-gradient(135deg, #0d1613 0%, #1e2e28 50%, #08100d 100%)';
          if (hour >= 12 && hour < 18) return 'linear-gradient(135deg, #131d19 0%, #293d35 50%, #0c1512 100%)';
          return 'linear-gradient(135deg, #0e1212 0%, #1c2624 50%, #090e0e 100%)';
        case 'taupe':
          if (hour >= 22 || hour < 6) return 'linear-gradient(135deg, #050303 0%, #120e0b 50%, #010101 100%)';
          if (hour >= 6 && hour < 12) return 'linear-gradient(135deg, #14100d 0%, #26201b 50%, #0c0a08 100%)';
          if (hour >= 12 && hour < 18) return 'linear-gradient(135deg, #1c1714 0%, #352e28 50%, #120f0d 100%)';
          return 'linear-gradient(135deg, #161112 0%, #292022 50%, #0a0809 100%)';
        case 'slate-blue':
          if (hour >= 22 || hour < 6) return 'linear-gradient(135deg, #020408 0%, #091322 50%, #010204 100%)';
          if (hour >= 6 && hour < 12) return 'linear-gradient(135deg, #0b111f 0%, #18263c 50%, #070c14 100%)';
          if (hour >= 12 && hour < 18) return 'linear-gradient(135deg, #10192e 0%, #25395a 50%, #0a111f 100%)';
          return 'linear-gradient(135deg, #0e0a1f 0%, #1d193d 50%, #060412 100%)';
        case 'ash-olive':
          if (hour >= 22 || hour < 6) return 'linear-gradient(135deg, #030402 0%, #0e120b 50%, #010101 100%)';
          if (hour >= 6 && hour < 12) return 'linear-gradient(135deg, #0f120d 0%, #20271d 50%, #090c08 100%)';
          if (hour >= 12 && hour < 18) return 'linear-gradient(135deg, #151a12 0%, #2d3828 50%, #0d120d 100%)';
          return 'linear-gradient(135deg, #12120e 0%, #23251a 50%, #080906 100%)';
        case 'gray':
        default:
          if (hour >= 22 || hour < 6) return 'linear-gradient(135deg, #030406 0%, #0e1115 50%, #010203 100%)';
          if (hour >= 6 && hour < 12) return 'linear-gradient(135deg, #0f1218 0%, #202530 50%, #090d10 100%)';
          if (hour >= 12 && hour < 18) return 'linear-gradient(135deg, #151922 0%, #2e3545 50%, #0e1219 100%)';
          return 'linear-gradient(135deg, #100f18 0%, #201f30 50%, #08080f 100%)';
      }
    };

    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      let tod = 'afternoon';
      if (hour >= 22 || hour < 6) {
        tod = 'night';
      } else if (hour >= 6 && hour < 12) {
        tod = 'morning';
      } else if (hour >= 12 && hour < 18) {
        tod = 'afternoon';
      } else {
        tod = 'evening';
      }
      document.documentElement.setAttribute('data-time-of-day', tod);

      const gradient = getDynamicGradient(hour, accent);
      document.documentElement.style.setProperty('--bg-gradient', gradient);
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [accent]);

  const [zenState, setZenState] = React.useState<ZenIslandState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.ZEN);
      if (v) {
        const p = JSON.parse(v);
        return {
          totalSounds: p.totalSounds || 0,
          heardInTime: p.heardInTime || 0,
          harmonyScore: p.harmonyScore || 0,
          bestStreak: p.bestStreak || 0,
          cravingsDefeated: p.cravingsDefeated || 0,
          tremorsCalmed: p.tremorsCalmed || 0,
          butterfliesMet: p.butterfliesMet || 0,
          ghostsDispelled: p.ghostsDispelled || 0,
          soundEnabled: p.soundEnabled ?? true
        };
      }
    } catch {}
    return {
      totalSounds: 0,
      heardInTime: 0,
      harmonyScore: 0,
      bestStreak: 0,
      cravingsDefeated: 0,
      tremorsCalmed: 0,
      butterfliesMet: 0,
      ghostsDispelled: 0,
      soundEnabled: true
    };
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ZEN, JSON.stringify(zenState));
    } catch {}
  }, [zenState]);

  const [orbitState, setOrbitState] = React.useState<OrbitVoyageState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.ORBIT);
      if (v) return JSON.parse(v);
    } catch {}
    return {
      highScoreDistance: 0,
      totalFlights: 0,
      cravingsCleared: 0,
      oxygenCollected: 0,
      stardustCollected: 0,
      unlockedShips: ['ship-aurora'],
      selectedShipId: 'ship-aurora',
      soundEnabled: true
    };
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORBIT, JSON.stringify(orbitState));
    } catch {}
  }, [orbitState]);

  const theme = 'dark';

  const [activeTab, setActiveTab] = React.useState<TabType>('counter');
  const [isSosOpen, setIsSosOpen] = React.useState(false);

  React.useEffect(() => {
    if (isSosOpen) {
      setIsSosOpen(false);
      setActiveTab('sos');
    }
  }, [isSosOpen]);
  const [isSetupOpen, setIsSetupOpen] = React.useState(false);
  const [isRelapseOpen, setIsRelapseOpen] = React.useState(false);
  const [isIntermediatePromptOpen, setIsIntermediatePromptOpen] = React.useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState<boolean>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:onboarded');
      if (!v) return true;
    } catch {}
    return false;
  });
  const [appToast, setAppToast] = React.useState<string | null>(null);

  const [promptIntervalMinutes, setPromptIntervalMinutes] = React.useState<number>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:prompt-interval-min');
      if (v) {
        const n = Number(v);
        if (!isNaN(n) && n > 0) return n;
      }
    } catch {}
    return 30; // default 30 mins
  });

  // 30-minute interval to prompt for intermediate state assessment
  React.useEffect(() => {
    const checkInterval = setInterval(() => {
      const lastPrompt = Number(localStorage.getItem('quit-smoking:last-prompt') || 0);
      const now = Date.now();
      const intervalMs = promptIntervalMinutes * 60 * 1000;
      if (!lastPrompt || now - lastPrompt >= intervalMs) {
        setIsIntermediatePromptOpen(true);
      }
    }, 45000);

    return () => clearInterval(checkInterval);
  }, [promptIntervalMinutes]);

  // Time difference in milliseconds, updated strictly 1 time per second for MAX ENERGY EFFICIENCY!
  const [diffMs, setDiffMs] = React.useState<number>(() => Math.max(0, Date.now() - startDate));

  // 1-second interval loop with page visibility pausing (Item 5)
  React.useEffect(() => {
    const updateTime = () => {
      setDiffMs(Math.max(0, Date.now() - startDate));
    };

    updateTime();
    let intervalId: any = null;

    const startTimer = () => {
      if (!intervalId) {
        updateTime();
        intervalId = setInterval(updateTime, 1000);
      }
    };

    const stopTimer = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Listen to visibilitychange: sleep timer when tab is hidden, wake up when visible!
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    if (!document.hidden) {
      startTimer();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startDate]);

  // Apply theme & accent class to root
  // Apply theme & accent class to root
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');

    if (accent) {
      root.setAttribute('data-accent', accent);
    } else {
      root.removeAttribute('data-accent');
    }
  }, [accent]);

  // Sync to localStorage
  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.START, String(startDate)); } catch {}
  }, [startDate]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.MONEY, JSON.stringify(money)); } catch {}
  }, [money]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(days)); } catch {}
  }, [days]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(streaks)); } catch {}
  }, [streaks]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.REASONS, JSON.stringify(reasons)); } catch {}
  }, [reasons]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals)); } catch {}
  }, [goals]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.TREE, JSON.stringify(treeState)); } catch {}
  }, [treeState]);

  // Auto-decay and growth pause for current tree if not maintained every hour
  React.useEffect(() => {
    if (!treeState.current) return;
    const now = Date.now();
    const tree = treeState.current;
    const last = tree.lastTick || tree.plantedAt;
    const elapsedMs = now - last;
    if (elapsedMs < 5000) return;

    const elapsedHours = elapsedMs / (3600 * 1000);
    const newWater = Math.max(0, tree.water - elapsedHours * 50);
    const newSun = Math.max(0, tree.sun - elapsedHours * 45);
    const newFood = Math.max(0, tree.food - elapsedHours * 35);

    let newGrowth = tree.growth;
    if (newWater >= 30 && newSun >= 30 && newFood >= 30 && tree.growth < 100) {
      newGrowth = Math.min(100, tree.growth + elapsedHours * 3.0);
    }

    if (
      newWater !== tree.water ||
      newSun !== tree.sun ||
      newFood !== tree.food ||
      newGrowth !== tree.growth
    ) {
      setTreeState({
        ...treeState,
        current: {
          ...tree,
          water: newWater,
          sun: newSun,
          food: newFood,
          growth: newGrowth,
          lastTick: now
        }
      });
    }
  }, [diffMs]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.ACCENT, accent); } catch {}
  }, [accent]);

  // Total free time including previous streaks
  const pastFreeMs = streaks.reduce((acc, s) => acc + (s.to - s.from), 0);
  const totalFreeMs = diffMs + pastFreeMs;
  const longestStreakMs = Math.max(diffMs, ...streaks.map((s) => s.to - s.from));

  const totalDays = Math.floor(totalFreeMs / (24 * 3600 * 1000));
  const totalHours = Math.floor(totalFreeMs / (3600 * 1000));
  const totalSeconds = Math.floor(totalFreeMs / 1000);

  // Total free time intervals (past streaks + active streak)
  const intervals = React.useMemo(() => {
    const list = streaks.map((s) => ({ from: s.from, to: s.to }));
    list.push({ from: startDate, to: Date.now() });
    return list;
  }, [streaks, startDate, diffMs]);

  // Calculations for money and cigarettes avoided (supports price changes over time)
  const cigsAvoided = calculateCigsAvoided(intervals, money);
  const totalSaved = calculateTotalSaved(intervals, money);

  // Dot badges
  const todayKey = (() => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();
  const hasRatedToday = !!days[todayKey];
  const canPlantTree = Math.floor(cigsAvoided / 300) > (treeState.forest.length + (treeState.current ? 1 : 0)) && !treeState.current;

  const getAccentTextClass = (id: string) => {
    switch (id) {
      case 'charcoal': return 'text-zinc-900 dark:text-zinc-300';
      case 'sage': return 'text-emerald-900 dark:text-emerald-300';
      case 'taupe': return 'text-amber-950 dark:text-amber-200';
      case 'slate-blue': return 'text-indigo-950 dark:text-indigo-300';
      case 'ash-olive': return 'text-[#283224] dark:text-[#c4cec0]';
      case 'graphite': return 'text-neutral-900 dark:text-neutral-200';
      case 'gray':
      default: return 'text-slate-900 dark:text-slate-200';
    }
  };

  // Handlers
  const handleSaveDate = (newMs: number) => {
    setStartDate(newMs);
    setDiffMs(Math.max(0, Date.now() - newMs));
    setIsSetupOpen(false);
  };

  const handleConfirmRelapse = (whenMs: number, note: string) => {
    const streak: Streak = {
      from: startDate,
      to: whenMs,
      note
    };
    setStreaks((prev) => [...prev, streak]);
    setStartDate(whenMs);
    setDiffMs(Math.max(0, Date.now() - whenMs));
    setIsRelapseOpen(false);
    setIsSosOpen(false);
    setActiveTab('counter');
  };

  const handleUndoLastRelapse = () => {
    if (streaks.length === 0) return;
    const last = streaks[streaks.length - 1];
    setStartDate(last.from);
    setStreaks(streaks.slice(0, -1));
    setDiffMs(Math.max(0, Date.now() - last.from));
  };

  const handleAddGoal = (name: string, amount?: number, targetDate?: string) => {
    const newGoal: SavingsGoal = {
      id: `goal_${Date.now()}`,
      name,
      amount: amount && amount > 0 ? amount : undefined,
      targetDate: targetDate ? targetDate : undefined,
      createdAt: Date.now()
    };
    setGoals(prev => ({
      ...prev,
      queue: [...prev.queue, newGoal]
    }));
  };

  const handleCompleteGoal = (goalId: string) => {
    setGoals(prev => {
      const goal = prev.queue.find(g => g.id === goalId);
      if (!goal) return prev;
      const newQueue = prev.queue.filter(g => g.id !== goalId);
      const completed: CompletedGoal = {
        ...goal,
        at: Date.now(),
        total: goal.amount || totalSaved
      };
      return {
        ...prev,
        base: goal.amount ? prev.base + goal.amount : prev.base,
        queue: newQueue,
        done: [completed, ...prev.done]
      };
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => ({
      ...prev,
      queue: prev.queue.filter(g => g.id !== goalId),
      done: prev.done.filter(g => g.id !== goalId)
    }));
  };

  const handleAddReason = (newReason: string) => {
    const trimmed = newReason.trim();
    if (!trimmed) return;
    setReasons((prev) => [...prev, trimmed]);
  };

  const handleDeleteReason = (index: number) => {
    setReasons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDayRating = (dateKey: string, rating: DayRating) => {
    setDays((prev) => ({
      ...prev,
      [dateKey]: rating
    }));
  };

  const handleIntermediatePromptSubmit = (entryData: {
    mood: number;
    craving: number;
    anxiety: number;
    energy: number;
    balance: number;
    focus: number;
    note: string;
  }) => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const todayKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const existing = days[todayKey] || {
      mood: entryData.mood,
      craving: entryData.craving,
      anxiety: entryData.anxiety,
      surveys: [],
      entries: []
    };

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      time: timeStr,
      mood: entryData.mood,
      craving: entryData.craving,
      anxiety: entryData.anxiety,
      energy: entryData.energy,
      balance: entryData.balance,
      focus: entryData.focus,
      note: entryData.note
    };

    const updatedSurveys = [...(existing.surveys || existing.entries || []), newEntry];
    handleSaveDayRating(todayKey, {
      ...existing,
      craving: entryData.craving,
      anxiety: entryData.anxiety,
      mood: entryData.mood,
      surveys: updatedSurveys,
      entries: updatedSurveys
    });

    localStorage.setItem('quit-smoking:last-prompt', String(Date.now()));
    setIsIntermediatePromptOpen(false);
  };

  const handleDeleteDayRating = (dateKey: string) => {
    setDays((prev) => {
      const copy = { ...prev };
      delete copy[dateKey];
      return copy;
    });
  };

  const handleRestoreAllData = (backup: any) => {
    if (backup.start) setStartDate(backup.start);
    if (backup.money) setMoney(backup.money);
    if (backup.days) setDays(backup.days);
    if (backup.streaks) setStreaks(backup.streaks);
    if (backup.reasons) setReasons(backup.reasons);
    if (backup.goals) setGoals(backup.goals);
    if (backup.tree) setTreeState(backup.tree);
    setAppToast('Дані успішно відновлено! ✨');
    setTimeout(() => setAppToast(null), 3500);
  };

  const handleCompleteOnboarding = (data: {
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
  }) => {
    setStartDate(data.startDate);
    localStorage.setItem(STORAGE_KEYS.START, String(data.startDate));
    setMoney(data.money);
    localStorage.setItem(STORAGE_KEYS.MONEY, JSON.stringify(data.money));
    setReasons((prev) => [data.mainReason, ...prev.filter((r) => r !== data.mainReason)]);

    if (data.initialSurvey) {
      const d = new Date(data.startDate);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const dateKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

      const newEntry = {
        id: `init_${Date.now()}`,
        time: timeStr,
        mood: data.initialSurvey.mood,
        craving: data.initialSurvey.craving,
        anxiety: data.initialSurvey.anxiety,
        energy: data.initialSurvey.energy,
        balance: data.initialSurvey.mood,
        focus: data.initialSurvey.energy,
        note: data.initialSurvey.note
      };

      setDays((prev) => {
        const existing = prev[dateKey] || {
          mood: data.initialSurvey!.mood,
          craving: data.initialSurvey!.craving,
          anxiety: data.initialSurvey!.anxiety,
          surveys: [],
          entries: []
        };
        const updated = [...(existing.surveys || existing.entries || []), newEntry];
        return {
          ...prev,
          [dateKey]: {
            ...existing,
            mood: data.initialSurvey!.mood,
            craving: data.initialSurvey!.craving,
            anxiety: data.initialSurvey!.anxiety,
            surveys: updated,
            entries: updated
          }
        };
      });
    }

    setIsOnboardingOpen(false);
    setAppToast(`Ласкаво просимо, ${data.userName}! Ваш шлях розпочато 🌟`);
    setTimeout(() => setAppToast(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-md mx-auto w-full px-4 pt-5 pb-20 select-none relative z-10">
      <StardustBackground />
      {/* Top Bar: Minimal with Eco-battery icon badge */}
      <header className="flex items-center justify-end pb-2 mb-2">
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <div key={activeTab} className="flex-1 flex flex-col animate-tab-fade-in">
          {activeTab === 'counter' && (
            <CounterTab
              diffMs={diffMs}
              startDate={startDate}
              money={money}
              totalSaved={totalSaved}
              cigsAvoided={cigsAvoided}
              treeState={treeState}
              daysCount={totalSeconds}
              reasons={reasons}
              streaks={streaks}
              longestStreakMs={longestStreakMs}
              goals={goals}
              activeGoalName={goals.queue[0]?.name}
              activeGoalPct={
                goals.queue[0] && goals.queue[0].amount
                  ? Math.min(
                      100,
                      Math.floor(
                        (Math.max(0, totalSaved - goals.base) / goals.queue[0].amount) * 100
                      )
                    )
                  : 0
              }
              onOpenSos={() => setActiveTab('sos')}
              onOpenSetup={() => setIsSetupOpen(true)}
              onOpenRelapse={() => setIsRelapseOpen(true)}
              onUndoLastRelapse={handleUndoLastRelapse}
              onSwitchTab={setActiveTab}
              onAddGoal={handleAddGoal}
              onCompleteGoal={handleCompleteGoal}
              onDeleteGoal={handleDeleteGoal}
              dayRatings={days}
              dragonState={dragonState}
              zenState={zenState}
              orbitState={orbitState}
              accent={accent}
              onUpdateReasons={setReasons}
              onUpdateMoney={(newMoney) => {
                setMoney(newMoney);
                try {
                  localStorage.setItem(STORAGE_KEYS.MONEY, JSON.stringify(newMoney));
                } catch {}
              }}
            />
          )}

          {activeTab === 'health' && (
            <HealthTab diffMs={totalFreeMs} startDate={startDate} />
          )}

          {activeTab === 'state' && (
            <StateSurveyTab
              days={days}
              onSaveRating={handleSaveDayRating}
              onDeleteRating={handleDeleteDayRating}
              promptIntervalMinutes={promptIntervalMinutes}
              onUpdatePromptInterval={(minutes) => {
                setPromptIntervalMinutes(minutes);
                try {
                  localStorage.setItem('quit-smoking:prompt-interval-min', String(minutes));
                } catch {}
              }}
            />
          )}

          {activeTab === 'tree' && (
            <TreeTab
              treeState={treeState}
              money={money}
              cigsAvoided={cigsAvoided}
              totalSeconds={totalSeconds}
              onUpdateTreeState={setTreeState}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === 'sand' && (
            <SandTab daysCount={totalSeconds} onSwitchTab={setActiveTab} />
          )}

          {(activeTab === 'cat' || activeTab === 'wave') && (
            <WaveTab onSwitchTab={setActiveTab} />
          )}

          {activeTab === 'zen' && (
            <ZenIslandTab
              cigsAvoided={cigsAvoided}
              zenState={zenState}
              onUpdateZenState={setZenState}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === 'orbit' && (
            <OrbitVoyageTab
              cigsAvoided={cigsAvoided}
              orbitState={orbitState}
              onUpdateOrbitState={setOrbitState}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === 'beacon' && (
            <BeaconTab onSwitchTab={setActiveTab} />
          )}

          {activeTab === 'harmonograph' && (
            <HarmonographTab onSwitchTab={setActiveTab} />
          )}

          {activeTab === 'cymatics' && (
            <CymaticsTab onSwitchTab={setActiveTab} />
          )}

          {activeTab === 'music' && (
            <MusicStudioTab onSwitchTab={setActiveTab} />
          )}

          {activeTab === 'monsters' && (
            <CigaretteMonstersGameTab
              onSwitchTab={setActiveTab}
              cigsAvoided={cigsAvoided}
            />
          )}

          {activeTab === 'press' && (
            <HydraulicPressTab
              onSwitchTab={setActiveTab}
              cigsAvoided={cigsAvoided}
            />
          )}

          {activeTab === 'lavalamp' && (
            <LavaLampTab
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === 'whack' && (
            <WhackACigTab
              onSwitchTab={setActiveTab}
              cigsAvoided={cigsAvoided}
            />
          )}

          {activeTab === 'ecocity' && (
            <EcoCityTab
              onSwitchTab={setActiveTab}
              totalSaved={totalSaved}
              cigsAvoided={cigsAvoided}
              totalFreeMs={totalFreeMs}
            />
          )}

          {activeTab === 'vacuum' && (
            <VacuumCleanerTab
              onSwitchTab={setActiveTab}
              cigsAvoided={cigsAvoided}
            />
          )}

          {activeTab === 'blockcrush' && (
            <BlockCrushTab
              onSwitchTab={setActiveTab}
              cigsAvoided={cigsAvoided}
            />
          )}

          {activeTab === 'dart' && (
            <DartTargetTab
              onSwitchTab={setActiveTab}
              cigsAvoided={cigsAvoided}
            />
          )}

          {activeTab === 'sos' && (
            <SosTab
              reasons={reasons}
              accent={accent}
              onCravingOver={() => {
                setAppToast('Чудово! Чергову хвилю тяги успішно подолано! 🏆');
                setTimeout(() => setAppToast(null), 4000);
                setActiveTab('counter');
              }}
              onRelapse={() => {
                setIsRelapseOpen(true);
              }}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === 'more' && (
            <MoreTab
              reasons={reasons}
              streaks={streaks}
              currentStart={startDate}
              totalFreeMs={totalFreeMs}
              longestStreakMs={longestStreakMs}
              goals={goals}
              totalSaved={totalSaved}
              cigsAvoided={cigsAvoided}
              money={money}
              days={days}
              promptIntervalMinutes={promptIntervalMinutes}
              currentAccent={accent}
              onUpdateAccent={(val) => {
                setAccent(val);
                try {
                  localStorage.setItem(STORAGE_KEYS.ACCENT, val);
                } catch {}
              }}
              onUpdatePromptInterval={(val) => {
                setPromptIntervalMinutes(val);
                try {
                  localStorage.setItem('quit-smoking:prompt-interval-min', String(val));
                } catch {}
              }}
              onUpdateMoney={setMoney}
              onAddGoal={handleAddGoal}
              onCompleteGoal={handleCompleteGoal}
              onDeleteGoal={handleDeleteGoal}
              onAddReason={handleAddReason}
              onDeleteReason={handleDeleteReason}
              onUndoLastRelapse={handleUndoLastRelapse}
              onOpenSetup={() => setIsSetupOpen(true)}
              onOpenRelapse={() => setIsRelapseOpen(true)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              indicatorStyle={indicatorStyle}
              onUpdateIndicatorStyle={setIndicatorStyle}
              economyMode={economyMode}
              onUpdateEconomyMode={setEconomyMode}
            />
          )}
        </div>
      </main>

      {/* Persistent Bottom Navigation Bar (Hidden during full-screen meditative spaces and games) */}
      {!['tree', 'sand', 'zen', 'orbit', 'wave', 'beacon', 'harmonograph', 'cymatics', 'music', 'monsters', 'press', 'lavalamp', 'whack', 'ecocity', 'vacuum', 'blockcrush', 'dart'].includes(activeTab) && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#2d2d35] py-2 px-2 sm:px-4 shadow-lg">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-0.5 text-center">
            {/* 1. Counter / Home */}
            <button
              type="button"
              onClick={() => setActiveTab('counter')}
              className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'counter'
                  ? `${getAccentTextClass(accent)} font-bold scale-105`
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <div className="relative">
                <Clock className={`w-5 h-5 ${activeTab === 'counter' ? 'animate-pulse' : ''}`} />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight">Головна</span>
            </button>

            {/* 2. SOS */}
            <button
              type="button"
              id="nav-btn-sos"
              onClick={() => setActiveTab('sos')}
              className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'sos'
                  ? 'text-[#A33A2C] dark:text-[#F08C7D] font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-[#E4F1ED]'
              }`}
              aria-label="SOS"
            >
              <ShieldAlert className="w-5 h-5 text-[#A33A2C] dark:text-[#F08C7D] animate-pulse-red" />
              <span className="text-[10px] sm:text-[11px] leading-tight font-semibold text-[#A33A2C] dark:text-[#F08C7D]">SOS</span>
            </button>

            {/* 3. Здоров'я */}
            <button
              type="button"
              onClick={() => setActiveTab('state')}
              className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer relative transition-all ${
                activeTab === 'state'
                  ? `${getAccentTextClass(accent)} font-bold scale-105`
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-[#f4f4f5]'
              }`}
            >
              {!hasRatedToday && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#C9701A] ring-2 ring-white dark:ring-[#0D1E1B]" />
              )}
              <div className="relative">
                <HeartPulse className="w-5 h-5 text-red-500 animate-heart-beat" />
                <div className="absolute top-0 right-0 w-2 h-2 text-blue-400 animate-lightning-flash">⚡</div>
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight">Здоров'я</span>
            </button>

            {/* 4. More */}
            <button
              type="button"
              onClick={() => setActiveTab('more')}
              className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'more'
                  ? `${getAccentTextClass(accent)} font-bold scale-105`
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] sm:text-[11px] leading-tight">Ще</span>
            </button>
          </div>
        </nav>
      )}

      {/* MODALS */}
      {/* (Sos is now a full native tab matching the style of Головна) */}

      {/* Floating Notification Toast */}
      {appToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#12302B] dark:bg-[#1E8A69] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <span>{appToast}</span>
        </div>
      )}

      <SetupModal
        initialDateMs={startDate}
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onSave={handleSaveDate}
      />

      <RelapseModal
        isOpen={isRelapseOpen}
        currentStart={startDate}
        onClose={() => setIsRelapseOpen(false)}
        onConfirmRelapse={handleConfirmRelapse}
      />

      <IntermediatePromptModal
        isOpen={isIntermediatePromptOpen}
        onClose={() => {
          setIsIntermediatePromptOpen(false);
          localStorage.setItem('quit-smoking:last-prompt', String(Date.now()));
        }}
        onSubmit={handleIntermediatePromptSubmit}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
