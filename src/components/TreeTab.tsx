import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TreeState, TreeSpeciesId, CurrentTree, ForestTree } from '../types';
import { TREE_SPECIES } from '../data/treeSpecies';
import { CozyForestModal } from './CozyForestModal';
import {
  ArrowLeft,
  Trees,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Sparkles,
  X,
  Compass,
  Clock,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

export interface TreeTabProps {
  treeState?: TreeState;
  money?: any;
  cigsAvoided?: number;
  totalSeconds?: number;
  onUpdateTreeState?: (newState: TreeState) => void;
  onSwitchTab?: (tab: any) => void;
}

const CIGS_PER_SEED = 300;
const MATURATION_DAYS = 20;
const MATURATION_MS = MATURATION_DAYS * 24 * 3600 * 1000;

// ========================================================
// 7 DISTINCT TIME-OF-DAY PERIODS & REAL ASTRONOMICAL ENGINE
// ========================================================
export type TimeOfDay = 'predawn' | 'dawn' | 'morning' | 'day' | 'twilight' | 'evening' | 'night';

export interface AtmosphereSettings {
  period: TimeOfDay;
  periodName: string;
  icon: string;
  skyTop: string;
  skyMid1: string;
  skyMid2: string;
  skyHorizon: string;
  groundBase: string;
  groundTop: string;
  hazeColor: string;
  showSun: boolean;
  sunX?: number;
  sunY?: number;
  sunRadius?: number;
  sunCoreColor?: string;
  sunCoronaColor?: string;
  showMoon: boolean;
  moonOpacity: number;
  lightTone: 'cool' | 'warm-gold' | 'fresh-day' | 'noon' | 'sunset' | 'deep-violet' | 'nocturnal';
}

export const ATMOSPHERES: Record<TimeOfDay, AtmosphereSettings> = {
  predawn: {
    period: 'predawn',
    periodName: 'Досвіток',
    icon: '🌌',
    skyTop: '#060B18',
    skyMid1: '#12172E',
    skyMid2: '#281C38',
    skyHorizon: '#48243F',
    groundBase: '#0A120E',
    groundTop: '#182B20',
    hazeColor: 'rgba(120, 70, 130, 0.22)',
    showSun: false,
    showMoon: true,
    moonOpacity: 0.95,
    lightTone: 'cool'
  },
  dawn: {
    period: 'dawn',
    periodName: 'Світанок',
    icon: '🌅',
    skyTop: '#0F1A30',
    skyMid1: '#26294A',
    skyMid2: '#583648',
    skyHorizon: '#965036',
    groundBase: '#121A0F',
    groundTop: '#2C4422',
    hazeColor: 'rgba(235, 135, 80, 0.28)',
    showSun: true,
    sunX: 0.22,
    sunY: 0.38,
    sunRadius: 26,
    sunCoreColor: '#FFAE42',
    sunCoronaColor: 'rgba(255, 175, 75, 0.45)',
    showMoon: false,
    moonOpacity: 0,
    lightTone: 'warm-gold'
  },
  morning: {
    period: 'morning',
    periodName: 'Ранок',
    icon: '🌤️',
    skyTop: '#1A4260',
    skyMid1: '#2B6178',
    skyMid2: '#3E8388',
    skyHorizon: '#52A188',
    groundBase: '#102414',
    groundTop: '#326335',
    hazeColor: 'rgba(110, 205, 160, 0.22)',
    showSun: true,
    sunX: 0.32,
    sunY: 0.24,
    sunRadius: 28,
    sunCoreColor: '#FFF4CC',
    sunCoronaColor: 'rgba(255, 235, 155, 0.5)',
    showMoon: false,
    moonOpacity: 0,
    lightTone: 'fresh-day'
  },
  day: {
    period: 'day',
    periodName: 'День',
    icon: '☀️',
    skyTop: '#1B4F73',
    skyMid1: '#2A6F89',
    skyMid2: '#3B8E92',
    skyHorizon: '#49B091',
    groundBase: '#122816',
    groundTop: '#38733A',
    hazeColor: 'rgba(85, 190, 145, 0.22)',
    showSun: true,
    sunX: 0.50,
    sunY: 0.15,
    sunRadius: 30,
    sunCoreColor: '#FFFFFF',
    sunCoronaColor: 'rgba(255, 248, 220, 0.65)',
    showMoon: false,
    moonOpacity: 0,
    lightTone: 'noon'
  },
  twilight: {
    period: 'twilight',
    periodName: 'Сутінки',
    icon: '🌇',
    skyTop: '#1B1433',
    skyMid1: '#3D2045',
    skyMid2: '#6B2840',
    skyHorizon: '#A1482A',
    groundBase: '#140E0A',
    groundTop: '#342014',
    hazeColor: 'rgba(235, 110, 55, 0.3)',
    showSun: true,
    sunX: 0.76,
    sunY: 0.42,
    sunRadius: 26,
    sunCoreColor: '#FF6430',
    sunCoronaColor: 'rgba(255, 85, 35, 0.48)',
    showMoon: false,
    moonOpacity: 0,
    lightTone: 'sunset'
  },
  evening: {
    period: 'evening',
    periodName: 'Вечір',
    icon: '🌆',
    skyTop: '#130C24',
    skyMid1: '#221530',
    skyMid2: '#3A182A',
    skyHorizon: '#54221A',
    groundBase: '#100805',
    groundTop: '#22120A',
    hazeColor: 'rgba(185, 80, 40, 0.22)',
    showSun: false,
    showMoon: true,
    moonOpacity: 0.95,
    lightTone: 'deep-violet'
  },
  night: {
    period: 'night',
    periodName: 'Ніч',
    icon: '🌙',
    skyTop: '#03050E',
    skyMid1: '#050B14',
    skyMid2: '#071114',
    skyHorizon: '#040C08',
    groundBase: '#020302',
    groundTop: '#0B160D',
    hazeColor: 'rgba(18, 42, 28, 0.28)',
    showSun: false,
    showMoon: true,
    moonOpacity: 1.0,
    lightTone: 'nocturnal'
  }
};

export const TIME_PERIODS_ORDER: TimeOfDay[] = [
  'predawn',
  'dawn',
  'morning',
  'day',
  'twilight',
  'evening',
  'night'
];

export const getRealTimeOfDay = (): TimeOfDay => {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour >= 4 && hour < 6) return 'predawn';
  if (hour >= 6 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 11.5) return 'morning';
  if (hour >= 11.5 && hour < 16.5) return 'day';
  if (hour >= 16.5 && hour < 19.5) return 'twilight';
  if (hour >= 19.5 && hour < 22.5) return 'evening';
  return 'night';
};

// Real-world astronomical synodic Moon Phase calculation
export interface MoonPhaseData {
  phase: number;        // 0.0 to 1.0 (exact cycle fraction)
  illumination: number; // 0.0 to 1.0 (exact physical percentage / 100)
  percentage: number;   // 0 to 100
  name: string;
  icon: string;
  description: string;
  ageDays: number;
  significance: string;
}

export const getRealMoonPhase = (date: Date = new Date()): MoonPhaseData => {
  const KNOWN_NEW_MOON = 1704974220000;
  const SYNODIC_PERIOD_MS = 29.53058867 * 86400 * 1000;

  const elapsed = date.getTime() - KNOWN_NEW_MOON;
  const cycleFraction = ((elapsed % SYNODIC_PERIOD_MS) + SYNODIC_PERIOD_MS) % SYNODIC_PERIOD_MS;
  const rawPhase = cycleFraction / SYNODIC_PERIOD_MS;

  const illumination = (1 - Math.cos(2 * Math.PI * rawPhase)) / 2;
  const percentage = Math.round(illumination * 100);
  const ageDays = +(rawPhase * 29.53058867).toFixed(1);

  let name = 'Молодик (Новий місяць)';
  let icon = '🌑';
  let description = 'Місячний диск повернений до Землі темною стороною. Початок нового місячного циклу.';
  let significance = 'Час зародження нових намірів, глибокого спокою та внутрішнього перезавантаження.';

  if (rawPhase < 0.03 || rawPhase >= 0.97) {
    name = 'Молодик (Новий місяць)';
    icon = '🌑';
    description = 'Місяць між Землею та Сонцем. Небо відкриває новий цикл відродження.';
    significance = 'Час закладення твердого наміру, очищення думок та спокійного фокусу.';
  } else if (rawPhase < 0.22) {
    name = 'Зростаючий серп';
    icon = '🌒';
    description = 'Сріблястий серп щовечора стає яскравішим на західному небокраї.';
    significance = 'Час пробудження сил. Кожен чистий день зміцнює паросток вашої волі.';
  } else if (rawPhase < 0.28) {
    name = 'Перша чверть';
    icon = '🌓';
    description = 'Освітлена рівно половина місячного диска. Гармонія світла й тіні.';
    significance = 'Час рішучості, впевненості у виборі та подолання внутрішніх сумнівів.';
  } else if (rawPhase < 0.47) {
    name = 'Зростаючий місяць';
    icon = '🌔';
    description = 'Більша частина диска залита сяйвом і впевнено наближається до кульмінації.';
    significance = 'Енергія розквіту та міцності. Дерево наповнюється життєдайним соком.';
  } else if (rawPhase < 0.53) {
    name = 'Повний місяць (Повня)';
    icon = '🌕';
    description = 'Сяючий срібний диск повністю осяює нічний простір святилища.';
    significance = 'Пік духовної сили, ясне бачення свого шляху свободи та внутрішній спокій.';
  } else if (rawPhase < 0.72) {
    name = 'Спадний місяць';
    icon = '🌖';
    description = 'Світло поступово м’якшає, сонячні промені залишають правий край диска.';
    significance = 'Час вдячності за пройдені дні, спокійного збирання плодів витримки.';
  } else if (rawPhase < 0.78) {
    name = 'Остання чверть';
    icon = '🌗';
    description = 'Освітлена ліва половина диска на передранковому небі.';
    significance = 'Легке відпускання старих токсичних звичок і спокійне оновлення тіла.';
  } else {
    name = 'Спадний серп (Старий місяць)';
    icon = '🌘';
    description = 'Тонкий серп перед світанком, що завершує синодичний місячний шлях.';
    significance = 'Глибоке відновлення сил, медитативна гармонія та підготовка до нового циклу.';
  }

  return { phase: rawPhase, illumination, percentage, name, icon, description, ageDays, significance };
};

// ========================================================
// TRANSCENDENT SANCTUARY AUDIO
// Pure procedural ASMR wind breeze & gentle flame crackle
// ========================================================
class SanctuaryAudio {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private breezeGain: GainNode | null = null;
  private breezeFilter: BiquadFilterNode | null = null;
  private isStarted: boolean = false;
  private isNeuralActive: boolean = false;
  private neuralCrackleGain: GainNode | null = null;
  private neuralSparkTimer: any = null;

  constructor() {
    try {
      const saved = localStorage.getItem('quit-smoking:tree-audio');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }
    } catch {}
  }

  get enabled() {
    return this.isEnabled;
  }

  setEnabled(val: boolean) {
    this.isEnabled = val;
    try {
      localStorage.setItem('quit-smoking:tree-audio', String(val));
    } catch {}
    if (this.breezeGain && this.ctx) {
      this.breezeGain.gain.setTargetAtTime(val ? 0.016 : 0.00001, this.ctx.currentTime, 0.4);
    }
    if (this.neuralCrackleGain && this.ctx) {
      this.neuralCrackleGain.gain.setTargetAtTime(val && this.isNeuralActive ? 0.026 : 0.00001, this.ctx.currentTime, 0.35);
    }
    if (val && !this.isStarted) {
      this.init();
    }
  }

  public init() {
    if (this.ctx && this.isStarted) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 3.0;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.015 * white) / 1.015;
        last = data[i];
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(260, now);
      this.breezeFilter = lowpass;

      this.breezeGain = this.ctx.createGain();
      this.breezeGain.gain.setValueAtTime(this.isEnabled ? 0.016 : 0.00001, now);

      noiseSource.connect(lowpass);
      lowpass.connect(this.breezeGain);
      this.breezeGain.connect(this.ctx.destination);

      noiseSource.start(now);
      this.isStarted = true;
    } catch {}
  }

  public updateWindIntensity(intensity: number) {
    if (!this.ctx || !this.breezeGain || !this.breezeFilter || !this.isEnabled) return;
    const now = this.ctx.currentTime;
    const targetGain = 0.002 + intensity * 0.022;
    const targetCutoff = 180 + intensity * 340;
    this.breezeGain.gain.setTargetAtTime(targetGain, now, 0.4);
    this.breezeFilter.frequency.setTargetAtTime(targetCutoff, now, 0.5);
  }

  setNeuralCrackle(active: boolean) {
    this.isNeuralActive = active;
    if (active) {
      this.init();
      this.startCrackleLoop();
    } else {
      this.stopCrackleLoop();
    }
  }

  private startCrackleLoop() {
    if (!this.ctx) return;
    if (this.neuralCrackleGain) {
      this.neuralCrackleGain.gain.setTargetAtTime(this.isEnabled ? 0.05 : 0.00001, this.ctx.currentTime, 0.2);
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.00001, now);
      masterGain.gain.exponentialRampToValueAtTime(this.isEnabled ? 0.05 : 0.00001, now + 0.2);
      masterGain.connect(this.ctx.destination);
      this.neuralCrackleGain = masterGain;

      const scheduleCrackle = () => {
        if (!this.isNeuralActive || !this.ctx || !this.neuralCrackleGain) return;

        const burstCount = Math.random() > 0.6 ? (Math.random() > 0.85 ? 3 : 2) : 1;
        for (let c = 0; c < burstCount; c++) {
          const sparkOffset = c * (0.007 + Math.random() * 0.018);
          const sparkTime = this.ctx.currentTime + sparkOffset;

          const sparkLen = Math.floor(this.ctx.sampleRate * (0.0012 + Math.random() * 0.0026));
          const sBuf = this.ctx.createBuffer(1, sparkLen, this.ctx.sampleRate);
          const sData = sBuf.getChannelData(0);
          for (let j = 0; j < sparkLen; j++) {
            const decay = Math.exp(-j / (sparkLen * 0.2));
            sData[j] = (Math.random() * 2 - 1) * decay;
          }

          const sSource = this.ctx.createBufferSource();
          sSource.buffer = sBuf;

          const sFilter = this.ctx.createBiquadFilter();
          sFilter.type = 'bandpass';
          sFilter.frequency.setValueAtTime(1200 + Math.random() * 2400, sparkTime);
          sFilter.Q.setValueAtTime(2.4 + Math.random() * 1.6, sparkTime);

          const sGain = this.ctx.createGain();
          const vol = (0.015 + Math.random() * 0.035) * (Math.random() > 0.88 ? 1.6 : 0.85);
          sGain.gain.setValueAtTime(vol, sparkTime);
          sGain.gain.exponentialRampToValueAtTime(0.00001, sparkTime + 0.014);

          sSource.connect(sFilter);
          sFilter.connect(sGain);
          sGain.connect(this.neuralCrackleGain);

          sSource.start(sparkTime);
          sSource.stop(sparkTime + 0.018);
        }

        const nextDelay = 28 + Math.random() * 75;
        this.neuralSparkTimer = setTimeout(scheduleCrackle, nextDelay);
      };

      scheduleCrackle();
    } catch {}
  }

  private stopCrackleLoop() {
    if (this.neuralSparkTimer) {
      clearTimeout(this.neuralSparkTimer);
      this.neuralSparkTimer = null;
    }

    if (this.neuralCrackleGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.neuralCrackleGain.gain.setTargetAtTime(0.00001, now, 0.18);
      const gainToClean = this.neuralCrackleGain;
      this.neuralCrackleGain = null;

      setTimeout(() => {
        try {
          gainToClean.disconnect();
        } catch {}
      }, 300);
    }
  }

  playDropNote() {
    if (!this.ctx || !this.isEnabled) {
      if (this.isEnabled && !this.isStarted) this.init();
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';

      const notes = [329.63, 369.99, 440.0, 493.88, 587.33];
      const freq = notes[Math.floor(Math.random() * notes.length)];

      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.25);

      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    } catch {}
  }
}

const audio = new SanctuaryAudio();

// ========================================================
// PROCEDURAL BOTANICAL & SILVER-NEURAL GOSSAMER INTERFACES
// ========================================================
interface BranchNode {
  id: string;
  length: number;
  angle: number;
  depth: number;
  thickness: number;
  swayOffset: number;
  curvature?: number;
  children: BranchNode[];
  leafCount: number;
}

interface RootNode {
  id: string;
  length: number;
  angle: number;
  depth: number;
  thickness: number;
  children: RootNode[];
}

interface AtmosphericMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

interface GrassBlade {
  xPercent: number;
  height: number;
  baseAngle: number;
  swayPhase: number;
  colorVariation: number;
  width: number;
}

interface FilamentSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  ctrlX?: number;
  ctrlY?: number;
  isCurved?: boolean;
  domain: 'canopy' | 'root' | 'web';
  depth: number;
}

interface LightBundle {
  id: number;
  domain: 'canopy' | 'root' | 'web';
  segIndex: number;
  progress: number;
  speed: number;
  direction: 1 | -1;
  radius: number;
  alpha: number;
  subPhotons: { angle: number; dist: number; speed: number; size: number }[];
}

export const TreeTab: React.FC<TreeTabProps> = ({
  treeState,
  cigsAvoided = 0,
  onUpdateTreeState,
  onSwitchTab
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(audio.enabled);
  const [isForestOpen, setIsForestOpen] = useState<boolean>(false);
  const [isMoonModalOpen, setIsMoonModalOpen] = useState<boolean>(false);
  const [isTimeSelectorOpen, setIsTimeSelectorOpen] = useState<boolean>(false);

  // Time of Day state: Real-time automatic vs manual override
  const [manualTimePeriod, setManualTimePeriod] = useState<TimeOfDay | null>(null);
  const [realTimePeriod, setRealTimePeriod] = useState<TimeOfDay>(getRealTimeOfDay());
  const [moonData, setMoonData] = useState<MoonPhaseData>(getRealMoonPhase());

  const activePeriod = manualTimePeriod || realTimePeriod;
  const currentAtmosphere = ATMOSPHERES[activePeriod] || ATMOSPHERES.night;

  const activePeriodRef = useRef<TimeOfDay>(activePeriod);
  activePeriodRef.current = activePeriod;
  const currentAtmosphereRef = useRef<AtmosphereSettings>(currentAtmosphere);
  currentAtmosphereRef.current = currentAtmosphere;
  const moonDataRef = useRef<MoonPhaseData>(moonData);
  moonDataRef.current = moonData;

  useEffect(() => {
    const timer = setInterval(() => {
      const p = getRealTimeOfDay();
      const m = getRealMoonPhase();
      setRealTimePeriod(p);
      setMoonData(m);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Silver Neural Tree mode
  const [isNeuralMode, setIsNeuralMode] = useState<boolean>(false);
  const isNeuralModeRef = useRef<boolean>(false);
  isNeuralModeRef.current = isNeuralMode;

  const neuralProgressRef = useRef<number>(0);
  const [hasClickedSeed, setHasClickedSeed] = useState<boolean>(false);
  const hasClickedSeedRef = useRef<boolean>(false);
  hasClickedSeedRef.current = hasClickedSeed;

  useEffect(() => {
    audio.setNeuralCrackle(isNeuralMode && soundEnabled);
    return () => {
      audio.setNeuralCrackle(false);
    };
  }, [isNeuralMode, soundEnabled]);

  // Adult Tree Preview mode
  const [previewAdult, setPreviewAdult] = useState<boolean>(false);
  const previewAdultRef = useRef<boolean>(false);
  previewAdultRef.current = previewAdult;

  const previewProgressRef = useRef<number>(0);
  const lastSpeciesRef = useRef<TreeSpeciesId | null>(null);

  // Tree state
  const currentTree = treeState?.current || null;
  const currentTreeRef = useRef<CurrentTree | null>(currentTree);
  currentTreeRef.current = currentTree;

  const forest = useMemo(() => treeState?.forest || [], [treeState?.forest]);

  const totalTreesPlanted = forest.length + (currentTree ? 1 : 0);
  const earnedSeedsTotal = Math.max(1, 1 + Math.floor(cigsAvoided / CIGS_PER_SEED));
  const availableSeeds = Math.max(0, earnedSeedsTotal - totalTreesPlanted);

  const activeSpeciesId = currentTree?.speciesId || 'oak';
  const activeSpeciesIdRef = useRef<TreeSpeciesId>(activeSpeciesId);
  activeSpeciesIdRef.current = activeSpeciesId;

  const activeSpecies = TREE_SPECIES[activeSpeciesId] || TREE_SPECIES.oak;
  const activeSpeciesRef = useRef(activeSpecies);
  activeSpeciesRef.current = activeSpecies;

  // 20-DAY REALISTIC GROWTH CALCULATION
  const { growthProgress, isMature } = useMemo(() => {
    if (!currentTree) {
      return { growthProgress: 0, isMature: false };
    }
    const now = Date.now();
    const elapsedMs = Math.max(0, now - (currentTree.plantedAt || now));
    const rawProgress = Math.min(1.0, elapsedMs / MATURATION_MS);
    return {
      growthProgress: rawProgress,
      isMature: rawProgress >= 1.0
    };
  }, [currentTree]);

  const growthProgressRef = useRef<number>(growthProgress);
  growthProgressRef.current = growthProgress;

  const branchSkeletonRef = useRef<BranchNode | null>(null);
  const rootSkeletonsRef = useRef<RootNode[]>([]);
  const motesRef = useRef<AtmosphericMote[]>([]);
  const grassBladesRef = useRef<GrassBlade[]>([]);
  const lightBundlesRef = useRef<LightBundle[]>([]);

  // Toggle Sound
  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.setEnabled(next);
  }, [soundEnabled]);

  // Set Time of Day
  const handleSelectTimePeriod = useCallback((period: TimeOfDay | 'auto') => {
    audio.init();
    audio.playDropNote();
    if (period === 'auto') {
      setManualTimePeriod(null);
    } else {
      setManualTimePeriod(period);
    }
    setIsTimeSelectorOpen(false);
  }, []);

  // Plant a chosen seed
  const handlePlantChosenSeed = useCallback((speciesId: TreeSpeciesId) => {
    const newTree: CurrentTree = {
      speciesId,
      plantedAt: Date.now(),
      growth: 0,
      water: 100,
      sun: 100,
      food: 100,
      lastTick: Date.now(),
      nextWeedAt: Date.now() + 86400000,
      weeds: []
    };

    onUpdateTreeState?.({
      forest: treeState?.forest || [],
      current: newTree
    });

    branchSkeletonRef.current = null;
    rootSkeletonsRef.current = [];
    setIsNeuralMode(false);
    isNeuralModeRef.current = false;
    setPreviewAdult(false);
    previewAdultRef.current = false;
    previewProgressRef.current = 0;
    neuralProgressRef.current = 0;
    setHasClickedSeed(false);
    hasClickedSeedRef.current = false;
    audio.playDropNote();
  }, [onUpdateTreeState, treeState?.forest]);

  // Transition mature tree into the Cozy Forest
  const handleTransitionToForest = useCallback(() => {
    if (!currentTree) return;

    const newForestTree: ForestTree = {
      id: `tree_${Date.now()}`,
      speciesId: currentTree.speciesId,
      plantedAt: currentTree.plantedAt,
      grownAt: Date.now(),
      nickname: activeSpecies.name,
      oxygenProducedKg: 48
    };

    const updatedForest = [...(treeState?.forest || []), newForestTree];

    onUpdateTreeState?.({
      forest: updatedForest,
      current: null
    });

    audio.playDropNote();
    setIsForestOpen(true);
  }, [currentTree, activeSpecies.name, onUpdateTreeState, treeState?.forest]);

  // Build tree structure skeleton
  const buildSkeleton = (species: TreeSpeciesId) => {
    const makeRootBranch = (depth: number, length: number, angle: number, idPrefix: string): RootNode => {
      const node: RootNode = {
        id: idPrefix,
        length,
        angle,
        depth,
        thickness: Math.max(0.45, 1.8 - depth * 0.45),
        children: []
      };

      if (depth < 3) {
        const count = 2;
        for (let i = 0; i < count; i++) {
          const spread = (i === 0 ? -1 : 1) * (0.35 + Math.random() * 0.2);
          const lenScale = 0.65 + Math.random() * 0.12;
          node.children.push(
            makeRootBranch(depth + 1, length * lenScale, angle + spread, `${idPrefix}_${i}`)
          );
        }
      }
      return node;
    };

    const roots: RootNode[] = [
      makeRootBranch(0, 38, Math.PI / 2 + 0.08, 'root_tap1'),
      makeRootBranch(0, 34, Math.PI / 2 - 0.12, 'root_tap2'),
      makeRootBranch(0, 32, Math.PI / 2 - 0.55, 'root_left'),
      makeRootBranch(0, 32, Math.PI / 2 + 0.55, 'root_right'),
      makeRootBranch(0, 26, Math.PI / 2 - 0.95, 'root_far_l'),
      makeRootBranch(0, 26, Math.PI / 2 + 0.95, 'root_far_r')
    ];
    rootSkeletonsRef.current = roots;

    if (species === 'oak') {
      const makeOakBranch = (depth: number, length: number, angle: number, thick: number, idPrefix: string): BranchNode => {
        const node: BranchNode = {
          id: idPrefix,
          length,
          angle,
          depth,
          thickness: thick,
          swayOffset: Math.random() * Math.PI * 2,
          curvature: (Math.random() - 0.5) * 0.16,
          children: [],
          leafCount: depth >= 2 ? 6 : 0
        };
        if (depth < 5) {
          const count = depth === 0 ? 3 : 2;
          const spreads = depth === 0 ? [-0.64, 0.04, 0.60] : [-0.54, 0.50];
          for (let i = 0; i < count; i++) {
            const a = spreads[i] * (0.86 + Math.random() * 0.28);
            const lenScale = depth === 0 ? 0.82 : 0.72;
            node.children.push(
              makeOakBranch(depth + 1, length * lenScale, a, thick * 0.64, `${idPrefix}_${i}`)
            );
          }
        }
        return node;
      };
      branchSkeletonRef.current = makeOakBranch(0, 78, -Math.PI / 2, 13, 'oak_trunk');

    } else if (species === 'sakura') {
      const makeSakuraBranch = (depth: number, length: number, angle: number, thick: number, idPrefix: string): BranchNode => {
        const isLeft = idPrefix.includes('_0');
        const node: BranchNode = {
          id: idPrefix,
          length,
          angle,
          depth,
          thickness: thick,
          swayOffset: Math.random() * Math.PI * 2,
          curvature: isLeft ? -0.16 : 0.16,
          children: [],
          leafCount: depth >= 1 ? 5 : 0
        };
        if (depth < 5) {
          const count = 2;
          const spreads = [-0.60, 0.54];
          for (let i = 0; i < count; i++) {
            const a = spreads[i] * (0.88 + Math.random() * 0.24);
            node.children.push(
              makeSakuraBranch(depth + 1, length * 0.78, a, thick * 0.62, `${idPrefix}_${i}`)
            );
          }
        }
        return node;
      };
      branchSkeletonRef.current = makeSakuraBranch(0, 88, -Math.PI / 2 + 0.06, 9.5, 'sakura_trunk');

    } else if (species === 'pine') {
      const makePineSkeleton = (): BranchNode => {
        const trunk: BranchNode = {
          id: 'pine_trunk',
          length: 126,
          angle: -Math.PI / 2,
          depth: 0,
          thickness: 11,
          swayOffset: 0,
          children: [],
          leafCount: 0
        };

        const tiers = [
          { tierLen: 64, spread: 1.38 },
          { tierLen: 52, spread: 1.36 },
          { tierLen: 40, spread: 1.34 },
          { tierLen: 26, spread: 1.30 }
        ];

        tiers.forEach((tier, tIdx) => {
          const makeTierBranch = (len: number, angle: number, depth: number, id: string): BranchNode => {
            const b: BranchNode = {
              id,
              length: len,
              angle,
              depth,
              thickness: Math.max(0.9, 5.2 - depth * 1.3),
              swayOffset: Math.random() * Math.PI * 2,
              curvature: 0.09,
              children: [],
              leafCount: 6
            };
            if (depth < 2) {
              b.children.push(
                makeTierBranch(len * 0.64, -0.28, depth + 1, `${id}_subL`),
                makeTierBranch(len * 0.64, 0.28, depth + 1, `${id}_subR`)
              );
            }
            return b;
          };

          const leftBranch = makeTierBranch(tier.tierLen, -tier.spread, 1, `tier_${tIdx}_left`);
          const rightBranch = makeTierBranch(tier.tierLen, tier.spread, 1, `tier_${tIdx}_right`);
          trunk.children.push(leftBranch, rightBranch);
        });

        trunk.children.push({
          id: 'pine_apex',
          length: 28,
          angle: 0,
          depth: 1,
          thickness: 4.5,
          swayOffset: 0,
          children: [],
          leafCount: 8
        });

        return trunk;
      };
      branchSkeletonRef.current = makePineSkeleton();

    } else if (species === 'apple') {
      const makeAppleBranch = (depth: number, length: number, angle: number, thick: number, idPrefix: string): BranchNode => {
        const node: BranchNode = {
          id: idPrefix,
          length,
          angle,
          depth,
          thickness: thick,
          swayOffset: Math.random() * Math.PI * 2,
          children: [],
          leafCount: depth >= 1 ? 5 : 0
        };
        if (depth < 5) {
          const count = depth === 0 ? 3 : 2;
          const spreads = depth === 0 ? [-0.68, 0.02, 0.65] : [-0.48, 0.46];
          for (let i = 0; i < count; i++) {
            const a = spreads[i] * (0.86 + Math.random() * 0.26);
            node.children.push(
              makeAppleBranch(depth + 1, length * 0.74, a, thick * 0.62, `${idPrefix}_${i}`)
            );
          }
        }
        return node;
      };
      branchSkeletonRef.current = makeAppleBranch(0, 64, -Math.PI / 2, 10.5, 'apple_trunk');

    } else {
      const makeMapleBranch = (depth: number, length: number, angle: number, thick: number, idPrefix: string): BranchNode => {
        const node: BranchNode = {
          id: idPrefix,
          length,
          angle,
          depth,
          thickness: thick,
          swayOffset: Math.random() * Math.PI * 2,
          children: [],
          leafCount: depth >= 1 ? 5 : 0
        };
        if (depth < 5) {
          const count = depth === 0 ? 3 : 2;
          const spreads = depth === 0 ? [-0.42, 0.0, 0.42] : [-0.54, 0.52];
          for (let i = 0; i < count; i++) {
            const a = spreads[i] * (0.88 + Math.random() * 0.24);
            node.children.push(
              makeMapleBranch(depth + 1, length * 0.75, a, thick * 0.63, `${idPrefix}_${i}`)
            );
          }
        }
        return node;
      };
      branchSkeletonRef.current = makeMapleBranch(0, 84, -Math.PI / 2, 10.5, 'maple_trunk');
    }

    const bundles: LightBundle[] = [];
    for (let i = 0; i < 32; i++) {
      bundles.push({
        id: i,
        domain: i % 3 === 0 ? 'root' : i % 3 === 1 ? 'web' : 'canopy',
        segIndex: i,
        progress: Math.random(),
        speed: 0.18 + Math.random() * 0.32,
        direction: Math.random() > 0.3 ? 1 : -1,
        radius: 2.8 + Math.random() * 1.8,
        alpha: 0.7 + Math.random() * 0.3,
        subPhotons: [
          { angle: 0, dist: 1.5, speed: 3.5, size: 1.2 },
          { angle: 2.1, dist: 2.8, speed: -4.2, size: 1.0 },
          { angle: 4.2, dist: 2.2, speed: 5.0, size: 0.9 },
          { angle: 1.2, dist: 3.4, speed: -2.8, size: 0.8 }
        ]
      });
    }
    lightBundlesRef.current = bundles;
  };

  // PERSISTENT CONTINUOUS CANVAS SIMULATION & RENDERING LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const groundY = height * 0.68;
    const treeX = width * 0.5;

    if (!branchSkeletonRef.current || rootSkeletonsRef.current.length === 0 || lastSpeciesRef.current !== activeSpeciesIdRef.current) {
      lastSpeciesRef.current = activeSpeciesIdRef.current;
      buildSkeleton(activeSpeciesIdRef.current);
    }

    if (grassBladesRef.current.length === 0) {
      const blades: GrassBlade[] = [];
      const count = 75;
      for (let i = 0; i < count; i++) {
        blades.push({
          xPercent: (i + Math.random() * 0.6) / count,
          height: 6 + Math.random() * 11,
          baseAngle: (Math.random() - 0.5) * 0.25,
          swayPhase: Math.random() * Math.PI * 2,
          colorVariation: Math.random(),
          width: 1.2 + Math.random() * 1.2
        });
      }
      grassBladesRef.current = blades;
    }

    if (motesRef.current.length === 0) {
      const motes: AtmosphericMote[] = [];
      for (let i = 0; i < 32; i++) {
        motes.push({
          x: Math.random() * width,
          y: height * 0.15 + Math.random() * (groundY * 0.8),
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 3,
          size: 1.2 + Math.random() * 1.6,
          alpha: 0.2 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2
        });
      }
      motesRef.current = motes;
    }

    // Pointer events: Click on seed OR Click on Moon
    const handlePointerDown = (e: PointerEvent) => {
      audio.init();
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 1. Check Moon click (top-right at 82% width, 16% height) - only when moon is in the sky
      if (currentAtmosphereRef.current.showMoon) {
        const moonX = width * 0.82;
        const moonY = height * 0.16;
        const distToMoon = Math.hypot(clickX - moonX, clickY - moonY);
        if (distToMoon < 52) {
          audio.playDropNote();
          setIsMoonModalOpen((prev) => !prev);
          return;
        }
      }

      // 1b. Check Sun click (if sun is currently in the sky)
      const curAtm = currentAtmosphereRef.current;
      if (curAtm.showSun && curAtm.sunX !== undefined && curAtm.sunY !== undefined) {
        const sunX = width * curAtm.sunX;
        const sunY = height * curAtm.sunY;
        const distToSun = Math.hypot(clickX - sunX, clickY - sunY);
        if (distToSun < (curAtm.sunRadius || 28) * 1.5) {
          audio.playDropNote();
          return;
        }
      }

      // 2. Check Seed click strictly at (treeX, groundY)
      const distToSeed = Math.hypot(clickX - treeX, clickY - groundY);
      if (distToSeed < 65) {
        setHasClickedSeed(true);
        hasClickedSeedRef.current = true;
        setIsNeuralMode((prev) => {
          isNeuralModeRef.current = !prev;
          return !prev;
        });
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);

    let animId: number;
    let lastTime = performance.now();
    let windSmoothed = 0.01;

    // Continuous 60fps render loop
    const render = (timeMs: number) => {
      const dt = Math.min(0.04, (timeMs - lastTime) / 1000);
      lastTime = timeMs;
      const t = timeMs * 0.001;

      if (lastSpeciesRef.current !== activeSpeciesIdRef.current) {
        lastSpeciesRef.current = activeSpeciesIdRef.current;
        buildSkeleton(activeSpeciesIdRef.current);
      }

      // 1. DYNAMIC WIND PHYSICS
      const slowMacro1 = Math.sin(t * 0.14);
      const slowMacro2 = Math.sin(t * 0.067 + 1.2);
      const windGate = Math.max(0, (slowMacro1 * 0.6 + slowMacro2 * 0.6 - 0.05));
      const rawBreeze = (0.012 + 0.018 * windGate) * windGate;
      const microTurbulence = (Math.sin(t * 1.8) * 0.003 + Math.sin(t * 3.7 + 0.5) * 0.0015) * windGate;
      const rawTargetWind = Math.max(0, rawBreeze + microTurbulence);

      windSmoothed += (rawTargetWind - windSmoothed) * Math.min(1.0, dt * 1.6);
      const windAudioIntensity = Math.max(0, Math.min(1.0, windSmoothed / 0.026));
      audio.updateWindIntensity(windAudioIntensity);

      // Smooth organic growth easing for Silver Neural Tree (0 to 1)
      const targetNeuralProgress = isNeuralModeRef.current ? 1.0 : 0.0;
      neuralProgressRef.current += (targetNeuralProgress - neuralProgressRef.current) * (dt * 2.5);
      const neuralAmount = neuralProgressRef.current;

      // Smooth organic transition for Adult Tree Preview (0 to 1)
      const targetPreview = previewAdultRef.current ? 1.0 : 0.0;
      previewProgressRef.current += (targetPreview - previewProgressRef.current) * (dt * 2.8);
      const previewAmount = previewProgressRef.current;

      const physicalGrowth = Math.max(growthProgressRef.current, previewAmount);

      const curAtmosphere = currentAtmosphereRef.current;
      const curRealPeriod = activePeriodRef.current;
      const curMoon = moonDataRef.current;
      const curSpecies = activeSpeciesRef.current;

      // ========================================================
      // 2. ASTRONOMICAL SKY & ATMOSPHERE FOR THE 7 PERIODS
      // ========================================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, curAtmosphere.skyTop);
      skyGrad.addColorStop(0.38, curAtmosphere.skyMid1);
      skyGrad.addColorStop(0.64, curAtmosphere.skyMid2);
      skyGrad.addColorStop(0.68, curAtmosphere.skyHorizon);
      skyGrad.addColorStop(1, curAtmosphere.groundBase);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Night / Twilight / Dawn Stars
      if (curRealPeriod === 'night' || curRealPeriod === 'predawn' || curRealPeriod === 'evening' || curRealPeriod === 'dawn' || curRealPeriod === 'twilight') {
        ctx.save();
        const starCount = curRealPeriod === 'night' ? 45 : (curRealPeriod === 'predawn' ? 35 : (curRealPeriod === 'evening' ? 22 : 12));
        for (let i = 0; i < starCount; i++) {
          const sx = (treeX * 0.35 + i * 47) % width;
          const sy = (height * 0.03 + (i * 29) % (groundY * 0.62));
          const starPulse = 0.3 + 0.7 * Math.sin(t * 1.6 + i * 1.7);
          const starSize = (i % 5 === 0) ? 1.2 : 0.8;
          ctx.fillStyle = `rgba(230, 242, 255, ${starPulse * (curRealPeriod === 'night' ? 0.65 : 0.35)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ========================================================
      // 3. RADIANT SUN (DAYTIME PERIODS: DAWN, MORNING, DAY, TWILIGHT)
      // ========================================================
      if (curAtmosphere.showSun && curAtmosphere.sunX !== undefined && curAtmosphere.sunY !== undefined) {
        ctx.save();
        const sx = width * curAtmosphere.sunX;
        const sy = height * curAtmosphere.sunY;
        const sr = curAtmosphere.sunRadius || 28;

        ctx.translate(sx, sy);

        // 3a. Massive Atmospheric Solar Corona & Chromatic Flare
        const sunCorona = ctx.createRadialGradient(0, 0, sr * 0.5, 0, 0, sr * 4.5);
        sunCorona.addColorStop(0, curAtmosphere.sunCoronaColor || 'rgba(255, 240, 180, 0.6)');
        sunCorona.addColorStop(0.3, 'rgba(255, 210, 120, 0.25)');
        sunCorona.addColorStop(0.65, 'rgba(255, 180, 80, 0.08)');
        sunCorona.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = sunCorona;
        ctx.beginPath();
        ctx.arc(0, 0, sr * 4.5, 0, Math.PI * 2);
        ctx.fill();

        // 3b. Rotating Golden Sunlight Rays / Diffraction Beams
        ctx.save();
        ctx.rotate(t * 0.08);
        ctx.strokeStyle = curAtmosphere.sunCoronaColor || 'rgba(255, 230, 160, 0.35)';
        ctx.lineWidth = 1.2;
        for (let r = 0; r < 12; r++) {
          const rAngle = (r * Math.PI * 2) / 12;
          const rayLen = sr * (1.8 + 0.35 * Math.sin(t * 2.0 + r));
          ctx.beginPath();
          ctx.moveTo(Math.cos(rAngle) * (sr * 0.8), Math.sin(rAngle) * (sr * 0.8));
          ctx.lineTo(Math.cos(rAngle) * rayLen, Math.sin(rAngle) * rayLen);
          ctx.stroke();
        }
        ctx.restore();

        // 3c. Blinding Diamond Core
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sr);
        coreGrad.addColorStop(0, '#FFFFFF');
        coreGrad.addColorStop(0.4, curAtmosphere.sunCoreColor || '#FFF4CC');
        coreGrad.addColorStop(0.85, curAtmosphere.sunCoreColor || '#FFAE42');
        coreGrad.addColorStop(1, 'rgba(255, 180, 50, 0.7)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, sr, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // ========================================================
      // 4. RADIANT LUMINOUS MOON (ALWAYS GLOWING & VIBRANT)
      // ========================================================
      if (curAtmosphere.showMoon) {
        ctx.save();
        const mx = width * 0.82;
        const my = height * 0.16 + Math.sin(t * 0.08) * 1.2;
        const mr = 28;

        ctx.globalAlpha = curAtmosphere.moonOpacity;
        ctx.translate(mx, my);

        // 4a. Radiant Atmospheric Corona ("Живе світіння")
        const glowPulse = 0.95 + 0.05 * Math.sin(t * 1.2);
        const glowIntensity = 0.16 + curMoon.illumination * 0.34;
        const outerHalo = ctx.createRadialGradient(0, 0, mr * 0.5, 0, 0, mr * 3.4 * glowPulse);
        outerHalo.addColorStop(0, `rgba(241, 245, 249, ${glowIntensity * 0.95})`);
        outerHalo.addColorStop(0.35, `rgba(186, 230, 253, ${glowIntensity * 0.45})`);
        outerHalo.addColorStop(0.7, `rgba(147, 197, 253, ${glowIntensity * 0.12})`);
        outerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = outerHalo;
        ctx.beginPath();
        ctx.arc(0, 0, mr * 3.4 * glowPulse, 0, Math.PI * 2);
        ctx.fill();

        // 4b. Base Disc (Soft silver-pearl night glow, never pitch black!)
        const baseMoonGrad = ctx.createRadialGradient(-mr * 0.2, -mr * 0.2, 0, 0, 0, mr);
        baseMoonGrad.addColorStop(0, 'rgba(226, 232, 240, 0.42)');
        baseMoonGrad.addColorStop(0.65, 'rgba(148, 163, 184, 0.32)');
        baseMoonGrad.addColorStop(1, 'rgba(71, 85, 105, 0.25)');
        ctx.fillStyle = baseMoonGrad;
        ctx.beginPath();
        ctx.arc(0, 0, mr, 0, Math.PI * 2);
        ctx.fill();

        // 4c. Maria Texture on base disc
        ctx.fillStyle = 'rgba(71, 85, 105, 0.22)';
        ctx.beginPath();
        ctx.arc(-mr * 0.35, -mr * 0.22, mr * 0.28, 0, Math.PI * 2);
        ctx.arc(mr * 0.15, mr * 0.32, mr * 0.34, 0, Math.PI * 2);
        ctx.arc(mr * 0.25, -mr * 0.28, mr * 0.22, 0, Math.PI * 2);
        ctx.arc(-mr * 0.1, mr * 0.1, mr * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // 4d. REAL ASTRONOMICAL ILLUMINATED SURFACE (Luminous white-silver pearl)
        const phase = curMoon.phase;
        ctx.save();
        ctx.beginPath();

        // If near full moon or any phase, render accurate geometry
        if (phase < 0.02 || phase > 0.98) {
          // New Moon (Молодик): Delicate ethereal ashen glow
          ctx.arc(0, 0, mr, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          const ashenGrad = ctx.createRadialGradient(-mr * 0.2, -mr * 0.2, 0, 0, 0, mr);
          ashenGrad.addColorStop(0, 'rgba(241, 245, 249, 0.22)');
          ashenGrad.addColorStop(1, 'rgba(148, 163, 184, 0.12)');
          ctx.fillStyle = ashenGrad;
          ctx.fill();
        } else {
          // Crescent, Quarters, Gibbous, Full Moon
          const isWaxing = phase < 0.5;
          const k = Math.cos(2 * Math.PI * phase);
          const rx = Math.max(0.1, Math.abs(k) * mr);

          if (isWaxing) {
            ctx.arc(0, 0, mr, -Math.PI / 2, Math.PI / 2, false);
            ctx.ellipse(0, 0, rx, mr, 0, Math.PI / 2, -Math.PI / 2, k < 0);
          } else {
            ctx.arc(0, 0, mr, Math.PI / 2, -Math.PI / 2, false);
            ctx.ellipse(0, 0, rx, mr, 0, -Math.PI / 2, Math.PI / 2, k < 0);
          }
          ctx.closePath();
          ctx.clip();

          // Luminous Diamond-Pearl Lit Body
          const litGrad = ctx.createRadialGradient(-mr * 0.25, -mr * 0.25, 0, 0, 0, mr * 1.15);
          litGrad.addColorStop(0, '#FFFFFF');
          litGrad.addColorStop(0.35, '#F8FAFC');
          litGrad.addColorStop(0.75, '#E2E8F0');
          litGrad.addColorStop(1, '#CBD5E1');
          ctx.fillStyle = litGrad;
          ctx.fill();

          // Lunar Maria (Seas) inside lit surface
          ctx.fillStyle = 'rgba(71, 85, 105, 0.28)';
          ctx.beginPath();
          ctx.ellipse(-mr * 0.38, -mr * 0.1, mr * 0.32, mr * 0.44, -0.2, 0, Math.PI * 2);
          ctx.arc(-mr * 0.18, -mr * 0.38, mr * 0.24, 0, Math.PI * 2);
          ctx.arc(mr * 0.22, -mr * 0.2, mr * 0.21, 0, Math.PI * 2);
          ctx.arc(mr * 0.26, mr * 0.08, mr * 0.23, 0, Math.PI * 2);
          ctx.ellipse(mr * 0.55, -mr * 0.18, mr * 0.14, mr * 0.18, 0.3, 0, Math.PI * 2);
          ctx.arc(mr * 0.32, mr * 0.34, mr * 0.22, 0, Math.PI * 2);
          ctx.arc(mr * 0.08, mr * 0.42, mr * 0.18, 0, Math.PI * 2);
          ctx.fill();

          // Tycho Crater Rays (Radiating silver beams)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
          ctx.lineWidth = 0.8;
          const tychoX = mr * 0.05;
          const tychoY = mr * 0.58;
          ctx.beginPath();
          for (let r = 0; r < 8; r++) {
            const rayAngle = -Math.PI * 0.5 + (r - 3.5) * 0.28;
            ctx.moveTo(tychoX, tychoY);
            ctx.lineTo(tychoX + Math.cos(rayAngle) * mr * 0.9, tychoY + Math.sin(rayAngle) * mr * 0.9);
          }
          ctx.stroke();

          // Bright crater centers
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(tychoX, tychoY, 1.8, 0, Math.PI * 2);
          ctx.arc(-mr * 0.2, -mr * 0.08, 1.5, 0, Math.PI * 2);
          ctx.arc(-mr * 0.42, -mr * 0.05, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Luminous glowing rim border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, mr, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // Soft ambient haze
      const haze = ctx.createRadialGradient(treeX, groundY - 30, 20, treeX, groundY - 30, width * 0.55);
      haze.addColorStop(0, curAtmosphere.hazeColor);
      haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, width, height);

      // ========================================================
      // 5. ROLLING GROUND & HILLS DYNAMICALLY TINTED
      // ========================================================
      const ridgeY = groundY + 14;
      ctx.fillStyle = curRealPeriod === 'night' ? '#040906' : (curRealPeriod === 'predawn' ? '#0A140F' : (curRealPeriod === 'day' || curRealPeriod === 'morning' ? '#172C1C' : (curRealPeriod === 'dawn' ? '#1C2414' : '#141E15')));
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, ridgeY + 12);
      ctx.bezierCurveTo(width * 0.35, ridgeY - 8, width * 0.75, ridgeY + 22, width, ridgeY);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      const midHillY = groundY + 6;
      ctx.fillStyle = curRealPeriod === 'night' ? '#061009' : (curRealPeriod === 'predawn' ? '#0D1C14' : (curRealPeriod === 'day' || curRealPeriod === 'morning' ? '#1D3B23' : (curRealPeriod === 'dawn' ? '#26341B' : '#1A281B')));
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, midHillY + 6);
      ctx.bezierCurveTo(width * 0.25, midHillY + 14, width * 0.65, midHillY - 12, width, midHillY + 8);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      const moundGrad = ctx.createLinearGradient(0, groundY - 15, 0, height);
      moundGrad.addColorStop(0, curAtmosphere.groundTop);
      moundGrad.addColorStop(0.12, curAtmosphere.groundBase);
      moundGrad.addColorStop(0.45, '#0a1209');
      moundGrad.addColorStop(1, '#020402');
      ctx.fillStyle = moundGrad;

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, groundY + 8);
      ctx.bezierCurveTo(
        width * 0.25, groundY + 3,
        treeX - width * 0.15, groundY - 2,
        treeX, groundY
      );
      ctx.bezierCurveTo(
        treeX + width * 0.15, groundY - 2,
        width * 0.75, groundY + 5,
        width, groundY + 10
      );
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Subterranean mineral flecks
      ctx.save();
      for (let m = 0; m < 18; m++) {
        const sx = (treeX * 0.4 + m * 73) % width;
        const sy = groundY + 25 + (m * 19) % (height - groundY - 40);
        ctx.fillStyle = neuralAmount > 0.3 ? 'rgba(186, 230, 253, 0.15)' : 'rgba(180, 160, 120, 0.08)';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Living Grass Blades
      const blades = grassBladesRef.current;
      ctx.save();
      blades.forEach((b) => {
        const gx = b.xPercent * width;
        const dx = (gx - treeX) / (width * 0.5);
        const gy = groundY + (dx * dx) * 7;

        const bladeSway = windSmoothed * 14 + Math.sin(t * 2.4 + b.swayPhase) * (0.05 + windSmoothed * 4);
        const bladeAngle = b.baseAngle + bladeSway;

        const tipX = gx + Math.sin(bladeAngle) * b.height;
        const tipY = gy - Math.cos(bladeAngle) * b.height;

        ctx.strokeStyle = curRealPeriod === 'night' || curRealPeriod === 'predawn'
          ? (b.colorVariation > 0.5 ? '#1B3824' : '#142B1B')
          : (curRealPeriod === 'day' || curRealPeriod === 'morning' ? (b.colorVariation > 0.5 ? '#3C7043' : '#2F5935') : (curRealPeriod === 'dawn' ? '#446633' : '#31442B'));
        ctx.lineWidth = b.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(gx, gy + 1);
        ctx.quadraticCurveTo((gx + tipX) * 0.5 + bladeSway * 3, (gy + tipY) * 0.5, tipX, tipY);
        ctx.stroke();
      });
      ctx.restore();

      // Moss Cushion & Ground Mist
      ctx.save();
      const mossGrad = ctx.createRadialGradient(treeX, groundY + 4, 2, treeX, groundY + 4, 38);
      mossGrad.addColorStop(0, curRealPeriod === 'day' || curRealPeriod === 'morning' ? '#3B6B3E' : (curRealPeriod === 'dawn' ? '#486634' : '#1E3E26'));
      mossGrad.addColorStop(0.5, curRealPeriod === 'day' || curRealPeriod === 'morning' ? '#274B2A' : '#132818');
      mossGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mossGrad;
      ctx.beginPath();
      ctx.ellipse(treeX, groundY + 3, 34, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      const fogGrad = ctx.createLinearGradient(0, groundY - 12, 0, groundY + 28);
      fogGrad.addColorStop(0, 'rgba(0,0,0,0)');
      fogGrad.addColorStop(0.5, curRealPeriod === 'night' || curRealPeriod === 'predawn' ? 'rgba(30, 55, 45, 0.12)' : (curRealPeriod === 'dawn' ? 'rgba(215, 140, 90, 0.15)' : 'rgba(100, 160, 130, 0.1)'));
      fogGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, groundY - 12, width, 40);
      ctx.restore();

      const registeredSegments: FilamentSegment[] = [];
      const canopyNodePoints: { x: number; y: number; depth: number }[] = [];
      const rootNodePoints: { x: number; y: number; depth: number }[] = [];

      // ========================================================
      // 6. ROOT NETWORK (PHYSICAL WOOD VS NEURAL MYCELIUM)
      // ========================================================
      const renderRootNode = (node: RootNode, startX: number, startY: number, parentAngle: number) => {
        const physicalRootGrowth = Math.min(1.0, physicalGrowth * 1.3);
        const neuralRootGrowth = Math.min(1.0, neuralAmount * 1.3);
        const effectiveRootGrowth = Math.max(physicalRootGrowth, neuralRootGrowth);

        if (effectiveRootGrowth <= 0.01) return;

        const endX = startX + Math.cos(parentAngle) * (node.length * effectiveRootGrowth);
        const endY = startY + Math.sin(parentAngle) * (node.length * effectiveRootGrowth);

        rootNodePoints.push({ x: endX, y: endY, depth: node.depth });
        registeredSegments.push({
          startX,
          startY,
          endX,
          endY,
          domain: 'root',
          depth: node.depth
        });

        if (physicalGrowth > 0.01 && physicalRootGrowth > 0.01) {
          ctx.save();
          ctx.strokeStyle = curRealPeriod === 'day' || curRealPeriod === 'morning' ? '#4A3728' : '#33271D';
          ctx.lineWidth = Math.max(0.65, node.thickness * physicalRootGrowth);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + Math.cos(parentAngle) * (node.length * physicalRootGrowth), startY + Math.sin(parentAngle) * (node.length * physicalRootGrowth));
          ctx.stroke();
          ctx.restore();
        }

        if (neuralAmount > 0.05 && neuralRootGrowth > 0.01) {
          ctx.save();
          ctx.strokeStyle = `rgba(203, 213, 225, ${0.22 + 0.45 * neuralAmount})`;
          ctx.lineWidth = Math.max(0.45, node.thickness * neuralRootGrowth * (0.65 + 0.25 * Math.sin(t * 2 + node.depth)));
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          if (neuralAmount > 0.25 && node.children.length === 0) {
            ctx.fillStyle = '#67E8F9';
            ctx.beginPath();
            ctx.arc(endX, endY, 1.1 * neuralAmount, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        for (let i = 0; i < node.children.length; i++) {
          renderRootNode(node.children[i], endX, endY, parentAngle + node.children[i].angle);
        }
      };

      if ((physicalGrowth > 0.01 || neuralAmount > 0.01) && rootSkeletonsRef.current.length > 0) {
        rootSkeletonsRef.current.forEach((trunk) => {
          renderRootNode(trunk, treeX, groundY, trunk.angle);
        });

        if (neuralAmount > 0.15 && rootNodePoints.length > 3) {
          ctx.save();
          ctx.strokeStyle = `rgba(186, 230, 253, ${0.14 * neuralAmount})`;
          ctx.lineWidth = 0.45;

          for (let i = 0; i < rootNodePoints.length; i += 2) {
            for (let j = i + 1; j < rootNodePoints.length; j += 2) {
              const p1 = rootNodePoints[i];
              const p2 = rootNodePoints[j];
              const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
              if (dist > 15 && dist < 55 && Math.abs(p1.depth - p2.depth) <= 1) {
                const midX = (p1.x + p2.x) * 0.5;
                const midY = (p1.y + p2.y) * 0.5 + 4;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
                ctx.stroke();

                registeredSegments.push({
                  startX: p1.x,
                  startY: p1.y,
                  endX: p2.x,
                  endY: p2.y,
                  ctrlX: midX,
                  ctrlY: midY,
                  isCurved: true,
                  domain: 'root',
                  depth: p1.depth
                });
              }
            }
          }
          ctx.restore();
        }
      }

      // ========================================================
      // 7. SACRED SEED
      // ========================================================
      const seedScale = Math.max(0.65, 1 - physicalGrowth * 1.4);
      const seedR = Math.max(5, 7.5 * seedScale);
      ctx.save();

      const haloR = seedR * (1.8 + 0.35 * Math.sin(t * 2.8));
      const sHalo = ctx.createRadialGradient(treeX, groundY, 1, treeX, groundY, haloR);
      if (neuralAmount > 0.05) {
        sHalo.addColorStop(0, `rgba(186, 230, 253, ${0.5 * neuralAmount})`);
        sHalo.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else {
        sHalo.addColorStop(0, 'rgba(234, 179, 8, 0.35)');
        sHalo.addColorStop(1, 'rgba(234, 179, 8, 0)');
      }
      ctx.fillStyle = sHalo;
      ctx.beginPath();
      ctx.arc(treeX, groundY, haloR, 0, Math.PI * 2);
      ctx.fill();

      // Seed Core
      const seedGrad = ctx.createRadialGradient(treeX - 1.5, groundY - 1.5, 0, treeX, groundY, seedR);
      if (neuralAmount > 0.3) {
        seedGrad.addColorStop(0, '#FFFFFF');
        seedGrad.addColorStop(0.4, '#CBD5E1');
        seedGrad.addColorStop(1, '#475569');
      } else {
        seedGrad.addColorStop(0, '#FACC15');
        seedGrad.addColorStop(0.7, '#A16207');
        seedGrad.addColorStop(1, '#5C381E');
      }
      ctx.fillStyle = seedGrad;
      ctx.beginPath();
      ctx.ellipse(treeX, groundY, seedR * 1.15, seedR * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Breathing ring
      const pulseRingR = seedR + 3.5 + Math.sin(t * 2.2) * 2;
      ctx.strokeStyle = neuralAmount > 0.3 ? 'rgba(56, 189, 248, 0.65)' : 'rgba(234, 179, 8, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(treeX, groundY, pulseRingR, 0, Math.PI * 2);
      ctx.stroke();

      if (!hasClickedSeedRef.current && neuralAmount < 0.1 && physicalGrowth < 0.05) {
        ctx.fillStyle = 'rgba(203, 213, 225, 0.75)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Доторкніться до зернини', treeX, groundY + 28);
      }

      ctx.restore();

      // ========================================================
      // 8. CANOPY: SEPARATED PHYSICAL TREE & NEURAL GOSSAMER
      // ========================================================
      const renderBranch = (
        node: BranchNode,
        startX: number,
        startY: number,
        accumAngle: number
      ) => {
        const depthThreshold = node.depth * 0.12;

        const physicalBranchGrowth = Math.max(0, Math.min(1.0, (physicalGrowth - depthThreshold) * 2.4));
        const neuralBranchGrowth = Math.max(0, Math.min(1.0, (neuralAmount - depthThreshold) * 2.4));
        const effectiveBranchGrowth = Math.max(physicalBranchGrowth, neuralBranchGrowth);

        if (effectiveBranchGrowth <= 0.005) return;

        const depthFactor = (node.depth + 1);
        const windDeflection = windSmoothed * 1.5 * depthFactor;
        const harmonicOscillation = Math.sin(t * (1.6 + windSmoothed * 4.0) + node.swayOffset) * (0.003 + windSmoothed * 0.02) * depthFactor;
        const totalWindSway = windDeflection + harmonicOscillation;

        const currentAngle = accumAngle + node.angle + totalWindSway;

        const len = node.length * effectiveBranchGrowth;
        const endX = startX + Math.cos(currentAngle) * len;
        const endY = startY + Math.sin(currentAngle) * len;

        const curveOffset = (node.curvature || 0) * len;
        const midX = (startX + endX) * 0.5 - Math.sin(currentAngle) * curveOffset;
        const midY = (startY + endY) * 0.5 + Math.cos(currentAngle) * curveOffset;

        canopyNodePoints.push({ x: endX, y: endY, depth: node.depth });
        registeredSegments.push({
          startX,
          startY,
          endX,
          endY,
          ctrlX: node.curvature ? midX : undefined,
          ctrlY: node.curvature ? midY : undefined,
          isCurved: !!node.curvature,
          domain: 'canopy',
          depth: node.depth
        });

        // 8a. PHYSICAL BOTANICAL WOOD (ONLY IF REAL PHYSICAL GROWTH EXISTS)
        if (physicalGrowth > 0.02 && physicalBranchGrowth > 0.01) {
          ctx.save();
          const pLen = node.length * physicalBranchGrowth;
          const pEndX = startX + Math.cos(currentAngle) * pLen;
          const pEndY = startY + Math.sin(currentAngle) * pLen;
          const pCurveOffset = (node.curvature || 0) * pLen;
          const pMidX = (startX + pEndX) * 0.5 - Math.sin(currentAngle) * pCurveOffset;
          const pMidY = (startY + pEndY) * 0.5 + Math.cos(currentAngle) * pCurveOffset;

          const woodThick = Math.max(1.1, node.thickness * physicalBranchGrowth);
          ctx.strokeStyle = curSpecies.trunkColor || '#5C381E';
          ctx.lineWidth = woodThick;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          if (node.curvature) {
            ctx.quadraticCurveTo(pMidX, pMidY, pEndX, pEndY);
          } else {
            ctx.lineTo(pEndX, pEndY);
          }
          ctx.stroke();

          if (node.depth <= 1 && woodThick > 3.5) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = woodThick * 0.35;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            if (node.curvature) {
              ctx.quadraticCurveTo(pMidX, pMidY, pEndX, pEndY);
            } else {
              ctx.lineTo(pEndX, pEndY);
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        // 8b. SILVER GOSSAMER FILAMENTS
        if (neuralAmount > 0.05 && neuralBranchGrowth > 0.01) {
          ctx.save();
          const nLen = node.length * neuralBranchGrowth;
          const nEndX = startX + Math.cos(currentAngle) * nLen;
          const nEndY = startY + Math.sin(currentAngle) * nLen;
          const nCurveOffset = (node.curvature || 0) * nLen;
          const nMidX = (startX + nEndX) * 0.5 - Math.sin(currentAngle) * nCurveOffset;
          const nMidY = (startY + nEndY) * 0.5 + Math.cos(currentAngle) * nCurveOffset;

          const silverGrad = ctx.createLinearGradient(startX, startY, nEndX, nEndY);
          silverGrad.addColorStop(0, '#CBD5E1');
          silverGrad.addColorStop(0.5, '#FFFFFF');
          silverGrad.addColorStop(1, '#94A3B8');
          ctx.strokeStyle = silverGrad;
          ctx.lineWidth = Math.max(
            0.65,
            node.thickness * neuralBranchGrowth * 0.28 * (0.85 + 0.15 * Math.sin(t * 2.5 + node.depth))
          );
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          if (node.curvature) {
            ctx.quadraticCurveTo(nMidX, nMidY, nEndX, nEndY);
          } else {
            ctx.lineTo(nEndX, nEndY);
          }
          ctx.stroke();
          ctx.restore();
        }

        // 8c. SYNAPTIC DEWDROPS ON SILVER WEB
        if (neuralAmount > 0.12 && neuralBranchGrowth > 0.01) {
          ctx.save();
          const nLen = node.length * neuralBranchGrowth;
          const nEndX = startX + Math.cos(currentAngle) * nLen;
          const nEndY = startY + Math.sin(currentAngle) * nLen;

          ctx.translate(nEndX, nEndY);

          const pearlPulse = 0.85 + 0.25 * Math.sin(t * 3.2 + node.depth);
          const pearlR = (node.children.length === 0 ? 2.8 : 1.8) * pearlPulse * neuralAmount;

          ctx.fillStyle = '#E0F2FE';
          ctx.beginPath();
          ctx.arc(0, 0, pearlR, 0, Math.PI * 2);
          ctx.fill();

          if (node.children.length === 0) {
            ctx.strokeStyle = `rgba(186, 230, 253, ${0.45 * neuralAmount})`;
            ctx.lineWidth = 0.65;
            for (let d = -2; d <= 2; d++) {
              const dAngle = currentAngle + d * 0.32 + Math.sin(t * 2 + d) * 0.15;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos(dAngle) * 7.5 * neuralAmount, Math.sin(dAngle) * 7.5 * neuralAmount);
              ctx.stroke();
            }
          }
          ctx.restore();
        }

        // 8d. PHYSICAL FOLIAGE & FRUITS (ONLY IF REAL BOTANICAL GROWTH)
        const leafGrowth = Math.max(0, Math.min(1.0, (physicalGrowth - 0.15 - node.depth * 0.08) * 2.2));
        if (leafGrowth > 0.05 && node.leafCount > 0 && (previewAmount > 0.08 || growthProgressRef.current > 0.12)) {
          ctx.save();
          const pLen = node.length * physicalBranchGrowth;
          const pEndX = startX + Math.cos(currentAngle) * pLen;
          const pEndY = startY + Math.sin(currentAngle) * pLen;
          ctx.translate(pEndX, pEndY);

          const flutterSpeed = 4.0 + windSmoothed * 24.0;
          const flutterAmp = 0.02 + windSmoothed * 0.18;

          if (activeSpeciesIdRef.current === 'pine') {
            ctx.strokeStyle = curSpecies.leafColor || '#1B6B45';
            ctx.lineWidth = 1.1;
            for (let n = -3; n <= 3; n++) {
              const nFlutter = Math.sin(t * flutterSpeed + n) * flutterAmp;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              const nAngle = currentAngle + n * 0.24 + nFlutter;
              ctx.lineTo(Math.cos(nAngle) * 12 * leafGrowth, Math.sin(nAngle) * 12 * leafGrowth);
              ctx.stroke();
            }
            if (node.depth >= 1 && leafGrowth > 0.55 && node.id.includes('tier')) {
              ctx.fillStyle = '#6E4426';
              ctx.beginPath();
              ctx.ellipse(0, 6 * leafGrowth, 2.5 * leafGrowth, 4.5 * leafGrowth, 0, 0, Math.PI * 2);
              ctx.fill();
            }

          } else if (activeSpeciesIdRef.current === 'sakura') {
            ctx.fillStyle = curSpecies.leafColor2 || '#F4A3C2';
            ctx.globalAlpha = 0.85;
            for (let pIdx = 0; pIdx < 5; pIdx++) {
              const pFlutter = Math.sin(t * flutterSpeed + pIdx) * flutterAmp;
              const pAngle = (pIdx * Math.PI * 2) / 5 + pFlutter;
              const px = Math.cos(pAngle) * 5.5 * leafGrowth;
              const py = Math.sin(pAngle) * 5.5 * leafGrowth;
              ctx.beginPath();
              ctx.arc(px, py, 3.8 * leafGrowth, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = '#E11D48';
            ctx.beginPath();
            ctx.arc(0, 0, 1.2 * leafGrowth, 0, Math.PI * 2);
            ctx.fill();

          } else if (activeSpeciesIdRef.current === 'oak') {
            ctx.fillStyle = curSpecies.leafColor || '#2D8055';
            for (let lIdx = -2; lIdx <= 2; lIdx++) {
              const lFlutter = Math.sin(t * flutterSpeed + lIdx * 1.5) * flutterAmp;
              const lAngle = currentAngle + lIdx * 0.35 + lFlutter;
              ctx.beginPath();
              ctx.ellipse(
                Math.cos(lAngle) * 6 * leafGrowth,
                Math.sin(lAngle) * 6 * leafGrowth,
                8.5 * leafGrowth,
                4.8 * leafGrowth,
                lAngle,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
            if (node.depth >= 2 && leafGrowth > 0.6) {
              ctx.fillStyle = '#926033';
              ctx.beginPath();
              ctx.ellipse(2, 5 * leafGrowth, 2.2 * leafGrowth, 3.5 * leafGrowth, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#5C381E';
              ctx.beginPath();
              ctx.arc(2, 3.5 * leafGrowth, 2.6 * leafGrowth, Math.PI, 0);
              ctx.fill();
            }

          } else if (activeSpeciesIdRef.current === 'apple') {
            ctx.fillStyle = curSpecies.leafColor || '#369A5D';
            for (let aIdx = -1; aIdx <= 1; aIdx++) {
              const aFlutter = Math.sin(t * flutterSpeed + aIdx * 2) * flutterAmp;
              const aAngle = currentAngle + aIdx * 0.45 + aFlutter;
              ctx.beginPath();
              ctx.ellipse(
                Math.cos(aAngle) * 5 * leafGrowth,
                Math.sin(aAngle) * 5 * leafGrowth,
                7.5 * leafGrowth,
                4.2 * leafGrowth,
                aAngle,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
            if (node.depth >= 2 && leafGrowth > 0.55 && node.children.length === 0) {
              const appleR = 4.2 * leafGrowth;
              ctx.fillStyle = '#DC2626';
              ctx.beginPath();
              ctx.arc(0, 6 * leafGrowth, appleR, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#FEF08A';
              ctx.beginPath();
              ctx.arc(-1.2 * leafGrowth, (6 - 1.2) * leafGrowth, 1.1 * leafGrowth, 0, Math.PI * 2);
              ctx.fill();
            }

          } else {
            ctx.fillStyle = curSpecies.leafColor || '#E68A2E';
            for (let mIdx = -2; mIdx <= 2; mIdx++) {
              const mFlutter = Math.sin(t * flutterSpeed + mIdx * 1.6) * flutterAmp;
              const mAngle = currentAngle + mIdx * 0.32 + mFlutter;
              ctx.beginPath();
              ctx.ellipse(
                Math.cos(mAngle) * 5.5 * leafGrowth,
                Math.sin(mAngle) * 5.5 * leafGrowth,
                8 * leafGrowth,
                3.8 * leafGrowth,
                mAngle,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }

          ctx.restore();
        }

        for (let i = 0; i < node.children.length; i++) {
          renderBranch(node.children[i], endX, endY, currentAngle);
        }
      };

      if (branchSkeletonRef.current && (physicalGrowth > 0.005 || neuralAmount > 0.005)) {
        renderBranch(branchSkeletonRef.current, treeX, groundY, 0);
      }

      // ========================================================
      // 9. SPIDERWEB CROSS-THREADS IN CANOPY
      // ========================================================
      if (neuralAmount > 0.12 && canopyNodePoints.length > 6) {
        ctx.save();
        ctx.strokeStyle = `rgba(241, 245, 249, ${0.32 * neuralAmount})`;
        ctx.lineWidth = 0.65;

        for (let i = 0; i < canopyNodePoints.length; i += 2) {
          for (let j = i + 1; j < canopyNodePoints.length; j += 2) {
            const p1 = canopyNodePoints[i];
            const p2 = canopyNodePoints[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

            if (dist > 35 && dist < 135 && Math.abs(p1.depth - p2.depth) <= 1) {
              const midX = (p1.x + p2.x) * 0.5;
              const midY = (p1.y + p2.y) * 0.5 + (dist * 0.08);

              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
              ctx.stroke();

              const pearlR = 1.1 * neuralAmount;
              ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
              ctx.beginPath();
              ctx.arc(midX, midY, pearlR, 0, Math.PI * 2);
              ctx.fill();

              registeredSegments.push({
                startX: p1.x,
                startY: p1.y,
                endX: p2.x,
                endY: p2.y,
                ctrlX: midX,
                ctrlY: midY,
                isCurved: true,
                domain: 'web',
                depth: p1.depth
              });
            }
          }
        }
        ctx.restore();
      }

      // ========================================================
      // 10. LIGHT BUNDLES ("ПУЧКИ СВІТЛА")
      // ========================================================
      if (neuralAmount > 0.1 && registeredSegments.length > 0) {
        const segCount = registeredSegments.length;
        const bundles = lightBundlesRef.current;

        bundles.forEach((bundle) => {
          bundle.progress += bundle.speed * bundle.direction * dt;

          if (bundle.progress > 1.0) {
            bundle.progress = 0;
            bundle.segIndex = Math.floor(Math.random() * segCount);
            bundle.direction = Math.random() > 0.2 ? 1 : -1;
          } else if (bundle.progress < 0.0) {
            bundle.progress = 1.0;
            bundle.segIndex = Math.floor(Math.random() * segCount);
            bundle.direction = Math.random() > 0.2 ? 1 : -1;
          }

          const seg = registeredSegments[bundle.segIndex % segCount];
          if (!seg) return;

          let px: number;
          let py: number;
          const u = bundle.progress;

          if (seg.isCurved && seg.ctrlX !== undefined && seg.ctrlY !== undefined) {
            const inv = 1 - u;
            px = inv * inv * seg.startX + 2 * inv * u * seg.ctrlX + u * u * seg.endX;
            py = inv * inv * seg.startY + 2 * inv * u * seg.ctrlY + u * u * seg.endY;
          } else {
            px = seg.startX + (seg.endX - seg.startX) * u;
            py = seg.startY + (seg.endY - seg.startY) * u;
          }

          ctx.save();

          const auraR = (bundle.radius * 3.2) * neuralAmount;
          const auraGrad = ctx.createRadialGradient(px, py, 0.5, px, py, auraR);
          auraGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * bundle.alpha * neuralAmount})`);
          auraGrad.addColorStop(0.35, `rgba(103, 232, 249, ${0.65 * bundle.alpha * neuralAmount})`);
          auraGrad.addColorStop(0.7, `rgba(56, 189, 248, ${0.25 * bundle.alpha * neuralAmount})`);
          auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(px, py, auraR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, bundle.radius * 0.7 * neuralAmount, 0, Math.PI * 2);
          ctx.fill();

          bundle.subPhotons.forEach((sp) => {
            const currentSubAngle = sp.angle + t * sp.speed;
            const spX = px + Math.cos(currentSubAngle) * sp.dist;
            const spY = py + Math.sin(currentSubAngle) * sp.dist;

            ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
            ctx.beginPath();
            ctx.arc(spX, spY, sp.size * neuralAmount, 0, Math.PI * 2);
            ctx.fill();
          });

          const tailU = Math.max(0, Math.min(1, u - bundle.direction * 0.12));
          let tailX: number;
          let tailY: number;
          if (seg.isCurved && seg.ctrlX !== undefined && seg.ctrlY !== undefined) {
            const invT = 1 - tailU;
            tailX = invT * invT * seg.startX + 2 * invT * tailU * seg.ctrlX + tailU * tailU * seg.endX;
            tailY = invT * invT * seg.startY + 2 * invT * tailU * seg.ctrlY + tailU * tailU * seg.endY;
          } else {
            tailX = seg.startX + (seg.endX - seg.startX) * tailU;
            tailY = seg.startY + (seg.endY - seg.startY) * tailU;
          }

          const tailGrad = ctx.createLinearGradient(px, py, tailX, tailY);
          tailGrad.addColorStop(0, `rgba(186, 230, 253, ${0.75 * neuralAmount})`);
          tailGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.strokeStyle = tailGrad;
          ctx.lineWidth = 1.6 * neuralAmount;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          ctx.restore();
        });
      }

      // 11. ATMOSPHERIC MOTES
      const motes = motesRef.current;
      motes.forEach((m) => {
        const windDriftX = windSmoothed * 38;
        m.x += (m.vx + windDriftX) * dt;
        m.y += m.vy * dt;

        if (m.x < 5) m.x = width - 10;
        if (m.x > width - 5) m.x = 10;
        if (m.y < height * 0.12) m.y = groundY - 10;
        if (m.y > groundY + 10) m.y = height * 0.18;

        ctx.save();
        if (neuralAmount > 0.25) {
          const pulse = 0.4 + 0.6 * Math.sin(t * 3.0 + m.phase);
          ctx.fillStyle = `rgba(186, 230, 253, ${pulse * 0.65})`;
        } else if (curRealPeriod === 'night' || curRealPeriod === 'predawn') {
          const pulse = 0.3 + 0.7 * Math.sin(t * 2.2 + m.phase);
          ctx.fillStyle = 'rgba(210, 255, 140, ' + (pulse * 0.55) + ')';
        } else if (curRealPeriod === 'evening' || curRealPeriod === 'twilight') {
          ctx.fillStyle = 'rgba(255, 200, 140, 0.28)';
        } else if (curRealPeriod === 'dawn') {
          ctx.fillStyle = 'rgba(230, 245, 220, 0.28)';
        } else {
          ctx.fillStyle = 'rgba(200, 235, 180, 0.32)';
        }
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#040711] text-stone-100 select-none overflow-hidden font-sans touch-none"
    >
      {/* Living Sanctuary Canvas (Full Screen) */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-pointer" />

      {/* CSS PULSATING MOON GLOW AURA (Overlaid at 82% left, 16% top) */}
      {currentAtmosphere.showMoon && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full animate-lunar-pulse z-20"
          style={{
            left: '82%',
            top: '16%',
            width: '64px',
            height: '64px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(224, 242, 254, 0.45) 45%, rgba(186, 230, 253, 0) 75%)'
          }}
        />
      )}

      {/* TOP BAR: BACK ARROW, TIME SELECTOR, SOUND TOGGLE & 'ЛІС' BUTTON */}
      <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => onSwitchTab?.('counter')}
          className="pointer-events-auto w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-800/80 active:scale-95 border border-stone-700/40 backdrop-blur-md flex items-center justify-center text-stone-300 hover:text-white transition-all cursor-pointer shadow-lg"
          title="Повернутися"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {/* Time of Day Switcher Button */}
          <button
            type="button"
            onClick={() => {
              audio.init();
              audio.playDropNote();
              setIsTimeSelectorOpen((prev) => !prev);
            }}
            className={`pointer-events-auto h-10 px-3.5 rounded-full border backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              manualTimePeriod
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-200 hover:bg-amber-900/70 hover:text-white'
                : 'bg-stone-900/60 border-stone-700/40 text-stone-300 hover:bg-stone-800/80 hover:text-white'
            }`}
            title="Перемикач часу доби (досвіток, світанок, ранок, день, сутінки, вечір, ніч)"
          >
            <span className="text-sm">{currentAtmosphere.icon}</span>
            <span className="text-xs font-semibold">{currentAtmosphere.periodName}</span>
            {manualTimePeriod && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Sound Ambience Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`pointer-events-auto w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
              soundEnabled
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/70 hover:text-white'
                : 'bg-stone-900/60 border-stone-700/40 text-stone-400 hover:bg-stone-800/80 hover:text-stone-200'
            }`}
            title={soundEnabled ? 'Звук увімкнено (шелест вітру, ASMR)' : 'Звук вимкнено'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 'Ліс' Full-Screen Button */}
          <button
            type="button"
            onClick={() => setIsForestOpen(true)}
            className="pointer-events-auto h-10 px-4 rounded-full bg-stone-900/70 hover:bg-stone-800/90 active:scale-95 border border-emerald-500/30 backdrop-blur-md flex items-center gap-2 text-emerald-200 hover:text-white transition-all cursor-pointer shadow-lg"
            title="Затишний Ліс"
          >
            <Trees className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold">Ліс</span>
            {forest.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-mono text-emerald-300">
                {forest.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* TIME-OF-DAY SELECTOR FLOATING MENU */}
      {isTimeSelectorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/40 backdrop-blur-sm animate-fade-in pointer-events-auto"
          onClick={() => setIsTimeSelectorOpen(false)}
        >
          <div
            className="w-72 rounded-3xl bg-stone-950/92 border border-amber-500/30 backdrop-blur-2xl shadow-2xl p-4 text-stone-100 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Час та Освітлення
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTimeSelectorOpen(false)}
                className="w-6 h-6 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 7 Times Grid */}
            <div className="grid grid-cols-1 gap-1.5 mb-3">
              {TIME_PERIODS_ORDER.map((periodKey) => {
                const item = ATMOSPHERES[periodKey];
                const isSelected = activePeriod === periodKey;
                return (
                  <button
                    key={periodKey}
                    type="button"
                    onClick={() => handleSelectTimePeriod(periodKey)}
                    className={`w-full px-3 py-2 rounded-2xl flex items-center justify-between text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-md scale-[1.01]'
                        : 'bg-stone-900/50 border-stone-800/50 hover:bg-stone-800/70 text-stone-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <span>{item.periodName}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-mono">
                        Активно
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Automatic Real-Time Button */}
            <button
              type="button"
              onClick={() => handleSelectTimePeriod('auto')}
              className={`w-full py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer border ${
                manualTimePeriod === null
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-200'
                  : 'bg-stone-900/60 border-stone-800/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Реальний час (Авто: {ATMOSPHERES[realTimePeriod].periodName})</span>
            </button>
          </div>
        </div>
      )}

      {/* ASTRONOMICAL MOON PHASE FLOATING INFO MODAL / CARD */}
      {isMoonModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in pointer-events-auto"
          onClick={() => setIsMoonModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-stone-950/90 border border-sky-500/30 backdrop-blur-2xl shadow-2xl p-6 text-stone-100 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-300">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium uppercase tracking-widest text-sky-400/90">
                  Астрономічний Місяць
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMoonModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Закрити"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-900 via-sky-950/40 to-stone-900 border border-sky-400/30 flex items-center justify-center shadow-lg relative shrink-0">
                <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(186,230,253,0.6)]">
                  {moonData.icon}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-sky-100 truncate">
                  {moonData.name}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {moonData.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 my-4">
              <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Освітленість</span>
                </div>
                <p className="text-base font-bold text-white font-mono">
                  {moonData.percentage}%
                </p>
                <div className="w-full h-1.5 bg-stone-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${moonData.percentage}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>Вік Місяця</span>
                </div>
                <p className="text-base font-bold text-white font-mono">
                  {moonData.ageDays} <span className="text-xs font-normal text-stone-400">/ 29.5 дні</span>
                </p>
                <p className="text-[10px] text-stone-500 mt-1">
                  {currentAtmosphere.periodName}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/20 my-3">
              <div className="flex items-start gap-2">
                <Compass className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-200/90 leading-relaxed">
                  {moonData.significance}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMoonModalOpen(false)}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-600/80 to-indigo-600/80 hover:from-sky-500 hover:to-indigo-500 active:scale-98 text-white text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Зрозуміло</span>
            </button>
          </div>
        </div>
      )}

      {/* ADULT TREE PREVIEW FLOATING PILL */}
      {previewAdult && !isMature && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-sm w-[90%] sm:w-auto animate-fade-in">
          <div className="px-4 py-3 rounded-2xl bg-stone-950/85 border border-emerald-500/40 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl shrink-0">{activeSpecies.icon}</span>
              <div>
                <p className="text-xs font-semibold text-emerald-300">
                  Форма дорослого дерева ({activeSpecies.name})
                </p>
                <p className="text-[10px] text-stone-400">
                  Повторює нейронні контури. Торкніться зернини для павутинки
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                audio.init();
                audio.playDropNote();
                setPreviewAdult(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer transition-all border border-stone-600/50 shrink-0"
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      {/* MATURE TREE: TRANSITION TO COZY FOREST PROMPT */}
      {isMature && currentTree && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="px-5 py-3 rounded-2xl bg-stone-950/85 border border-emerald-500/40 backdrop-blur-xl shadow-2xl flex items-center gap-4 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-emerald-300">Дерево виросло за 20 днів!</p>
              <p className="text-[11px] text-stone-400">Час перенести саджанець у Затишний Ліс</p>
            </div>
            <button
              type="button"
              onClick={handleTransitionToForest}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-medium transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Trees className="w-3.5 h-3.5" />
              <span>У Затишний Ліс</span>
            </button>
          </div>
        </div>
      )}

      {/* COZY FOREST FULL SCREEN */}
      <CozyForestModal
        isOpen={isForestOpen}
        onClose={() => setIsForestOpen(false)}
        forest={forest}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        availableSeeds={availableSeeds}
        cigsAvoided={cigsAvoided}
        currentTree={currentTree}
        moonData={moonData}
        onPlantSeed={handlePlantChosenSeed}
      />
    </div>
  );
};
