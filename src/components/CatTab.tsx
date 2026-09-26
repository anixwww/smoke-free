import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TabType } from '../types';
import { catAudio } from '../data/catSound';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Moon,
  Heart,
  Palette,
  Check,
  Edit2,
  Sparkles,
  Clock,
  Timer,
  Utensils,
  Droplets,
  Gamepad2,
  Trash2,
  Smile,
  AlertCircle
} from 'lucide-react';

interface CatTabProps {
  startDate?: number;
  totalSeconds?: number;
  onSwitchTab: (tab: TabType) => void;
}

export type CatBreedId = 'ginger' | 'black' | 'white' | 'gray' | 'siamese';

interface CatBreedConfig {
  id: CatBreedId;
  defaultName: string;
  colorName: string;
  avatarColor: string;
  furGradient: {
    start: string;
    mid: string;
    dark: string;
    shadow: string;
  };
  bellyColor: {
    start: string;
    end: string;
  };
  innerEar: string;
  eyeColor: string;
  pupilColor: string;
  noseColor: string;
  whiskerColor: string;
  tailTipColor?: string;
  muzzleDark?: boolean;
}

const CAT_BREEDS: CatBreedConfig[] = [
  {
    id: 'ginger',
    defaultName: 'Мармелад',
    colorName: 'Рудий смугастик',
    avatarColor: '#f97316',
    furGradient: {
      start: '#fb923c',
      mid: '#ea580c',
      dark: '#c2410c',
      shadow: '#7c2d12'
    },
    bellyColor: {
      start: '#ffedd5',
      end: '#fed7aa'
    },
    innerEar: '#fbcfe8',
    eyeColor: '#fde047',
    pupilColor: '#0f172a',
    noseColor: '#f472b6',
    whiskerColor: '#fed7aa',
    tailTipColor: '#ffedd5'
  },
  {
    id: 'black',
    defaultName: 'Нічка',
    colorName: 'Оксамитовий чорний',
    avatarColor: '#1e293b',
    furGradient: {
      start: '#334155',
      mid: '#1e293b',
      dark: '#0f172a',
      shadow: '#020617'
    },
    bellyColor: {
      start: '#475569',
      end: '#1e293b'
    },
    innerEar: '#64748b',
    eyeColor: '#a3e635',
    pupilColor: '#020617',
    noseColor: '#334155',
    whiskerColor: '#94a3b8',
    tailTipColor: '#334155'
  },
  {
    id: 'white',
    defaultName: 'Зефір',
    colorName: 'Сніжно-білий',
    avatarColor: '#f8fafc',
    furGradient: {
      start: '#ffffff',
      mid: '#f1f5f9',
      dark: '#e2e8f0',
      shadow: '#94a3b8'
    },
    bellyColor: {
      start: '#ffffff',
      end: '#f8fafc'
    },
    innerEar: '#fecdd3',
    eyeColor: '#38bdf8',
    pupilColor: '#0f172a',
    noseColor: '#fb7185',
    whiskerColor: '#cbd5e1',
    tailTipColor: '#ffffff'
  },
  {
    id: 'gray',
    defaultName: 'Димок',
    colorName: 'Попелястий смугастик',
    avatarColor: '#94a3b8',
    furGradient: {
      start: '#94a3b8',
      mid: '#64748b',
      dark: '#475569',
      shadow: '#1e293b'
    },
    bellyColor: {
      start: '#e2e8f0',
      end: '#cbd5e1'
    },
    innerEar: '#fbcfe8',
    eyeColor: '#4ade80',
    pupilColor: '#0f172a',
    noseColor: '#f472b6',
    whiskerColor: '#e2e8f0',
    tailTipColor: '#f1f5f9'
  },
  {
    id: 'siamese',
    defaultName: 'Тоффі',
    colorName: 'Сіамський шоколад',
    avatarColor: '#d6d3d1',
    furGradient: {
      start: '#f5f5f4',
      mid: '#e7e5e4',
      dark: '#78716c',
      shadow: '#44403c'
    },
    bellyColor: {
      start: '#fafaf9',
      end: '#f5f5f4'
    },
    innerEar: '#44403c',
    eyeColor: '#0ea5e9',
    pupilColor: '#082f49',
    noseColor: '#292524',
    whiskerColor: '#d6d3d1',
    tailTipColor: '#292524',
    muzzleDark: true
  }
];

export interface CatLifeStage {
  level: number;
  title: string;
  minDays: number;
  baseScale: number;
  desc: string;
  badge: string;
}

export const CAT_LIFE_STAGES: CatLifeStage[] = [
  {
    level: 1,
    title: 'Кошеня',
    minDays: 0,
    baseScale: 0.68,
    desc: 'Перші кроки свободи. Маленьке, зворушливе та солодке малятко.',
    badge: '🐾 1 день'
  },
  {
    level: 2,
    title: 'Підростає',
    minDays: 14,
    baseScale: 0.79,
    desc: '2 тижні чистоти! Кошеня міцнішає, хутро стає м\'яким та пухнастим.',
    badge: '🌱 2 тижні'
  },
  {
    level: 3,
    title: 'Юний котик',
    minDays: 28,
    baseScale: 0.89,
    desc: '2–4 тижні без диму! Грайливий, граційний та шовковистий юнак.',
    badge: '🌿 2–4 тижні'
  },
  {
    level: 4,
    title: 'Дорослий кіт',
    minDays: 30,
    baseScale: 0.99,
    desc: 'Більше місяця свободи! Статний, величний і спокійний кіт.',
    badge: '👑 > 1 місяця'
  },
  {
    level: 5,
    title: 'Мудрий хранитель',
    minDays: 180,
    baseScale: 1.07,
    desc: 'Пів року чистого життя! Справжній володар снів із сяйливою аурою.',
    badge: '✨ Пів року'
  }
];

interface CaressParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  color: string;
}

interface DreamBubble {
  id: number;
  icon: string;
  x: number;
  y: number;
  alpha: number;
  scale: number;
}

const DREAM_ICONS = ['🐟', '🦋', '🧶', '✨', '🌙', '☁️', '🥛', '🐾', '🕊️'];

export const CatTab: React.FC<CatTabProps> = ({
  startDate,
  totalSeconds = 0,
  onSwitchTab
}) => {
  // Breed Selection
  const [breedId, setBreedId] = useState<CatBreedId>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:cat-breed') as CatBreedId;
      if (v && CAT_BREEDS.some(b => b.id === v)) return v;
    } catch {}
    return 'ginger';
  });

  const currentBreed = useMemo(() => {
    return CAT_BREEDS.find((b) => b.id === breedId) || CAT_BREEDS[0];
  }, [breedId]);

  // Custom Cat Name
  const [customName, setCustomName] = useState<string>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:cat-name');
      if (v && v.trim()) return v.trim();
    } catch {}
    return currentBreed.defaultName;
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(customName);
  const [isBreedModalOpen, setIsBreedModalOpen] = useState(false);

  // 1-Hour Sleep Timer state (timestamp until which cat stays asleep)
  const [sleepUntil, setSleepUntil] = useState<number | null>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:cat-sleep-until');
      if (v !== null) {
        const time = Number(v);
        if (time > Date.now()) return time;
      }
    } catch {}
    return null;
  });

  // Toggle for showing the sleep countdown timer indicator badge
  const [showTimerBadge, setShowTimerBadge] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:cat-show-timer');
      if (v !== null) return v === 'true';
    } catch {}
    return true;
  });

  // Remaining minutes for the 1-hour sleep timer
  const [remainingMinutes, setRemainingMinutes] = useState<number>(() => {
    if (!sleepUntil) return 0;
    return Math.max(0, Math.ceil((sleepUntil - Date.now()) / 60000));
  });

  // Petting sleep state: 0 (awake) to 100 (deep sleep)
  const [sleepLevel, setSleepLevel] = useState<number>(() => {
    try {
      const su = localStorage.getItem('quit-smoking:cat-sleep-until');
      if (su && Number(su) > Date.now()) return 100;

      const v = localStorage.getItem('quit-smoking:cat-sleep');
      if (v !== null) return Math.min(100, Math.max(0, Number(v)));
    } catch {}
    return 15;
  });

  // TAMAGOTCHI NEEDS STATE: Food (0-100), Water (0-100), Joy (0-100), Litter Cleanliness (0-100)
  const [foodLevel, setFoodLevel] = useState<number>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:cat-food');
      const last = localStorage.getItem('quit-smoking:cat-last-time');
      if (v !== null) {
        let val = Number(v);
        if (last) {
          const elapsedSec = (Date.now() - Number(last)) / 1000;
          val -= elapsedSec * 0.0025; // ~9% per hour offline
        }
        return Math.min(100, Math.max(5, val));
      }
    } catch {}
    return 85;
  });

  const [waterLevel, setWaterLevel] = useState<number>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:cat-water');
      const last = localStorage.getItem('quit-smoking:cat-last-time');
      if (v !== null) {
        let val = Number(v);
        if (last) {
          const elapsedSec = (Date.now() - Number(last)) / 1000;
          val -= elapsedSec * 0.0035; // ~12% per hour offline
        }
        return Math.min(100, Math.max(5, val));
      }
    } catch {}
    return 90;
  });

  const [joyLevel, setJoyLevel] = useState<number>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:cat-joy');
      const last = localStorage.getItem('quit-smoking:cat-last-time');
      if (v !== null) {
        let val = Number(v);
        if (last) {
          const elapsedSec = (Date.now() - Number(last)) / 1000;
          val -= elapsedSec * 0.0028;
        }
        return Math.min(100, Math.max(10, val));
      }
    } catch {}
    return 80;
  });

  const [litterCleanliness, setLitterCleanliness] = useState<number>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:cat-litter');
      const last = localStorage.getItem('quit-smoking:cat-last-time');
      if (v !== null) {
        let val = Number(v);
        if (last) {
          const elapsedSec = (Date.now() - Number(last)) / 1000;
          val -= elapsedSec * 0.002;
        }
        return Math.min(100, Math.max(0, val));
      }
    } catch {}
    return 95;
  });

  const [activeActionMsg, setActiveActionMsg] = useState<string | null>(null);
  const [toyBounce, setToyBounce] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPetting, setIsPetting] = useState(false);
  const [pettingVelocity, setPettingVelocity] = useState(0);
  const [vibrationOffset, setVibrationOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [particles, setParticles] = useState<CaressParticle[]>([]);
  const [dreamBubbles, setDreamBubbles] = useState<DreamBubble[]>([]);
  const [isStretching, setIsStretching] = useState(false);

  // Total peaceful sleep duration in seconds
  const [totalSleepSeconds, setTotalSleepSeconds] = useState<number>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:cat-sleep-sec');
      if (v !== null) return Number(v) || 0;
    } catch {}
    return 0;
  });

  // Calculate smoke-free days for life stage
  const daysSmokeFree = useMemo(() => {
    if (totalSeconds && totalSeconds > 0) {
      return totalSeconds / 86400;
    }
    if (startDate && startDate > 0) {
      return Math.max(0, (Date.now() - startDate) / 86400000);
    }
    return 0;
  }, [totalSeconds, startDate]);

  // Determine current life stage based on smoke-free days
  const currentStage = useMemo(() => {
    let active = CAT_LIFE_STAGES[0];
    for (const stage of CAT_LIFE_STAGES) {
      if (daysSmokeFree >= stage.minDays) {
        active = stage;
      }
    }
    return active;
  }, [daysSmokeFree]);

  // Continuous fluid visual scale for organic, imperceptible growth
  const targetContinuousScale = useMemo(() => {
    const dayProgressNorm = Math.min(1.0, daysSmokeFree / 180);
    const dayScale = 0.68 + dayProgressNorm * 0.39;
    const sleepBonus = Math.min(0.02, (totalSleepSeconds / 3600) * 0.02);
    return Math.min(1.09, dayScale + sleepBonus);
  }, [daysSmokeFree, totalSleepSeconds]);

  const [renderedScale, setRenderedScale] = useState<number>(targetContinuousScale);

  const animFrameRef = useRef<number | null>(null);
  const renderedScaleRef = useRef<number>(targetContinuousScale);
  const targetContinuousScaleRef = useRef<number>(targetContinuousScale);
  targetContinuousScaleRef.current = targetContinuousScale;

  const totalSleepSecondsRef = useRef<number>(totalSleepSeconds);
  totalSleepSecondsRef.current = totalSleepSeconds;

  const lastStrokeTimeRef = useRef<number>(Date.now());
  const lastHapticTimeRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const wasAsleepRef = useRef<boolean>(false);
  const stretchTimerRef = useRef<any>(null);

  const sleepLevelRef = useRef<number>(sleepLevel);
  sleepLevelRef.current = sleepLevel;

  const sleepUntilRef = useRef<number | null>(sleepUntil);
  sleepUntilRef.current = sleepUntil;

  const isPettingRef = useRef<boolean>(isPetting);
  isPettingRef.current = isPetting;

  const pettingVelocityRef = useRef<number>(pettingVelocity);
  pettingVelocityRef.current = pettingVelocity;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Toggle timer badge
  const handleToggleTimerBadge = () => {
    const next = !showTimerBadge;
    setShowTimerBadge(next);
    try {
      localStorage.setItem('quit-smoking:cat-show-timer', String(next));
    } catch {}
  };

  // Handle renaming cat
  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = tempName.trim();
    if (clean) {
      setCustomName(clean);
      try {
        localStorage.setItem('quit-smoking:cat-name', clean);
      } catch {}
    } else {
      setCustomName(currentBreed.defaultName);
      try {
        localStorage.removeItem('quit-smoking:cat-name');
      } catch {}
    }
    setIsEditingName(false);
  };

  // Select breed
  const handleSelectBreed = (id: CatBreedId) => {
    setBreedId(id);
    const newBreed = CAT_BREEDS.find(b => b.id === id) || CAT_BREEDS[0];
    try {
      localStorage.setItem('quit-smoking:cat-breed', id);
    } catch {}

    if (customName === currentBreed.defaultName) {
      setCustomName(newBreed.defaultName);
      setTempName(newBreed.defaultName);
    }
    setIsBreedModalOpen(false);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
  };

  // Action Handlers for Feeding, Watering, Playing, and Cleaning Litter Box
  const showFeedbackMsg = (msg: string) => {
    setActiveActionMsg(msg);
    setTimeout(() => setActiveActionMsg(null), 2400);
  };

  const handleFeedCat = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setFoodLevel(100);
    setLitterCleanliness((prev) => Math.max(0, prev - 6));
    try {
      localStorage.setItem('quit-smoking:cat-food', '100');
      localStorage.setItem('quit-smoking:cat-last-time', String(Date.now()));
    } catch {}
    if (soundEnabledRef.current) {
      catAudio.playEatSound();
    }
    showFeedbackMsg(`Смачного, ${customName}! 🍗`);
  };

  const handleWaterCat = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setWaterLevel(100);
    try {
      localStorage.setItem('quit-smoking:cat-water', '100');
      localStorage.setItem('quit-smoking:cat-last-time', String(Date.now()));
    } catch {}
    if (soundEnabledRef.current) {
      catAudio.playDrinkSound();
    }
    showFeedbackMsg(`Свіжа водичка налита! 💧`);
  };

  const handlePlayWithToy = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setJoyLevel(100);
    setToyBounce(true);
    setTimeout(() => setToyBounce(false), 900);
    try {
      localStorage.setItem('quit-smoking:cat-joy', '100');
      localStorage.setItem('quit-smoking:cat-last-time', String(Date.now()));
    } catch {}
    if (soundEnabledRef.current) {
      catAudio.playToySound();
    }
    showFeedbackMsg(`${customName} весело грається іграшкою! 🧶✨`);
  };

  const handleCleanLitter = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setLitterCleanliness(100);
    try {
      localStorage.setItem('quit-smoking:cat-litter', '100');
      localStorage.setItem('quit-smoking:cat-last-time', String(Date.now()));
    } catch {}
    if (soundEnabledRef.current) {
      catAudio.playCleanLitterSound();
    }
    showFeedbackMsg(`Лоток засяяв чистотою! 🧹✨`);
  };

  // Continuous animation loop: breathing, sleep timer, Tamagotchi needs decay, stretching, dream bubbles
  useEffect(() => {
    let lastT = performance.now();
    let dreamSpawnTimer = 0;
    let timerTickAcc = 0;
    let saveStorageAcc = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - lastT) * 0.001);
      lastT = now;

      // Decay Tamagotchi Needs smoothly over time
      setFoodLevel((prev) => Math.max(0, prev - 0.0015 * dt));
      setWaterLevel((prev) => Math.max(0, prev - 0.0022 * dt));
      setJoyLevel((prev) => Math.max(0, prev - 0.0018 * dt));
      setLitterCleanliness((prev) => Math.max(0, prev - 0.0012 * dt));

      saveStorageAcc += dt;
      if (saveStorageAcc > 10.0) {
        saveStorageAcc = 0;
        try {
          localStorage.setItem('quit-smoking:cat-food', String(foodLevel));
          localStorage.setItem('quit-smoking:cat-water', String(waterLevel));
          localStorage.setItem('quit-smoking:cat-joy', String(joyLevel));
          localStorage.setItem('quit-smoking:cat-litter', String(litterCleanliness));
          localStorage.setItem('quit-smoking:cat-last-time', String(Date.now()));
        } catch {}
      }

      const timeSinceStroke = (Date.now() - lastStrokeTimeRef.current) * 0.001;
      const nowMs = Date.now();

      // Check 1-Hour Sleep Timer
      if (sleepUntilRef.current) {
        if (nowMs < sleepUntilRef.current) {
          // Keep cat in 100% deep sleep
          setSleepLevel(100);
          wasAsleepRef.current = true;

          timerTickAcc += dt;
          if (timerTickAcc >= 1.0) {
            timerTickAcc = 0;
            const leftMin = Math.max(0, Math.ceil((sleepUntilRef.current - nowMs) / 60000));
            setRemainingMinutes(leftMin);
          }
        } else {
          // Timer finished! Cat wakes up gracefully
          setSleepUntil(null);
          sleepUntilRef.current = null;
          try {
            localStorage.removeItem('quit-smoking:cat-sleep-until');
          } catch {}
          setRemainingMinutes(0);

          if (!isStretching) {
            setIsStretching(true);
            if (soundEnabledRef.current) {
              catAudio.playSleepyMeow();
            }
            if (stretchTimerRef.current) clearTimeout(stretchTimerRef.current);
            stretchTimerRef.current = setTimeout(() => {
              setIsStretching(false);
            }, 2400);
          }
        }
      } else {
        // SLEEP DYNAMICS (WHEN NOT IN 1-HOUR SLEEP TIMER):
        // Fills when stroked. When not stroked for >1.2s, decreases VERY SLOWLY AND GENTLY at 0.01 per second!
        setSleepLevel((prev) => {
          let next = prev;
          if (timeSinceStroke > 1.2) {
            const decayRate = 0.01; // exactly 0.01 per second as requested!
            next = Math.max(0, prev - decayRate * dt);

            // WAKING UP STRETCH:
            if (wasAsleepRef.current && next < 40 && prev >= 40 && !isStretching) {
              wasAsleepRef.current = false;
              setIsStretching(true);
              if (soundEnabledRef.current) {
                catAudio.playSleepyMeow();
              }
              if (stretchTimerRef.current) clearTimeout(stretchTimerRef.current);
              stretchTimerRef.current = setTimeout(() => {
                setIsStretching(false);
              }, 2400);
            }
          }

          if (Math.floor(next) !== Math.floor(prev)) {
            try {
              localStorage.setItem('quit-smoking:cat-sleep', String(Math.round(next)));
            } catch {}
          }
          return next;
        });
      }

      // Track total deep sleep duration
      if (sleepLevelRef.current >= 80) {
        setTotalSleepSeconds((sec) => {
          const nextSec = sec + dt;
          return nextSec;
        });
      }

      // Continuous imperceptible growth lerp
      renderedScaleRef.current += (targetContinuousScaleRef.current - renderedScaleRef.current) * 0.05;
      setRenderedScale(renderedScaleRef.current);

      // Tactile screen micro-vibration
      if (isPettingRef.current && timeSinceStroke <= 0.4) {
        const sleepWeight = 0.4 + (sleepLevelRef.current / 100) * 0.6;
        const intensity = Math.min(1.4, (pettingVelocityRef.current / 8) * sleepWeight + 0.3);
        setVibrationOffset({
          x: (Math.random() - 0.5) * intensity * 1.4,
          y: (Math.random() - 0.5) * intensity * 1.4
        });
      } else {
        setVibrationOffset({ x: 0, y: 0 });
      }

      // Spawn dream bubbles when cat is sleeping deeply (sleepLevel > 75)
      if (sleepLevelRef.current > 75) {
        dreamSpawnTimer += dt;
        if (dreamSpawnTimer > 3.2) {
          dreamSpawnTimer = 0;
          const randomIcon = DREAM_ICONS[Math.floor(Math.random() * DREAM_ICONS.length)];
          setDreamBubbles((prev) => [
            ...prev.slice(-3),
            {
              id: Date.now() + Math.random(),
              icon: randomIcon,
              x: 160 + (Math.random() - 0.5) * 55,
              y: 135,
              alpha: 0.85,
              scale: 0.55
            }
          ]);
          if (soundEnabledRef.current && Math.random() > 0.6) {
            catAudio.playDreamChime();
          }
        }
      } else {
        dreamSpawnTimer = 0;
      }

      // Update dream bubbles
      setDreamBubbles((prev) =>
        prev
          .map((b) => ({
            ...b,
            y: b.y - 15 * dt,
            alpha: b.alpha - 0.18 * dt,
            scale: Math.min(1.05, b.scale + 0.25 * dt)
          }))
          .filter((b) => b.alpha > 0.04)
      );

      // Update caress particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            alpha: p.alpha - 0.75 * dt
          }))
          .filter((p) => p.alpha > 0.05)
      );

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (stretchTimerRef.current) clearTimeout(stretchTimerRef.current);
    };
  }, [isStretching]);

  // Save total sleep seconds on unmount
  useEffect(() => {
    return () => {
      try {
        localStorage.setItem('quit-smoking:cat-sleep-sec', String(Math.round(totalSleepSeconds)));
      } catch {}
    };
  }, [totalSleepSeconds]);

  // STROKING / PETTING INTERACTION
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    const y = ((e.clientY - rect.top) / rect.height) * 380;

    setIsPetting(true);
    setIsStretching(false);
    lastStrokeTimeRef.current = Date.now();
    lastPosRef.current = { x, y };

    if (soundEnabled) {
      catAudio.playStrokeRipple(sleepLevelRef.current);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPetting) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    const y = ((e.clientY - rect.top) / rect.height) * 380;

    const last = lastPosRef.current || { x, y };
    const dist = Math.hypot(x - last.x, y - last.y);
    lastPosRef.current = { x, y };

    lastStrokeTimeRef.current = Date.now();

    // Check if stroke is over the cat body (approx x: 65-255, y: 130-310)
    const isOverCat = x >= 65 && x <= 255 && y >= 130 && y <= 310;

    if (dist > 2.5) {
      // Stroke fills with smooth organic resistance and micro-setbacks (ривки назад)
      const baseGain = dist * 0.09;
      // Micro fluctuation factor (-0.18 to +0.35)
      const organicFluctuation = (Math.random() - 0.35) * 0.45;
      const netGain = Math.max(-0.2, baseGain + organicFluctuation);

      setSleepLevel((prev) => {
        const next = Math.min(100, Math.max(0, prev + netGain));

        // When stroke reaches 100%, trigger 1-HOUR SLEEP TIMER!
        if (next >= 100 && !sleepUntilRef.current) {
          const newSleepUntil = Date.now() + 60 * 60 * 1000; // 1 hour
          setSleepUntil(newSleepUntil);
          sleepUntilRef.current = newSleepUntil;
          setRemainingMinutes(60);
          try {
            localStorage.setItem('quit-smoking:cat-sleep-until', String(newSleepUntil));
          } catch {}
          if (soundEnabledRef.current) {
            catAudio.playDreamChime();
          }
        }

        return next;
      });

      setPettingVelocity(dist);

      if (soundEnabledRef.current && isOverCat) {
        catAudio.playStrokeRipple(sleepLevelRef.current);
      }

      // Gentle haptic feedback
      const nowMs = Date.now();
      if (nowMs - lastHapticTimeRef.current > 130) {
        lastHapticTimeRef.current = nowMs;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(8);
          } catch {}
        }
      }

      // Caress sparkle particles
      if (isOverCat && Math.random() > 0.35) {
        const colors = ['#fef08a', '#fed7aa', '#fbcfe8', '#e0e7ff', '#a7f3d0'];
        const newParticle: CaressParticle = {
          id: Math.random() + Date.now(),
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 14,
          vy: -12 - Math.random() * 18,
          r: 1.1 + Math.random() * 1.8,
          alpha: 0.8,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
        setParticles((prev) => [...prev.slice(-25), newParticle]);
      }
    }
  };

  const handlePointerUp = () => {
    setIsPetting(false);
    lastPosRef.current = null;
  };

  // Sleep Phases
  const isDeepSleep = sleepLevel >= 85 || Boolean(sleepUntil);
  const isSleepy = sleepLevel >= 55 && sleepLevel < 85;
  const isDrowsy = sleepLevel >= 25 && sleepLevel < 55;
  const isAwake = sleepLevel < 25;

  const breathDuration = isDeepSleep ? 4.9 : isSleepy ? 4.2 : isDrowsy ? 3.2 : 2.2;

  // Status text for the petting progress bar
  const pettingStatusText = useMemo(() => {
    if (sleepUntil) return `Спить на 1 годину (залишилось ${remainingMinutes} хв) ✨`;
    if (isDeepSleep) return 'Спить міцним солодким сном ✨';
    if (isSleepy) return 'Засинає під ніжний дотик...';
    if (isDrowsy) return 'Оченята злипаються (напівдрімота)...';
    return isPetting ? 'Гладьте котика далі...' : 'Погладьте котика, щоб він заснув';
  }, [sleepUntil, remainingMinutes, isDeepSleep, isSleepy, isDrowsy, isPetting]);

  return (
    <div className="flex flex-col flex-1 pb-12 max-w-md mx-auto w-full select-none">
      {/* 1. Верхня панель: назва котика, редагування, вибір породи, тумблер таймера, звук */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {onSwitchTab && (
            <button
              type="button"
              onClick={() => onSwitchTab('counter')}
              className="p-1.5 -ml-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors flex-none"
              aria-label="Назад"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Ім'я котика з можливістю редагування */}
          <button
            type="button"
            onClick={() => {
              setTempName(customName);
              setIsEditingName(true);
            }}
            className="flex items-center gap-1.5 group cursor-pointer text-left truncate"
            title="Натисніть, щоб змінити ім'я котика"
          >
            <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-zinc-100 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate">
              {customName}
            </span>
            <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity flex-none" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-none">
          {/* Кнопка вибору породи котика */}
          <button
            type="button"
            onClick={() => setIsBreedModalOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1"
            title="Обрати котика"
          >
            <div
              className="w-4 h-4 rounded-full border border-slate-300 dark:border-zinc-600 shadow-2xs"
              style={{ backgroundColor: currentBreed.avatarColor }}
            />
          </button>

          {/* Звук */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title={soundEnabled ? 'Звук увімкнено' : 'Звук вимкнено'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>
        </div>
      </div>

      {/* 2. ГОЛОВНЕ СВЯТИЛИЩЕ: М'ЯКЕ КРІСЛО, КНИЖКОВА ШАФА, КИЛИМ, ДЕРЕВ'ЯНА ПІДЛОГА */}
      <div
        className="w-full aspect-[4/5] rounded-3xl overflow-hidden relative shadow-lg touch-none select-none border border-slate-200/60 dark:border-zinc-800/80 bg-[#0c0d12] transition-transform duration-75"
        style={{
          transform: `translate3d(${vibrationOffset.x}px, ${vibrationOffset.y}px, 0)`
        }}
      >
        <svg
          viewBox="0 0 320 380"
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            {/* 1. Deep Atmospheric Room Lighting */}
            <radialGradient id="cozyRoomGlow" cx="45%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#251a24" />
              <stop offset="45%" stopColor="#17111a" />
              <stop offset="85%" stopColor="#0d0a0f" />
              <stop offset="100%" stopColor="#070508" />
            </radialGradient>

            {/* 2. Warm Bookshelf Wood Texture */}
            <linearGradient id="bookshelfWood" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e131b" />
              <stop offset="50%" stopColor="#2d1d28" />
              <stop offset="100%" stopColor="#1a1118" />
            </linearGradient>

            {/* 3. Wooden Floor Planks Texture */}
            <linearGradient id="floorWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#221512" />
              <stop offset="50%" stopColor="#1c110e" />
              <stop offset="100%" stopColor="#120a08" />
            </linearGradient>

            {/* 4. Cozy Woven Rug Gradient */}
            <radialGradient id="rugGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#632533" />
              <stop offset="65%" stopColor="#481824" />
              <stop offset="90%" stopColor="#301018" />
              <stop offset="100%" stopColor="#1c090e" />
            </radialGradient>

            {/* 5. Plush Velvet Armchair Upholstery */}
            <radialGradient id="armchairVelvet" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#4d3345" />
              <stop offset="55%" stopColor="#382232" />
              <stop offset="90%" stopColor="#241420" />
              <stop offset="100%" stopColor="#150a13" />
            </radialGradient>

            {/* 6. Deep Velvet Seat Cushion */}
            <radialGradient id="cushionVelvet" cx="50%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#5a3d51" />
              <stop offset="60%" stopColor="#3d2537" />
              <stop offset="90%" stopColor="#281624" />
              <stop offset="100%" stopColor="#170b15" />
            </radialGradient>

            {/* 7. Warm Reading Lamp Glow */}
            <radialGradient id="lampGlow" cx="20%" cy="20%" r="45%">
              <stop offset="0%" stopColor="rgba(253, 224, 71, 0.22)" />
              <stop offset="50%" stopColor="rgba(251, 146, 60, 0.08)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>

            {/* Dynamic Cat Fur Gradient from Selected Breed */}
            <radialGradient id="catFurGrad" cx="42%" cy="38%" r="62%">
              <stop offset="0%" stopColor={currentBreed.furGradient.start} />
              <stop offset="45%" stopColor={currentBreed.furGradient.mid} />
              <stop offset="85%" stopColor={currentBreed.furGradient.dark} />
              <stop offset="100%" stopColor={currentBreed.furGradient.shadow} />
            </radialGradient>

            {/* Creamy Belly / Highlights Gradient */}
            <radialGradient id="catBellyGrad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor={currentBreed.bellyColor.start} />
              <stop offset="80%" stopColor={currentBreed.bellyColor.end} />
              <stop offset="100%" stopColor={currentBreed.furGradient.mid} />
            </radialGradient>

            {/* Aura of Warmth & Purr Pulses */}
            <radialGradient id="purrHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(251, 146, 60, 0.2)" />
              <stop offset="60%" stopColor="rgba(251, 146, 60, 0.04)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>
          </defs>

          {/* 1. ROOM BACKGROUND (Затишна вечірня кімната) */}
          <rect width="320" height="380" fill="url(#cozyRoomGlow)" />

          {/* Warm Reading Lamp Halo */}
          <rect width="320" height="380" fill="url(#lampGlow)" />

          {/* 2. КНИЖКОВА ШАФА НА ФОНІ (Bookshelf on the background) */}
          <g opacity="0.85">
            {/* Bookshelf Frame */}
            <rect x="25" y="15" width="270" height="155" rx="4" fill="url(#bookshelfWood)" stroke="#3a2534" strokeWidth="1.2" />

            {/* Shelf 1 Divider */}
            <rect x="30" y="65" width="260" height="6" fill="#382433" rx="1.5" />
            {/* Shelf 2 Divider */}
            <rect x="30" y="118" width="260" height="6" fill="#382433" rx="1.5" />

            {/* Books on Shelf 1 */}
            <rect x="38" y="26" width="10" height="39" fill="#9f1239" rx="1" />
            <rect x="49" y="22" width="13" height="43" fill="#1e3a8a" rx="1" />
            <rect x="63" y="28" width="9" height="37" fill="#854d0e" rx="1" />
            <rect x="73" y="24" width="14" height="41" fill="#14532d" rx="1" />
            <rect x="88" y="30" width="11" height="35" fill="#581c87" rx="1" />

            {/* Leaning book on Shelf 1 */}
            <polygon points="102,65 110,65 124,32 116,32" fill="#9a3412" />

            {/* Potted Little Ivy on Shelf 1 */}
            <ellipse cx="230" cy="58" rx="8" ry="6" fill="#b45309" />
            <path d="M228,52 Q222,44 218,48 Q222,54 228,52" fill="#22c55e" opacity="0.85" />
            <path d="M232,52 Q238,42 244,46 Q240,54 232,52" fill="#16a34a" opacity="0.85" />
            <path d="M230,50 Q230,38 226,34 Q234,36 230,50" fill="#4ade80" opacity="0.85" />

            {/* Books on Shelf 2 */}
            <rect x="38" y="78" width="12" height="40" fill="#0369a1" rx="1" />
            <rect x="51" y="74" width="11" height="44" fill="#a16207" rx="1" />
            <rect x="63" y="80" width="15" height="38" fill="#4c1d95" rx="1" />
            <rect x="79" y="76" width="9" height="42" fill="#991b1b" rx="1" />

            {/* Horizontal stack of books */}
            <rect x="180" y="108" width="34" height="9" fill="#0f766e" rx="1" />
            <rect x="184" y="99" width="28" height="8" fill="#b45309" rx="1" />
            <rect x="187" y="92" width="22" height="7" fill="#831843" rx="1" />

            {/* Books on right side of Shelf 2 */}
            <rect x="235" y="75" width="13" height="43" fill="#365314" rx="1" />
            <rect x="249" y="79" width="10" height="39" fill="#701a75" rx="1" />
            <rect x="260" y="72" width="14" height="46" fill="#1e293b" rx="1" />
          </g>

          {/* 3. ДЕРЕВ'ЯНА ПІДЛОГА (Wooden plank floor with rich lines) */}
          <g>
            <rect x="0" y="270" width="320" height="110" fill="url(#floorWood)" />
            {/* Wooden Floor Planks Lines */}
            <line x1="0" y1="298" x2="320" y2="298" stroke="#100806" strokeWidth="1.2" opacity="0.8" />
            <line x1="0" y1="332" x2="320" y2="332" stroke="#100806" strokeWidth="1.2" opacity="0.8" />
            <line x1="0" y1="364" x2="320" y2="364" stroke="#100806" strokeWidth="1.2" opacity="0.8" />

            {/* Vertical Wood Joints */}
            <line x1="75" y1="270" x2="75" y2="298" stroke="#0e0705" strokeWidth="1" opacity="0.6" />
            <line x1="220" y1="270" x2="220" y2="298" stroke="#0e0705" strokeWidth="1" opacity="0.6" />
            <line x1="140" y1="298" x2="140" y2="332" stroke="#0e0705" strokeWidth="1" opacity="0.6" />
            <line x1="285" y1="298" x2="285" y2="332" stroke="#0e0705" strokeWidth="1" opacity="0.6" />
            <line x1="60" y1="332" x2="60" y2="364" stroke="#0e0705" strokeWidth="1" opacity="0.6" />
            <line x1="195" y1="332" x2="195" y2="364" stroke="#0e0705" strokeWidth="1" opacity="0.6" />
          </g>

          {/* 4. ЗАТИШНИЙ ТКАНИЙ КИЛИМ (Cozy Oriental Woven Rug) */}
          <g>
            <ellipse cx="160" cy="305" rx="142" ry="54" fill="url(#rugGrad)" />
            {/* Rug Fringe / Border Patterns */}
            <ellipse cx="160" cy="305" rx="136" ry="50" fill="none" stroke="#d97706" strokeWidth="1.2" opacity="0.65" strokeDasharray="3 2" />
            <ellipse cx="160" cy="305" rx="124" ry="43" fill="none" stroke="#fbbf24" strokeWidth="0.9" opacity="0.4" />
            <ellipse cx="160" cy="305" rx="95" ry="30" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.3" />
          </g>

          {/* 5. М'ЯКЕ ЗАТИШНЕ КРІСЛО (Plush Velvet Armchair) */}
          <g>
            {/* Armchair Backrest (Tufted velvet curve) */}
            <path
              d="M60,195 C60,110 100,85 160,85 C220,85 260,110 260,195 C260,225 240,240 160,240 C80,240 60,225 60,195 Z"
              fill="url(#armchairVelvet)"
            />
            {/* Velvet Tufting Seams / Highlights */}
            <path d="M110,125 Q160,140 210,125" stroke="#5d3f54" strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M95,160 Q160,180 225,160" stroke="#5d3f54" strokeWidth="1.2" fill="none" opacity="0.6" />
            <circle cx="160" cy="138" r="2.5" fill="#301828" />
            <circle cx="125" cy="155" r="2" fill="#301828" />
            <circle cx="195" cy="155" r="2" fill="#301828" />

            {/* Armchair Left Armrest */}
            <ellipse cx="58" cy="225" rx="20" ry="34" fill="url(#armchairVelvet)" />
            <ellipse cx="58" cy="225" rx="14" ry="26" fill="#4d3345" opacity="0.5" />

            {/* Armchair Right Armrest */}
            <ellipse cx="262" cy="225" rx="20" ry="34" fill="url(#armchairVelvet)" />
            <ellipse cx="262" cy="225" rx="14" ry="26" fill="#4d3345" opacity="0.5" />

            {/* Deep Plush Seat Cushion (where the cat sleeps!) */}
            <ellipse cx="160" cy="242" rx="100" ry="50" fill="url(#cushionVelvet)" />
            <ellipse cx="160" cy="242" rx="100" ry="50" fill="none" stroke="#6b4761" strokeWidth="1.5" opacity="0.75" />

            {/* Shadow inside cushion indentation */}
            <ellipse cx="160" cy="246" rx="78" ry="34" fill="rgba(10, 5, 12, 0.75)" />
          </g>

          {/* Purring Aura Wave */}
          {isPetting && (
            <ellipse
              cx="160"
              cy="235"
              rx="135"
              ry="85"
              fill="url(#purrHalo)"
              className="animate-ping"
              style={{ animationDuration: '3.2s' }}
            />
          )}

          {/* 6. DYNAMIC CAT RENDERING WITH SUBPIXEL IMPERCEPTIBLE SCALING */}
          <g
            transform={`translate(160, 235) scale(${renderedScale.toFixed(4)}) translate(-160, -235)`}
          >
            {/* ========================================================================= */}
            {/* POSTURE 1: STRETCHING (Потягування при пробудженні) */}
            {/* ========================================================================= */}
            {isStretching ? (
              <g className="animate-fadeIn">
                {/* Tail pointing playfully up */}
                <path
                  d="M90,230 C70,180 75,140 100,120"
                  fill="none"
                  stroke="url(#catFurGrad)"
                  strokeWidth="15"
                  strokeLinecap="round"
                />
                {/* Arched body */}
                <path
                  d="M100,240 Q135,185 190,215 Q225,235 240,255 L130,260 Z"
                  fill="url(#catFurGrad)"
                />
                {/* Stretched front paws */}
                <path
                  d="M200,235 L260,265"
                  stroke="url(#catFurGrad)"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <circle cx="260" cy="265" r="7.5" fill={currentBreed.bellyColor.start} />

                {/* Head stretching low */}
                <g transform="translate(195, 205)">
                  <polygon points="-16,-10 -24,-32 -5,-18" fill="url(#catFurGrad)" />
                  <polygon points="5,-18 24,-32 16,-10" fill="url(#catFurGrad)" />
                  <circle cx="0" cy="0" r="28" fill="url(#catFurGrad)" />
                  <ellipse cx="-8" cy="8" rx="12" ry="9" fill="url(#catBellyGrad)" />
                  <ellipse cx="8" cy="8" rx="12" ry="9" fill="url(#catBellyGrad)" />
                  <polygon points="0,3 -2.5,0 2.5,0" fill={currentBreed.noseColor} />
                  {/* Blinking eyes */}
                  <path d="M-14,-2 Q-8,-6 -2,-2" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M2,-2 Q8,-6 14,-2" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
                </g>
              </g>
            ) : isDeepSleep ? (
              /* ========================================================================= */
              /* POSTURE 2: DEEP SLUMBER (Спить міцним солодким калачиком / Donut pose) */
              /* ========================================================================= */
              <g
                style={{
                  transformOrigin: '160px 235px',
                  animation: `catBreathe ${breathDuration}s ease-in-out infinite`
                }}
              >
                {/* Tail curled tight around the body */}
                <path
                  d="M95,240 C70,195 100,165 145,170 C190,175 225,210 215,245 C205,270 140,280 105,260"
                  fill="none"
                  stroke="url(#catFurGrad)"
                  strokeWidth="17"
                  strokeLinecap="round"
                />
                {currentBreed.tailTipColor && (
                  <circle cx="105" cy="260" r="8.5" fill={currentBreed.tailTipColor} />
                )}

                {/* Tight Donut Body */}
                <ellipse cx="160" cy="235" rx="66" ry="50" fill="url(#catFurGrad)" />
                <ellipse cx="165" cy="242" rx="42" ry="28" fill="url(#catBellyGrad)" opacity="0.95" />

                {/* Head resting snugly tucked into the curl */}
                <g transform="translate(135, 215)">
                  {/* Ears relaxed back */}
                  <polygon points="-18,-8 -26,-28 -6,-16" fill="url(#catFurGrad)" />
                  <polygon points="-17,-10 -23,-25 -9,-16" fill={currentBreed.innerEar} opacity="0.8" />

                  <polygon points="6,-16 26,-28 18,-8" fill="url(#catFurGrad)" />
                  <polygon points="9,-16 23,-25 17,-10" fill={currentBreed.innerEar} opacity="0.8" />

                  <circle cx="0" cy="0" r="30" fill="url(#catFurGrad)" />
                  <ellipse cx="-10" cy="9" rx="13" ry="9" fill="url(#catBellyGrad)" />
                  <ellipse cx="10" cy="9" rx="13" ry="9" fill="url(#catBellyGrad)" />

                  {/* Nose */}
                  <polygon points="0,4 -2.5,1 2.5,1" fill={currentBreed.noseColor} />

                  {/* Sleeping Eyes (Happy curved crescents) */}
                  <path d="M-16,0 Q-10,-6 -4,0" fill="none" stroke="#2a1208" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M4,0 Q10,-6 16,0" fill="none" stroke="#2a1208" strokeWidth="2.4" strokeLinecap="round" />

                  {/* Soft Rosy Cheek Glow */}
                  <ellipse cx="-14" cy="6" rx="4.5" ry="2.5" fill="#f472b6" opacity="0.4" />
                  <ellipse cx="14" cy="6" rx="4.5" ry="2.5" fill="#f472b6" opacity="0.4" />

                  {/* Whiskers */}
                  <path d="M-12,7 Q-26,5 -36,2 M-12,9 Q-26,10 -34,13" stroke={currentBreed.whiskerColor} strokeWidth="0.85" fill="none" opacity="0.8" />
                  <path d="M12,7 Q26,5 36,2 M12,9 Q26,10 34,13" stroke={currentBreed.whiskerColor} strokeWidth="0.85" fill="none" opacity="0.8" />
                </g>
              </g>
            ) : isSleepy ? (
              /* ========================================================================= */
              /* POSTURE 3: SLEEPY / LYING FLAT (Лежить затишно на боці) */
              /* ========================================================================= */
              <g
                style={{
                  transformOrigin: '160px 240px',
                  animation: `catBreathe ${breathDuration}s ease-in-out infinite`
                }}
              >
                {/* Relaxed tail */}
                <path
                  d="M80,248 C55,225 58,190 80,180 C92,175 100,188 90,202 C82,216 90,240 120,255"
                  fill="none"
                  stroke="url(#catFurGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Main Body */}
                <ellipse cx="160" cy="235" rx="76" ry="50" fill="url(#catFurGrad)" />
                <ellipse cx="170" cy="245" rx="45" ry="28" fill="url(#catBellyGrad)" opacity="0.95" />

                {/* Paws tucked in */}
                <ellipse cx="195" cy="265" rx="10" ry="7" fill={currentBreed.bellyColor.start} />
                <ellipse cx="175" cy="267" rx="9.5" ry="6.5" fill={currentBreed.bellyColor.start} />

                {/* Cat Head resting down */}
                <g transform="translate(130, 202)">
                  <polygon points="-20,-12 -32,-36 -7,-22" fill="url(#catFurGrad)" />
                  <polygon points="-19,-14 -28,-31 -10,-22" fill={currentBreed.innerEar} opacity="0.75" />

                  <polygon points="7,-22 32,-36 20,-12" fill="url(#catFurGrad)" />
                  <polygon points="10,-22 28,-31 19,-14" fill={currentBreed.innerEar} opacity="0.75" />

                  <circle cx="0" cy="0" r="34" fill="url(#catFurGrad)" />
                  <ellipse cx="-11" cy="11" rx="15" ry="11" fill="url(#catBellyGrad)" />
                  <ellipse cx="11" cy="11" rx="15" ry="11" fill="url(#catBellyGrad)" />
                  <polygon points="0,5 -3,1 3,1" fill={currentBreed.noseColor} />

                  {/* Sleeping eyes */}
                  <path d="M-18,0 Q-11,-6 -4,0" fill="none" stroke="#2a1208" strokeWidth="2.3" strokeLinecap="round" />
                  <path d="M4,0 Q11,-6 18,0" fill="none" stroke="#2a1208" strokeWidth="2.3" strokeLinecap="round" />

                  {/* Whiskers */}
                  <path d="M-14,8 Q-30,6 -40,3 M-14,10 Q-30,11 -38,14" stroke={currentBreed.whiskerColor} strokeWidth="0.85" fill="none" opacity="0.8" />
                  <path d="M14,8 Q30,6 40,3 M14,10 Q30,11 38,14" stroke={currentBreed.whiskerColor} strokeWidth="0.85" fill="none" opacity="0.8" />
                </g>
              </g>
            ) : isDrowsy ? (
              /* ========================================================================= */
              /* POSTURE 4: DROWSY / SINKING DOWN (Напівдрімота, примружені очі) */
              /* ========================================================================= */
              <g
                style={{
                  transformOrigin: '160px 240px',
                  animation: `catBreathe ${breathDuration}s ease-in-out infinite`
                }}
              >
                {/* Tail */}
                <path
                  d="M80,248 C55,225 60,195 82,185"
                  fill="none"
                  stroke="url(#catFurGrad)"
                  strokeWidth="15"
                  strokeLinecap="round"
                />

                <ellipse cx="160" cy="235" rx="72" ry="52" fill="url(#catFurGrad)" />
                <ellipse cx="165" cy="244" rx="42" ry="30" fill="url(#catBellyGrad)" opacity="0.95" />

                {/* Head slightly higher, blinking eyes */}
                <g transform="translate(135, 192)">
                  <polygon points="-20,-14 -32,-40 -7,-24" fill="url(#catFurGrad)" />
                  <polygon points="-19,-16 -28,-35 -10,-24" fill={currentBreed.innerEar} opacity="0.75" />

                  <polygon points="7,-24 32,-40 20,-14" fill="url(#catFurGrad)" />
                  <polygon points="10,-24 28,-35 19,-16" fill={currentBreed.innerEar} opacity="0.75" />

                  <circle cx="0" cy="0" r="35" fill="url(#catFurGrad)" />
                  <ellipse cx="-12" cy="11" rx="15" ry="11" fill="url(#catBellyGrad)" />
                  <ellipse cx="12" cy="11" rx="15" ry="11" fill="url(#catBellyGrad)" />
                  <polygon points="0,5 -3,1 3,1" fill={currentBreed.noseColor} />

                  {/* Half-lidded drowsy eyes */}
                  <ellipse cx="-12" cy="-1" rx="6" ry="3" fill={currentBreed.eyeColor} stroke="#2a1208" strokeWidth="1.4" />
                  <ellipse cx="-12" cy="-1" rx="2" ry="2.5" fill={currentBreed.pupilColor} />
                  <path d="M-18,-2 Q-12,-5 -6,-2" stroke="#2a1208" strokeWidth="2" fill="none" strokeLinecap="round" />

                  <ellipse cx="12" cy="-1" rx="6" ry="3" fill={currentBreed.eyeColor} stroke="#2a1208" strokeWidth="1.4" />
                  <ellipse cx="12" cy="-1" rx="2" ry="2.5" fill={currentBreed.pupilColor} />
                  <path d="M6,-2 Q12,-5 18,-2" stroke="#2a1208" strokeWidth="2" fill="none" strokeLinecap="round" />

                  {/* Whiskers */}
                  <path d="M-14,8 Q-30,6 -40,3 M-14,10 Q-30,11 -38,14" stroke={currentBreed.whiskerColor} strokeWidth="0.85" fill="none" opacity="0.8" />
                  <path d="M14,8 Q30,6 40,3 M14,10 Q30,11 38,14" stroke={currentBreed.whiskerColor} strokeWidth="0.85" fill="none" opacity="0.8" />
                </g>
              </g>
            ) : (
              /* ========================================================================= */
              /* POSTURE 5: AWAKE & ALERT (Сидить у кріслі, великі добрі очі) */
              /* ========================================================================= */
              <g
                style={{
                  transformOrigin: '160px 240px',
                  animation: `catBreathe ${breathDuration}s ease-in-out infinite`
                }}
              >
                {/* Active alert tail swaying */}
                <path
                  d="M75,245 C50,210 50,165 75,145 C85,138 95,148 85,165"
                  fill="none"
                  stroke="url(#catFurGrad)"
                  strokeWidth="15"
                  strokeLinecap="round"
                />

                {/* Sitting Upright Body */}
                <ellipse cx="160" cy="235" rx="68" ry="54" fill="url(#catFurGrad)" />
                <ellipse cx="160" cy="240" rx="38" ry="36" fill="url(#catBellyGrad)" opacity="0.95" />

                {/* Front Sitting Paws */}
                <ellipse cx="145" cy="272" rx="9" ry="6.5" fill={currentBreed.bellyColor.start} />
                <ellipse cx="175" cy="272" rx="9" ry="6.5" fill={currentBreed.bellyColor.start} />

                {/* Upright Head */}
                <g transform="translate(160, 180)">
                  <polygon points="-22,-16 -36,-44 -8,-28" fill="url(#catFurGrad)" />
                  <polygon points="-21,-18 -32,-38 -12,-28" fill={currentBreed.innerEar} opacity="0.8" />

                  <polygon points="8,-28 36,-44 22,-16" fill="url(#catFurGrad)" />
                  <polygon points="12,-28 32,-38 21,-18" fill={currentBreed.innerEar} opacity="0.8" />

                  <circle cx="0" cy="0" r="36" fill="url(#catFurGrad)" />
                  <ellipse cx="-13" cy="12" rx="16" ry="12" fill="url(#catBellyGrad)" />
                  <ellipse cx="13" cy="12" rx="16" ry="12" fill="url(#catBellyGrad)" />
                  <polygon points="0,5 -3,1 3,1" fill={currentBreed.noseColor} />

                  {/* Cute Mouth */}
                  <path d="M-5,10 Q-2.5,13 0,8 Q2.5,13 5,10" fill="none" stroke="#2a1208" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Big Open Round Curious Eyes */}
                  <ellipse cx="-13" cy="-2" rx="7.5" ry="8.5" fill={currentBreed.eyeColor} stroke="#2a1208" strokeWidth="1.5" />
                  <ellipse cx="-13" cy="-2" rx="4.2" ry="6.5" fill={currentBreed.pupilColor} />
                  <circle cx="-15" cy="-4.5" r="2.2" fill="#ffffff" />
                  <circle cx="-11" cy="-0.5" r="1.1" fill="#ffffff" />

                  <ellipse cx="13" cy="-2" rx="7.5" ry="8.5" fill={currentBreed.eyeColor} stroke="#2a1208" strokeWidth="1.5" />
                  <ellipse cx="13" cy="-2" rx="4.2" ry="6.5" fill={currentBreed.pupilColor} />
                  <circle cx="11" cy="-4.5" r="2.2" fill="#ffffff" />
                  <circle cx="15" cy="-0.5" r="1.1" fill="#ffffff" />

                  {/* Whiskers */}
                  <path d="M-16,8 Q-34,6 -44,3 M-16,11 Q-34,12 -42,15 M-16,14 Q-32,18 -40,24" stroke={currentBreed.whiskerColor} strokeWidth="0.9" fill="none" opacity="0.85" />
                  <path d="M16,8 Q34,6 44,3 M16,11 Q34,12 42,15 M16,14 Q32,18 40,24" stroke={currentBreed.whiskerColor} strokeWidth="0.9" fill="none" opacity="0.85" />
                </g>
              </g>
            )}
          </g>

          {/* 7. DREAM BUBBLES FLOATING UP (When sleeping deeply) */}
          {dreamBubbles.map((db) => (
            <g
              key={db.id}
              transform={`translate(${db.x}, ${db.y}) scale(${db.scale})`}
              opacity={db.alpha}
              className="pointer-events-none"
            >
              <circle cx="0" cy="0" r="15" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
              <text x="0" y="5" textAnchor="middle" fontSize="12" className="select-none">
                {db.icon}
              </text>
            </g>
          ))}

          {/* 8. CARESS SPARKLE PARTICLES ALONG THE STROKE */}
          {particles.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill={p.color}
              opacity={p.alpha}
              className="pointer-events-none"
            />
          ))}

          {/* 9. ІНТЕРАКТИВНІ ПРЕДМЕТИ КІМНАТИ (Тарілка з їжею, миска з водою, іграшка, лоток) */}
          <g>
            {/* ТАРІЛКА З ЇЖЕЮ */}
            <g
              transform="translate(20, 312)"
              className="cursor-pointer group"
              onPointerDown={(e) => { e.stopPropagation(); handleFeedCat(e); }}
            >
              <ellipse cx="16" cy="12" rx="15" ry="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <ellipse cx="16" cy="11" rx="13" ry="6" fill="#f8fafc" />
              <ellipse cx="16" cy="11" rx="10" ry="4" fill={foodLevel > 20 ? '#d97706' : '#94a3b8'} />
              <text x="16" y="10" textAnchor="middle" fontSize="10" className="select-none pointer-events-none">
                {foodLevel > 20 ? '🐟' : '🦴'}
              </text>
              <text x="16" y="24" textAnchor="middle" fontSize="7" fill="#cbd5e1" className="font-sans font-bold select-none pointer-events-none">
                Їжа
              </text>
            </g>

            {/* МИСКА З ВОДОЮ */}
            <g
              transform="translate(58, 318)"
              className="cursor-pointer group"
              onPointerDown={(e) => { e.stopPropagation(); handleWaterCat(e); }}
            >
              <ellipse cx="15" cy="10" rx="14" ry="7" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              <ellipse cx="15" cy="9" rx="12" ry="5.5" fill="#38bdf8" opacity={waterLevel > 15 ? "0.9" : "0.3"} />
              <ellipse cx="13" cy="8" rx="7" ry="2" fill="#ffffff" opacity="0.6" />
              <text x="15" y="22" textAnchor="middle" fontSize="7" fill="#38bdf8" className="font-sans font-bold select-none pointer-events-none">
                Вода
              </text>
            </g>

            {/* ІГРАШКА - КЛУБОК ТА МИШКА */}
            <g
              transform={`translate(220, ${toyBounce ? 308 : 316})`}
              className="cursor-pointer group"
              onPointerDown={(e) => { e.stopPropagation(); handlePlayWithToy(e); }}
            >
              <circle cx="10" cy="8" r="8.5" fill="#c084fc" />
              <path d="M4,8 Q10,2 16,8 M4,10 Q10,14 16,10" stroke="#f472b6" strokeWidth="1" fill="none" />
              <path d="M16,10 Q22,14 26,12" stroke="#c084fc" strokeWidth="1.2" fill="none" />
              <ellipse cx="32" cy="11" rx="6" ry="3.5" fill="#94a3b8" />
              <circle cx="37" cy="10" r="1.5" fill="#f472b6" />
              <path d="M26,11 Q22,10 20,13" stroke="#64748b" strokeWidth="0.8" fill="none" />
              <text x="21" y="22" textAnchor="middle" fontSize="7" fill="#e9d5ff" className="font-sans font-bold select-none pointer-events-none">
                Іграшка
              </text>
            </g>

            {/* ЛОТОК ДЛЯ КОТИКА */}
            <g
              transform="translate(258, 298)"
              className="cursor-pointer group"
              onPointerDown={(e) => { e.stopPropagation(); handleCleanLitter(e); }}
            >
              <rect x="0" y="0" width="48" height="28" rx="5" fill="#334155" stroke="#475569" strokeWidth="1" />
              <rect x="3" y="3" width="42" height="22" rx="3" fill={litterCleanliness > 50 ? "#fef3c7" : "#78350f"} />
              {litterCleanliness <= 50 && (
                <text x="24" y="18" textAnchor="middle" fontSize="10" className="select-none pointer-events-none">
                  💩
                </text>
              )}
              {litterCleanliness > 50 && (
                <path d="M8,14 L16,14 M24,10 L32,10 M14,20 L28,20" stroke="#f59e0b" strokeWidth="0.8" opacity="0.6" />
              )}
              <text x="24" y="36" textAnchor="middle" fontSize="7" fill={litterCleanliness < 40 ? "#f87171" : "#34d399"} className="font-sans font-bold select-none pointer-events-none">
                {litterCleanliness < 40 ? 'Брудний лоток' : 'Лоток'}
              </text>
            </g>
          </g>
        </svg>

        {/* Action Feedback Toast */}
        {activeActionMsg && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-lg animate-bounce z-30 pointer-events-none">
            {activeActionMsg}
          </div>
        )}

        {/* TOP GLASS HUD OVERLAY: Sleep Status & Timer */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 z-20 pointer-events-none">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border text-white text-[11px] font-medium shadow-md pointer-events-auto transition-all ${
            foodLevel <= 5 || waterLevel <= 5 || joyLevel <= 5 || litterCleanliness <= 5
              ? 'bg-rose-950/85 border-rose-500/90 text-rose-200 animate-pulse shadow-lg shadow-rose-500/30 font-bold'
              : 'bg-black/60 border-white/15'
          }`}>
            <span>
              {foodLevel <= 5 || waterLevel <= 5 || joyLevel <= 5 || litterCleanliness <= 5
                ? '⚠️'
                : sleepUntil ? '✨' : isDeepSleep ? '🌙' : isSleepy ? '😴' : isDrowsy ? '🥱' : '🐾'}
            </span>
            <span className="truncate max-w-[140px] font-semibold">
              {foodLevel <= 5 || waterLevel <= 5 || joyLevel <= 5 || litterCleanliness <= 5
                ? 'Потрібна увага!'
                : pettingStatusText}
            </span>
            <span className="font-mono font-bold text-amber-400">{Math.round(sleepLevel)}%</span>
          </div>

          {showTimerBadge && sleepUntil && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-400 text-[10px] font-mono font-bold border border-amber-500/40 shadow-md animate-pulse pointer-events-none flex-none">
              <Moon className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{remainingMinutes} хв</span>
            </div>
          )}
        </div>

        {/* Intuitive Gentle Prompt Overlay when awake */}
        {isAwake && !isPetting && !isStretching && !sleepUntil && (
          <div className="absolute inset-x-0 bottom-14 flex justify-center pointer-events-none animate-bounce z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-[11px] font-medium border border-white/10 shadow-lg">
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>Гладьте котика, щоб він заснув</span>
            </div>
          </div>
        )}

        {/* BOTTOM GLASS HUD OVERLAY: Sleep Progress Line & Compact Tamagotchi Needs */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-20 flex flex-col gap-1.5 pointer-events-none">
          {/* Thin Sleep Progress Bar */}
          <div className="w-full h-1.5 bg-black/50 backdrop-blur-sm rounded-full overflow-hidden p-0.5 border border-white/10 shadow-sm">
            <div
              className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300"
              style={{ width: `${Math.max(3, sleepLevel)}%` }}
            />
          </div>

          {/* 4 Compact Interactive Needs Badges */}
          <div className="grid grid-cols-4 gap-1.5 pointer-events-auto">
            {/* Їжа */}
            <button
              type="button"
              onClick={handleFeedCat}
              className={`py-1.5 px-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 hover:bg-black/80 transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 ${
                foodLevel < 30 ? 'border-rose-500/80 bg-rose-950/70 animate-pulse' : ''
              }`}
              title="Нагодувати котика"
            >
              <span className="text-[11px]">🍗</span>
              <span className={`font-mono text-[10px] font-bold ${foodLevel < 30 ? 'text-rose-400 font-extrabold' : 'text-amber-300'}`}>
                {Math.round(foodLevel)}%
              </span>
            </button>

            {/* Вода */}
            <button
              type="button"
              onClick={handleWaterCat}
              className={`py-1.5 px-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 hover:bg-black/80 transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 ${
                waterLevel < 30 ? 'border-rose-500/80 bg-rose-950/70 animate-pulse' : ''
              }`}
              title="Напоїти котика"
            >
              <span className="text-[11px]">💧</span>
              <span className={`font-mono text-[10px] font-bold ${waterLevel < 30 ? 'text-rose-400 font-extrabold' : 'text-sky-300'}`}>
                {Math.round(waterLevel)}%
              </span>
            </button>

            {/* Гра */}
            <button
              type="button"
              onClick={handlePlayWithToy}
              className={`py-1.5 px-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 hover:bg-black/80 transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 ${
                joyLevel < 30 ? 'border-rose-500/80 bg-rose-950/70 animate-pulse' : ''
              }`}
              title="Погратися з котиком"
            >
              <span className="text-[11px]">🧶</span>
              <span className={`font-mono text-[10px] font-bold ${joyLevel < 30 ? 'text-rose-400 font-extrabold' : 'text-purple-300'}`}>
                {Math.round(joyLevel)}%
              </span>
            </button>

            {/* Лоток */}
            <button
              type="button"
              onClick={handleCleanLitter}
              className={`py-1.5 px-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 hover:bg-black/80 transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 ${
                litterCleanliness < 30 ? 'border-rose-500/80 bg-rose-950/70 animate-pulse' : ''
              }`}
              title="Прибрати лоток"
            >
              <span className="text-[11px]">🧹</span>
              <span className={`font-mono text-[10px] font-bold ${litterCleanliness < 30 ? 'text-rose-400 font-extrabold' : 'text-emerald-300'}`}>
                {Math.round(litterCleanliness)}%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Назвати котика */}
      {isEditingName && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsEditingName(false)}
        >
          <div
            className="bg-white dark:bg-[#18181c] border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl scale-in-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                  Як звуть вашого котика?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              Дайте своєму вірному пухнастому супутнику особливе ім'я.
            </p>

            <form onSubmit={handleSaveName} className="space-y-3">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Введіть ім'я (напр. Барсик, Мурчик...)"
                maxLength={24}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTempName(currentBreed.defaultName);
                  }}
                  className="px-3 py-2 text-xs text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  За замовчуванням
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Зберегти ім'я</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Вибір породи котика */}
      {isBreedModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsBreedModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#18181c] border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl scale-in-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                  Оберіть котика
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBreedModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {CAT_BREEDS.map((b) => {
                const isSelected = b.id === breedId;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBreed(b.id)}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15'
                        : 'border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border border-slate-300 dark:border-zinc-600 flex-none shadow-xs"
                        style={{ backgroundColor: b.avatarColor }}
                      />
                      <div className="text-left">
                        <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          {b.defaultName}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                          {b.colorName}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-500 flex-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for organic cat breathing */}
      <style>{`
        @keyframes catBreathe {
          0%, 100% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.02, 0.985) translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
};
