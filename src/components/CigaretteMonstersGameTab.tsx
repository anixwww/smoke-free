import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Play,
  Pause,
  Zap,
  Sparkles,
  Shield,
  Target,
  Swords,
  Crosshair,
  Flame,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CigaretteMonstersGameTabProps {
  onSwitchTab: (tab: any) => void;
  cigsAvoided?: number;
}

// -------------------------------------------------------------
// WEAPON DEFINITIONS (22 Distinct Destruction Tools)
// -------------------------------------------------------------
export interface WeaponDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  type: 'projectile' | 'beam' | 'aoe' | 'orbit' | 'ground' | 'instant' | 'drone' | 'strike';
  baseDamage: number;
  baseCooldownMs: number;
  unlockedByDefault?: boolean;
  color: string;
}

export const WEAPON_REGISTRY: WeaponDef[] = [
  {
    id: 'fireball',
    name: 'Вогняна Гармата',
    desc: 'Автоматично випускає палаючі вогняні кулі в найближчих монстрів',
    icon: '🔥',
    type: 'projectile',
    baseDamage: 25,
    baseCooldownMs: 500,
    unlockedByDefault: true,
    color: '#f97316'
  },
  {
    id: 'chain_lightning',
    name: 'Електро-Блискавка',
    desc: 'Миттєвий розряд струму, що стрибає між 4 повзучими сигаретами',
    icon: '⚡',
    type: 'instant',
    baseDamage: 35,
    baseCooldownMs: 1400,
    color: '#38bdf8'
  },
  {
    id: 'spinning_blades',
    name: 'Гільйотина Недопалків',
    desc: 'Обертові гострі леза навколо фортеці, що шаткують наближених ворогів',
    icon: '✂️',
    type: 'orbit',
    baseDamage: 18,
    baseCooldownMs: 100,
    color: '#cbd5e1'
  },
  {
    id: 'hydro_blaster',
    name: 'Гідробластер',
    desc: 'Струмінь крижаної води під тиском, гасить вістря сигарет і сповільнює їх',
    icon: '💧',
    type: 'projectile',
    baseDamage: 22,
    baseCooldownMs: 650,
    color: '#06b6d4'
  },
  {
    id: 'cryo_freeze',
    name: 'Кріо-Генератор',
    desc: 'Вибух морозної свіжості, що заморожує і розламує тютюнові гільзи',
    icon: '❄️',
    type: 'aoe',
    baseDamage: 40,
    baseCooldownMs: 2200,
    color: '#93c5fd'
  },
  {
    id: 'co2_extinguisher',
    name: 'Вуглекислотний Вогнегасник',
    desc: 'Конічний потік білого газу, що повністю гасить вуглики сигарет',
    icon: '🧯',
    type: 'beam',
    baseDamage: 15,
    baseCooldownMs: 300,
    color: '#e2e8f0'
  },
  {
    id: 'orbital_meteor',
    name: 'Орбітальний Метеор',
    desc: 'Періодично скидає палаючий камінь на найбільше скупчення сигарет',
    icon: '☄️',
    type: 'strike',
    baseDamage: 120,
    baseCooldownMs: 3200,
    color: '#ef4444'
  },
  {
    id: 'tobacco_shredder',
    name: 'Подрібнювач Тютюну',
    desc: 'Наземні дискові пили, що подрібнюють ворогів на дрібне листя',
    icon: '🪓',
    type: 'ground',
    baseDamage: 30,
    baseCooldownMs: 1100,
    color: '#fbbf24'
  },
  {
    id: 'acid_pool',
    name: 'Розчинник Смоли',
    desc: 'Калюжі їдкої екологічної кислоти, що розчиняють фільтри при контакті',
    icon: '🧪',
    type: 'ground',
    baseDamage: 12,
    baseCooldownMs: 1800,
    color: '#a3e635'
  },
  {
    id: 'vortex_gravity',
    name: 'Гравітаційна Вирва',
    desc: 'Створює міні-чорну діру, яка стягує монстрів до центру та розчавлює їх',
    icon: '🌀',
    type: 'aoe',
    baseDamage: 60,
    baseCooldownMs: 4000,
    color: '#a855f7'
  },
  {
    id: 'tesla_barrier',
    name: 'Бар\'єр Тесли',
    desc: 'Енергетичний паркан, що б\'є струмом кожного монстра, який підійшов близько',
    icon: '🛡️',
    type: 'instant',
    baseDamage: 28,
    baseCooldownMs: 900,
    color: '#60a5fa'
  },
  {
    id: 'cluster_bombs',
    name: 'Касетні Снаряди',
    desc: 'Бомба розлітається на 6 дрібних уламків, вибухаючи по всій площі',
    icon: '💣',
    type: 'projectile',
    baseDamage: 45,
    baseCooldownMs: 2000,
    color: '#f97316'
  },
  {
    id: 'holy_ballista',
    name: 'Промениста Баліста',
    desc: 'Стріли чистого світла, що пронизують наскрізь усю колону сигарет',
    icon: '🏹',
    type: 'projectile',
    baseDamage: 55,
    baseCooldownMs: 1300,
    color: '#fef08a'
  },
  {
    id: 'oxygen_cyclone',
    name: 'Ураган Свіжості',
    desc: 'Торнадо чистого кисню, яке відкидає повзучих монстрів назад угору',
    icon: '🌪️',
    type: 'aoe',
    baseDamage: 20,
    baseCooldownMs: 2500,
    color: '#67e8f9'
  },
  {
    id: 'emp_pulse',
    name: 'ЕМІ Шокер',
    desc: 'Паралізуючий імпульс, що оглушує всіх монстрів на 2.5 секунди',
    icon: '🧲',
    type: 'aoe',
    baseDamage: 15,
    baseCooldownMs: 4500,
    color: '#818cf8'
  },
  {
    id: 'magma_geyser',
    name: 'Лавовий Гейзер',
    desc: 'Виверження лави з-під землі під ногами найбільшої групи ворогів',
    icon: '🌋',
    type: 'ground',
    baseDamage: 85,
    baseCooldownMs: 2800,
    color: '#ea580c'
  },
  {
    id: 'cleaner_drones',
    name: 'Дрони-Очисники',
    desc: 'Пара автономних дронів літає над полем і розстрілює сигарети лазерами',
    icon: '🐝',
    type: 'drone',
    baseDamage: 14,
    baseCooldownMs: 350,
    color: '#22d3ee'
  },
  {
    id: 'titan_hammer',
    name: 'Гравітаційний Молот',
    desc: 'Потужний удар об землю викликає сейсмічну хвилю по всьому полю бою',
    icon: '🔨',
    type: 'strike',
    baseDamage: 70,
    baseCooldownMs: 3500,
    color: '#f43f5e'
  },
  {
    id: 'solar_laser',
    name: 'Сонячний Промінь',
    desc: 'Неперервний лазерний промінь, що випалює повзучих монстрів на попіл',
    icon: '☀️',
    type: 'beam',
    baseDamage: 32,
    baseCooldownMs: 700,
    color: '#facc15'
  },
  {
    id: 'atomic_detox',
    name: 'Атомний Детоксикатор',
    desc: 'Гігантська детокс-ракета повільної дії з нищівним вибухом на весь екран',
    icon: '💥',
    type: 'strike',
    baseDamage: 250,
    baseCooldownMs: 7000,
    color: '#4ade80'
  },
  {
    id: 'mint_spores',
    name: 'М\'ятні Спори',
    desc: 'Хмара ароматної м\'яти розчиняє нікотиновий наліт на повзучих ворогах',
    icon: '🍃',
    type: 'aoe',
    baseDamage: 18,
    baseCooldownMs: 1600,
    color: '#34d399'
  },
  {
    id: 'prism_ricochet',
    name: 'Призматичний Рикошет',
    desc: 'Світловий кристал, чиї промені відбиваються від стін до 8 разів',
    icon: '💎',
    type: 'projectile',
    baseDamage: 38,
    baseCooldownMs: 1100,
    color: '#ec4899'
  }
];

// Sound Synthesizer via Web Audio API
class TowerAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playShot(freq: number = 440, duration: number = 0.12, type: OscillatorType = 'triangle') {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.3), now + duration);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  playZap() {
    this.playShot(780, 0.15, 'sawtooth');
  }

  playBoom() {
    this.playShot(140, 0.35, 'sawtooth');
  }

  playUpgrade() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [330, 440, 554, 659];
      notes.forEach((f, i) => {
        const now = this.ctx!.currentTime + i * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch (e) {}
  }

  playDefeat() {
    this.playShot(90, 0.5, 'square');
  }
}

// -------------------------------------------------------------
// GAME STATE INTERFACES
// -------------------------------------------------------------
interface ActiveWeapon {
  id: string;
  level: number;
  lastFired: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  pierce: number;
  life: number;
  bounces?: number;
  isCluster?: boolean;
  tail: { x: number; y: number }[];
}

interface GroundEffect {
  id: string;
  type: 'acid' | 'shredder' | 'magma' | 'vortex';
  x: number;
  y: number;
  radius: number;
  damage: number;
  durationFrames: number;
  color: string;
}

interface Monster {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  crawlPhase: number;
  type: 'slim' | 'classic' | 'filter_heavy' | 'cigar_boss' | 'pack_carrier';
  slowFactor: number;
  stunFrames: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

interface UpgradeChoice {
  weaponId: string;
  isNew: boolean;
  name: string;
  desc: string;
  icon: string;
  color: string;
  level: number;
}

export const CigaretteMonstersGameTab: React.FC<CigaretteMonstersGameTabProps> = ({
  onSwitchTab,
  cigsAvoided = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<TowerAudio>(new TowerAudio());

  // Game UI state
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'UPGRADE_MODAL' | 'PAUSED' | 'GAME_OVER'>('MENU');
  const [score, setScore] = useState<number>(0);
  const [baseHp, setBaseHp] = useState<number>(100);
  const [maxBaseHp, setMaxBaseHp] = useState<number>(100);
  const [totalCigarettesDefeated, setTotalCigarettesDefeated] = useState<number>(0);
  const [waveCount, setWaveCount] = useState<number>(1);
  const [gameSpeed, setGameSpeed] = useState<number>(1); // 1x or 2x speed

  // High score in local storage
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('quit-smoking:td-highscore') || 0);
    } catch {
      return 0;
    }
  });

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:td-sound') !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    audioRef.current.enabled = soundEnabled;
    try {
      localStorage.setItem('quit-smoking:td-sound', String(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  // Active Weapons Arsenal
  const [activeWeapons, setActiveWeapons] = useState<ActiveWeapon[]>([
    { id: 'fireball', level: 1, lastFired: 0 }
  ]);
  const activeWeaponsRef = useRef<ActiveWeapon[]>([
    { id: 'fireball', level: 1, lastFired: 0 }
  ]);
  useEffect(() => {
    activeWeaponsRef.current = activeWeapons;
  }, [activeWeapons]);

  // Points Threshold for Next Upgrade (Every 10 points)
  const nextUpgradeScoreRef = useRef<number>(10);
  const [pointsToNextUpgrade, setPointsToNextUpgrade] = useState<number>(10);
  const [upgradeChoices, setUpgradeChoices] = useState<UpgradeChoice[]>([]);

  // Entities Refs for 60FPS Game Loop
  const monstersRef = useRef<Monster[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const groundEffectsRef = useRef<GroundEffect[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const spawnTimerRef = useRef<number>(0);
  const baseHpRef = useRef<number>(100);
  const scoreRef = useRef<number>(0);
  const bladesAngleRef = useRef<number>(0);
  const droneAngleRef = useRef<number>(0);

  // Resize canvas handler
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = Math.max(500, rect.height);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Start / Reset Game
  const startNewGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setBaseHp(100);
    setMaxBaseHp(100);
    baseHpRef.current = 100;
    setTotalCigarettesDefeated(0);
    setWaveCount(1);
    nextUpgradeScoreRef.current = 10;
    setPointsToNextUpgrade(10);

    const initialWeapons = [{ id: 'fireball', level: 1, lastFired: 0 }];
    setActiveWeapons(initialWeapons);
    activeWeaponsRef.current = initialWeapons;

    monstersRef.current = [];
    projectilesRef.current = [];
    groundEffectsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    spawnTimerRef.current = 40;

    setGameState('PLAYING');
    audioRef.current.playShot(520, 0.2);
  };

  // Trigger 3 Upgrade Choices when 10 points threshold reached
  const triggerUpgradeChoice = () => {
    audioRef.current.playUpgrade();
    setGameState('UPGRADE_MODAL');

    const currentWeaponMap = new Map<string, number>();
    activeWeaponsRef.current.forEach((w) => currentWeaponMap.set(w.id, w.level));

    const options: UpgradeChoice[] = [];

    // All available weapons from registry
    const allDefs = [...WEAPON_REGISTRY];
    // Shuffle pool
    const shuffled = allDefs.sort(() => 0.5 - Math.random());

    for (const def of shuffled) {
      if (options.length >= 3) break;
      const currentLevel = currentWeaponMap.get(def.id) || 0;

      if (currentLevel === 0) {
        // New weapon unlock
        options.push({
          weaponId: def.id,
          isNew: true,
          name: `НОВА: ${def.name}`,
          desc: def.desc,
          icon: def.icon,
          color: def.color,
          level: 1
        });
      } else if (currentLevel < 5) {
        // Upgrade existing weapon
        options.push({
          weaponId: def.id,
          isNew: false,
          name: `${def.name} (Рівень ${currentLevel + 1})`,
          desc: `+30% шкоди та +20% скорострільності для зброї ${def.name}`,
          icon: def.icon,
          color: def.color,
          level: currentLevel + 1
        });
      }
    }

    // If less than 3 choices found, add Fortress Repair/Shield
    while (options.length < 3) {
      options.push({
        weaponId: 'base_heal',
        isNew: false,
        name: 'Ремонт Фортеці (+40 HP)',
        desc: 'Відновлює міцність стіни захисту та зміцнює антитютюновий бар\'єр',
        icon: '🛡️',
        color: '#22c55e',
        level: 1
      });
    }

    setUpgradeChoices(options);
  };

  // Select an upgrade
  const handleSelectUpgrade = (choice: UpgradeChoice) => {
    if (choice.weaponId === 'base_heal') {
      const newHp = Math.min(maxBaseHp, baseHpRef.current + 40);
      baseHpRef.current = newHp;
      setBaseHp(newHp);
    } else {
      const existing = activeWeaponsRef.current.find((w) => w.id === choice.weaponId);
      if (existing) {
        const updated = activeWeaponsRef.current.map((w) =>
          w.id === choice.weaponId ? { ...w, level: w.level + 1 } : w
        );
        setActiveWeapons(updated);
        activeWeaponsRef.current = updated;
      } else {
        const updated = [...activeWeaponsRef.current, { id: choice.weaponId, level: 1, lastFired: 0 }];
        setActiveWeapons(updated);
        activeWeaponsRef.current = updated;
      }
    }

    // Set next target (+10 points)
    nextUpgradeScoreRef.current += 10;
    setPointsToNextUpgrade(Math.max(0, nextUpgradeScoreRef.current - scoreRef.current));
    setGameState('PLAYING');
  };

  // -------------------------------------------------------------
  // MAIN GAME ENGINE LOOP (60FPS Canvas Animation)
  // -------------------------------------------------------------
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (canvas && gameState === 'PLAYING') {
        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const now = Date.now();

        if (ctx) {
          ctx.clearRect(0, 0, width, height);

          // 1. Background Grid & Clean Zone
          ctx.fillStyle = '#0a0d14';
          ctx.fillRect(0, 0, width, height);

          // Grid lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          for (let x = 0; x < width; x += 36) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += 36) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // Fortress Defense Line at bottom
          const defenseY = height - 54;
          const heroX = width / 2;
          const heroY = defenseY + 15;

          // Wall graphic
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, defenseY, width, 54);
          ctx.fillStyle = '#334155';
          ctx.fillRect(0, defenseY, width, 4);

          // Fort spikes / barrier
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, defenseY);
          for (let x = 0; x < width; x += 20) {
            ctx.lineTo(x + 10, defenseY - 8);
            ctx.lineTo(x + 20, defenseY);
          }
          ctx.stroke();

          // ---------------------------------------------------------
          // SPAWN CRAWLING MONSTERS (NO SHOOTING - JUST CRAWLING DOWN)
          // ---------------------------------------------------------
          spawnTimerRef.current -= gameSpeed;
          if (spawnTimerRef.current <= 0) {
            const currentScore = scoreRef.current;
            const currentWave = Math.floor(currentScore / 25) + 1;
            setWaveCount(currentWave);

            spawnTimerRef.current = Math.max(18, 55 - currentWave * 2);

            // Random monster type
            const rand = Math.random();
            let mType: Monster['type'] = 'classic';
            let mHp = 30 + currentWave * 8;
            let mSpeed = 0.65 + Math.random() * 0.35;
            let mWidth = 24;
            let mHeight = 50;

            if (currentWave >= 3 && rand < 0.25) {
              mType = 'filter_heavy';
              mHp = 90 + currentWave * 18;
              mSpeed = 0.45;
              mWidth = 32;
              mHeight = 44;
            } else if (rand < 0.5) {
              mType = 'slim';
              mHp = 22 + currentWave * 5;
              mSpeed = 1.05 + Math.random() * 0.4;
              mWidth = 18;
              mHeight = 54;
            } else if (currentWave >= 5 && rand > 0.88) {
              mType = 'cigar_boss';
              mHp = 350 + currentWave * 60;
              mSpeed = 0.3;
              mWidth = 55;
              mHeight = 70;
            }

            monstersRef.current.push({
              id: Math.random().toString(36).substr(2, 9),
              type: mType,
              x: 20 + Math.random() * (width - 40),
              y: -50,
              width: mWidth,
              height: mHeight,
              hp: mHp,
              maxHp: mHp,
              speed: mSpeed,
              crawlPhase: Math.random() * Math.PI * 2,
              slowFactor: 1,
              stunFrames: 0
            });
          }

          // ---------------------------------------------------------
          // HERO AUTO-FIRING ACTIVE ARSENAL (22 WEAPONS)
          // ---------------------------------------------------------
          const monsters = monstersRef.current;
          // Sort monsters by Y descending (closest to defense wall)
          const sortedByClosest = [...monsters].sort((a, b) => b.y - a.y);
          const closestMonster = sortedByClosest[0];

          bladesAngleRef.current += 0.05 * gameSpeed;
          droneAngleRef.current += 0.04 * gameSpeed;

          activeWeaponsRef.current.forEach((activeW) => {
            const def = WEAPON_REGISTRY.find((r) => r.id === activeW.id);
            if (!def) return;

            const lvl = activeW.level;
            const cooldown = Math.max(100, def.baseCooldownMs * Math.pow(0.85, lvl - 1));
            const dmg = Math.round(def.baseDamage * (1 + (lvl - 1) * 0.35));

            if (now - activeW.lastFired >= cooldown) {
              activeW.lastFired = now;

              // Execute weapon behavior
              if (def.id === 'fireball' && closestMonster) {
                const angle = Math.atan2(closestMonster.y - heroY, closestMonster.x - heroX);
                projectilesRef.current.push({
                  x: heroX,
                  y: heroY - 15,
                  vx: Math.cos(angle) * 9,
                  vy: Math.sin(angle) * 9,
                  radius: 8 + lvl * 2,
                  damage: dmg,
                  color: '#f97316',
                  pierce: 1 + Math.floor(lvl / 2),
                  life: 120,
                  tail: []
                });
                audioRef.current.playShot(480, 0.1);
              } else if (def.id === 'chain_lightning' && monsters.length > 0) {
                // Zap up to 3+lvl enemies
                const targets = sortedByClosest.slice(0, 3 + lvl);
                let prevX = heroX;
                let prevY = heroY;
                targets.forEach((t) => {
                  t.hp -= dmg;
                  floatingTextsRef.current.push({
                    x: t.x,
                    y: t.y - 10,
                    text: `-${dmg}⚡`,
                    color: '#38bdf8',
                    alpha: 1,
                    vy: -1.5
                  });
                  // Draw lightning bolt
                  ctx.strokeStyle = '#38bdf8';
                  ctx.lineWidth = 2.5;
                  ctx.beginPath();
                  ctx.moveTo(prevX, prevY);
                  ctx.lineTo((prevX + t.x) / 2 + (Math.random() - 0.5) * 15, (prevY + t.y) / 2);
                  ctx.lineTo(t.x, t.y);
                  ctx.stroke();
                  prevX = t.x;
                  prevY = t.y;
                });
                audioRef.current.playZap();
              } else if (def.id === 'hydro_blaster' && closestMonster) {
                const angle = Math.atan2(closestMonster.y - heroY, closestMonster.x - heroX);
                projectilesRef.current.push({
                  x: heroX,
                  y: heroY - 15,
                  vx: Math.cos(angle) * 11,
                  vy: Math.sin(angle) * 11,
                  radius: 7,
                  damage: dmg,
                  color: '#06b6d4',
                  pierce: 2,
                  life: 100,
                  tail: []
                });
                audioRef.current.playShot(600, 0.08);
              } else if (def.id === 'cryo_freeze' && monsters.length > 0) {
                // Freeze nearby monsters
                monsters.forEach((m) => {
                  if (m.y > height * 0.4) {
                    m.hp -= dmg;
                    m.slowFactor = 0.4;
                    m.stunFrames = 60 + lvl * 20;
                    floatingTextsRef.current.push({
                      x: m.x,
                      y: m.y - 10,
                      text: `-${dmg}❄️`,
                      color: '#93c5fd',
                      alpha: 1,
                      vy: -1.2
                    });
                  }
                });
                audioRef.current.playShot(280, 0.3, 'sine');
              } else if (def.id === 'orbital_meteor' && monsters.length > 0) {
                const target = sortedByClosest[Math.floor(Math.random() * Math.min(3, sortedByClosest.length))];
                if (target) {
                  // Spawn ground explosion
                  groundEffectsRef.current.push({
                    id: Math.random().toString(),
                    type: 'magma',
                    x: target.x,
                    y: target.y,
                    radius: 40 + lvl * 10,
                    damage: dmg,
                    durationFrames: 25,
                    color: '#ef4444'
                  });
                  audioRef.current.playBoom();
                }
              } else if (def.id === 'acid_pool') {
                // Place acid pool in center-mid zone
                groundEffectsRef.current.push({
                  id: Math.random().toString(),
                  type: 'acid',
                  x: 40 + Math.random() * (width - 80),
                  y: height * 0.4 + Math.random() * (height * 0.35),
                  radius: 30 + lvl * 8,
                  damage: dmg,
                  durationFrames: 180 + lvl * 40,
                  color: '#a3e635'
                });
              } else if (def.id === 'vortex_gravity' && monsters.length > 0) {
                groundEffectsRef.current.push({
                  id: Math.random().toString(),
                  type: 'vortex',
                  x: width / 2 + (Math.random() - 0.5) * 120,
                  y: height * 0.45,
                  radius: 45 + lvl * 10,
                  damage: dmg,
                  durationFrames: 120,
                  color: '#a855f7'
                });
                audioRef.current.playShot(180, 0.4, 'sawtooth');
              } else if (def.id === 'cluster_bombs' && closestMonster) {
                const angle = Math.atan2(closestMonster.y - heroY, closestMonster.x - heroX);
                projectilesRef.current.push({
                  x: heroX,
                  y: heroY - 15,
                  vx: Math.cos(angle) * 7,
                  vy: Math.sin(angle) * 7,
                  radius: 11,
                  damage: dmg,
                  color: '#f97316',
                  pierce: 1,
                  life: 45,
                  isCluster: true,
                  tail: []
                });
                audioRef.current.playShot(320, 0.15);
              } else if (def.id === 'holy_ballista' && closestMonster) {
                projectilesRef.current.push({
                  x: closestMonster.x,
                  y: heroY - 20,
                  vx: 0,
                  vy: -14,
                  radius: 10,
                  damage: dmg,
                  color: '#fef08a',
                  pierce: 99,
                  life: 60,
                  tail: []
                });
                audioRef.current.playShot(720, 0.12, 'sawtooth');
              } else if (def.id === 'oxygen_cyclone') {
                monsters.forEach((m) => {
                  if (m.y > height * 0.3) {
                    m.y = Math.max(0, m.y - (40 + lvl * 15));
                    m.hp -= dmg;
                    floatingTextsRef.current.push({
                      x: m.x,
                      y: m.y,
                      text: `🌪️ -${dmg}`,
                      color: '#67e8f9',
                      alpha: 1,
                      vy: -2
                    });
                  }
                });
                audioRef.current.playShot(300, 0.25, 'sine');
              } else if (def.id === 'emp_pulse') {
                monsters.forEach((m) => {
                  m.stunFrames = 90 + lvl * 25;
                  m.hp -= dmg;
                });
                audioRef.current.playZap();
              } else if (def.id === 'titan_hammer') {
                monsters.forEach((m) => {
                  m.hp -= dmg;
                  m.stunFrames = 45;
                });
                audioRef.current.playBoom();
              } else if (def.id === 'atomic_detox') {
                monsters.forEach((m) => {
                  m.hp -= dmg;
                  floatingTextsRef.current.push({
                    x: m.x,
                    y: m.y - 15,
                    text: `💥 -${dmg}`,
                    color: '#4ade80',
                    alpha: 1,
                    vy: -2.5
                  });
                });
                audioRef.current.playBoom();
              } else if (def.id === 'prism_ricochet') {
                projectilesRef.current.push({
                  x: heroX,
                  y: heroY - 15,
                  vx: (Math.random() - 0.5) * 10,
                  vy: -8,
                  radius: 8,
                  damage: dmg,
                  color: '#ec4899',
                  pierce: 8 + lvl * 2,
                  bounces: 6 + lvl,
                  life: 200,
                  tail: []
                });
                audioRef.current.playShot(650, 0.1);
              }
            }

            // Draw Persistent / Passive Weapons (Blades, Drones, Lasers)
            if (def.id === 'spinning_blades') {
              const count = 2 + lvl;
              const radius = 60 + lvl * 10;
              for (let b = 0; b < count; b++) {
                const angle = bladesAngleRef.current + (b * (Math.PI * 2)) / count;
                const bx = heroX + Math.cos(angle) * radius;
                const by = heroY - 20 + Math.sin(angle) * (radius * 0.45);

                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(bladesAngleRef.current * 4);
                ctx.fillStyle = '#cbd5e1';
                ctx.fillRect(-10, -3, 20, 6);
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Blade collision
                monsters.forEach((m) => {
                  if (Math.hypot(m.x - bx, m.y - by) < 18) {
                    m.hp -= dmg * 0.2;
                  }
                });
              }
            } else if (def.id === 'cleaner_drones') {
              const droneCount = 2;
              for (let d = 0; d < droneCount; d++) {
                const dAngle = droneAngleRef.current + d * Math.PI;
                const dx = heroX + Math.cos(dAngle) * 90;
                const dy = height * 0.45 + Math.sin(dAngle) * 40;

                ctx.fillStyle = '#22d3ee';
                ctx.beginPath();
                ctx.arc(dx, dy, 7, 0, Math.PI * 2);
                ctx.fill();

                if (closestMonster) {
                  ctx.strokeStyle = '#22d3ee';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.moveTo(dx, dy);
                  ctx.lineTo(closestMonster.x, closestMonster.y);
                  ctx.stroke();
                  closestMonster.hp -= dmg * 0.08;
                }
              }
            } else if (def.id === 'solar_laser' && closestMonster) {
              ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
              ctx.lineWidth = 4 + lvl;
              ctx.shadowColor = '#f59e0b';
              ctx.shadowBlur = 12;
              ctx.beginPath();
              ctx.moveTo(heroX, heroY - 20);
              ctx.lineTo(closestMonster.x, closestMonster.y);
              ctx.stroke();
              ctx.shadowBlur = 0;
              closestMonster.hp -= dmg * 0.15;
            }
          });

          // ---------------------------------------------------------
          // UPDATE & DRAW GROUND EFFECTS
          // ---------------------------------------------------------
          for (let g = groundEffectsRef.current.length - 1; g >= 0; g--) {
            const ge = groundEffectsRef.current[g];
            ge.durationFrames -= gameSpeed;

            ctx.save();
            ctx.fillStyle = ge.color;
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.arc(ge.x, ge.y, ge.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = ge.color;
            ctx.globalAlpha = 0.8;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // Damage monsters inside
            monsters.forEach((m) => {
              const dist = Math.hypot(m.x - ge.x, m.y - ge.y);
              if (dist < ge.radius) {
                m.hp -= ge.damage * 0.05 * gameSpeed;
                if (ge.type === 'vortex') {
                  m.x += (ge.x - m.x) * 0.05;
                  m.y += (ge.y - m.y) * 0.05;
                }
              }
            });

            if (ge.durationFrames <= 0) {
              groundEffectsRef.current.splice(g, 1);
            }
          }

          // ---------------------------------------------------------
          // UPDATE & DRAW PROJECTILES
          // ---------------------------------------------------------
          for (let p = projectilesRef.current.length - 1; p >= 0; p--) {
            const proj = projectilesRef.current[p];
            proj.x += proj.vx * gameSpeed;
            proj.y += proj.vy * gameSpeed;
            proj.life -= gameSpeed;

            // Bounce for Prism
            if (proj.bounces && proj.bounces > 0) {
              if (proj.x < 15 || proj.x > width - 15) {
                proj.vx *= -1;
                proj.bounces--;
              }
              if (proj.y < 15 || proj.y > defenseY - 10) {
                proj.vy *= -1;
                proj.bounces--;
              }
            }

            // Draw projectile core & glow
            ctx.save();
            ctx.fillStyle = proj.color;
            ctx.shadowColor = proj.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Check collision with monsters
            let hit = false;
            for (let m = monsters.length - 1; m >= 0; m--) {
              const target = monsters[m];
              const dist = Math.hypot(proj.x - target.x, proj.y - target.y);
              if (dist < proj.radius + target.width * 0.6) {
                hit = true;
                target.hp -= proj.damage;
                proj.pierce--;

                floatingTextsRef.current.push({
                  x: target.x,
                  y: target.y - 12,
                  text: `-${Math.round(proj.damage)}`,
                  color: proj.color,
                  alpha: 1,
                  vy: -1.8
                });

                // Spawn spark particles
                for (let k = 0; k < 6; k++) {
                  particlesRef.current.push({
                    x: proj.x,
                    y: proj.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    radius: 2 + Math.random() * 3,
                    color: proj.color,
                    alpha: 1,
                    decay: 0.04
                  });
                }

                // If cluster bomb, explode into mini fragments
                if (proj.isCluster) {
                  for (let c = 0; c < 6; c++) {
                    const cAngle = (c / 6) * Math.PI * 2;
                    projectilesRef.current.push({
                      x: proj.x,
                      y: proj.y,
                      vx: Math.cos(cAngle) * 6,
                      vy: Math.sin(cAngle) * 6,
                      radius: 5,
                      damage: proj.damage * 0.4,
                      color: '#fbbf24',
                      pierce: 1,
                      life: 30,
                      tail: []
                    });
                  }
                }

                if (proj.pierce <= 0) break;
              }
            }

            if (proj.life <= 0 || proj.pierce <= 0 || proj.y < -30 || proj.y > height + 30) {
              projectilesRef.current.splice(p, 1);
            }
          }

          // ---------------------------------------------------------
          // UPDATE & DRAW CRAWLING CIGARETTE MONSTERS
          // ---------------------------------------------------------
          for (let m = monsters.length - 1; m >= 0; m--) {
            const mon = monsters[m];

            // Crawl movement downwards
            if (mon.stunFrames > 0) {
              mon.stunFrames -= gameSpeed;
            } else {
              mon.crawlPhase += 0.08 * gameSpeed;
              mon.y += mon.speed * mon.slowFactor * gameSpeed;
              // Slight undulating horizontal wiggle while crawling
              mon.x += Math.sin(mon.crawlPhase) * 0.6 * gameSpeed;
            }
            mon.slowFactor = Math.min(1, mon.slowFactor + 0.01);

            // 1. Monster Death Check -> Gives Points & triggers 10 pts upgrade!
            if (mon.hp <= 0) {
              audioRef.current.playShot(200, 0.15);
              const earnedPts = mon.type === 'cigar_boss' ? 5 : mon.type === 'filter_heavy' ? 2 : 1;

              scoreRef.current += earnedPts;
              setScore(scoreRef.current);
              setTotalCigarettesDefeated((prev) => prev + 1);

              if (scoreRef.current > highScore) {
                setHighScore(scoreRef.current);
                try {
                  localStorage.setItem('quit-smoking:td-highscore', String(scoreRef.current));
                } catch {}
              }

              // Ash dissolution particles
              for (let pIdx = 0; pIdx < 16; pIdx++) {
                particlesRef.current.push({
                  x: mon.x + (Math.random() - 0.5) * mon.width,
                  y: mon.y + (Math.random() - 0.5) * mon.height,
                  vx: (Math.random() - 0.5) * 3,
                  vy: -1 - Math.random() * 2,
                  radius: 2 + Math.random() * 3,
                  color: '#78716c',
                  alpha: 1,
                  decay: 0.03
                });
              }

              floatingTextsRef.current.push({
                x: mon.x,
                y: mon.y - 15,
                text: `+${earnedPts} ПОПІЛ! 💨`,
                color: '#4ade80',
                alpha: 1,
                vy: -2
              });

              monsters.splice(m, 1);

              // CHECK 10 POINTS UPGRADE THRESHOLD
              if (scoreRef.current >= nextUpgradeScoreRef.current) {
                triggerUpgradeChoice();
                return;
              }

              continue;
            }

            // 2. Reached Defense Wall -> Damages Base
            if (mon.y >= defenseY - mon.height * 0.4) {
              const wallDmg = mon.type === 'cigar_boss' ? 30 : mon.type === 'filter_heavy' ? 12 : 6;
              baseHpRef.current = Math.max(0, baseHpRef.current - wallDmg);
              setBaseHp(baseHpRef.current);
              audioRef.current.playDefeat();

              floatingTextsRef.current.push({
                x: mon.x,
                y: defenseY - 20,
                text: `-${wallDmg} ТЮТЮНОВИЙ УДАР!`,
                color: '#ef4444',
                alpha: 1,
                vy: -2.5
              });

              monsters.splice(m, 1);

              if (baseHpRef.current <= 0) {
                setGameState('GAME_OVER');
                return;
              }
              continue;
            }

            // ---------------------------------------------------------
            // DRAW PROCEDURAL CRAWLING CIGARETTE MONSTER
            // ---------------------------------------------------------
            ctx.save();
            ctx.translate(mon.x, mon.y);

            // Small shadow underneath
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(0, mon.height * 0.4, mon.width * 0.6, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // HP Bar
            const barW = mon.width + 10;
            const barH = 4;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(-barW / 2, -mon.height / 2 - 10, barW, barH);
            const hpPct = Math.max(0, mon.hp / mon.maxHp);
            ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.2 ? '#eab308' : '#ef4444';
            ctx.fillRect(-barW / 2, -mon.height / 2 - 10, barW * hpPct, barH);

            const w2 = mon.width / 2;
            const h2 = mon.height / 2;

            if (mon.type === 'cigar_boss') {
              // Giant Cigar Boss
              ctx.fillStyle = '#451a03';
              ctx.beginPath();
              ctx.roundRect(-w2, -h2, mon.width, mon.height, 8);
              ctx.fill();

              // Gold ring band
              ctx.fillStyle = '#d97706';
              ctx.fillRect(-w2, -h2 + 20, mon.width, 12);
              ctx.fillStyle = '#fef08a';
              ctx.font = 'bold 8px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('БОС', 0, -h2 + 29);
            } else {
              // White Paper Tube
              ctx.fillStyle = mon.type === 'filter_heavy' ? '#78716c' : mon.type === 'slim' ? '#d1fae5' : '#f5f5f4';
              ctx.fillRect(-w2, -h2 + 12, mon.width, mon.height - 12);

              // Orange Filter Butt at bottom
              ctx.fillStyle = '#d97706';
              ctx.fillRect(-w2, h2 - 12, mon.width, 12);

              // Top glowing ember (crawling head)
              const emberGrad = ctx.createRadialGradient(0, -h2 + 6, 1, 0, -h2 + 6, w2 + 2);
              emberGrad.addColorStop(0, '#ffffff');
              emberGrad.addColorStop(0.4, '#f97316');
              emberGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
              ctx.fillStyle = emberGrad;
              ctx.beginPath();
              ctx.arc(0, -h2 + 6, w2 + 2, 0, Math.PI * 2);
              ctx.fill();

              // Evil Eyes
              ctx.fillStyle = '#dc2626';
              ctx.beginPath();
              ctx.arc(-w2 + 5, -h2 + 22, 2.5, 0, Math.PI * 2);
              ctx.arc(w2 - 5, -h2 + 22, 2.5, 0, Math.PI * 2);
              ctx.fill();

              // Crawling feet / ash wiggles
              const legWiggle = Math.sin(mon.crawlPhase * 2) * 4;
              ctx.strokeStyle = '#57534e';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(-w2, -h2 + 25);
              ctx.lineTo(-w2 - 4, -h2 + 25 + legWiggle);
              ctx.moveTo(w2, -h2 + 25);
              ctx.lineTo(w2 + 4, -h2 + 25 - legWiggle);
              ctx.stroke();
            }

            ctx.restore();
          }

          // ---------------------------------------------------------
          // DRAW PARTICLES & FLOATING TEXTS
          // ---------------------------------------------------------
          for (let p = particlesRef.current.length - 1; p >= 0; p--) {
            const part = particlesRef.current[p];
            part.x += part.vx * gameSpeed;
            part.y += part.vy * gameSpeed;
            part.alpha -= part.decay * gameSpeed;

            if (part.alpha <= 0) {
              particlesRef.current.splice(p, 1);
              continue;
            }

            ctx.save();
            ctx.globalAlpha = part.alpha;
            ctx.fillStyle = part.color;
            ctx.beginPath();
            ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          for (let f = floatingTextsRef.current.length - 1; f >= 0; f--) {
            const ft = floatingTextsRef.current[f];
            ft.y += ft.vy * gameSpeed;
            ft.alpha -= 0.02 * gameSpeed;

            if (ft.alpha <= 0) {
              floatingTextsRef.current.splice(f, 1);
              continue;
            }

            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
          }

          // ---------------------------------------------------------
          // DRAW DEFENDER HERO IN CENTER
          // ---------------------------------------------------------
          ctx.save();
          ctx.translate(heroX, heroY);

          // Aura halo
          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.fill();

          // Robe / Tower Guardian
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(-16, 14);
          ctx.lineTo(16, 14);
          ctx.lineTo(10, -12);
          ctx.lineTo(-10, -12);
          ctx.closePath();
          ctx.fill();

          // Gold emblem
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, -2, 5, 0, Math.PI * 2);
          ctx.fill();

          // Hood Head
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(0, -15, 10, 0, Math.PI * 2);
          ctx.fill();

          // Glowing Pure Breath Eyes
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(-3, -15, 2, 0, Math.PI * 2);
          ctx.arc(3, -15, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, gameSpeed, highScore]);

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto select-none relative overflow-hidden bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-30">
        <button
          type="button"
          onClick={() => onSwitchTab('counter')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {/* Score & Next Upgrade Tracker */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Очки</span>
            <span className="text-sm font-black text-amber-400 tabular-nums">{score}</span>
          </div>

          <div className="flex flex-col items-center bg-slate-800/60 px-2.5 py-0.5 rounded-lg border border-slate-700/60">
            <span className="text-[8px] text-emerald-400 uppercase tracking-wider font-bold">Апгрейд через</span>
            <span className="text-xs font-black text-emerald-300 tabular-nums">
              {Math.max(0, nextUpgradeScoreRef.current - score)} оч
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Speed Toggle 1x / 2x */}
          <button
            type="button"
            onClick={() => setGameSpeed((prev) => (prev === 1 ? 1.5 : 1))}
            className={`px-2 py-1 rounded-xl text-xs font-black cursor-pointer transition-all ${
              gameSpeed > 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
            title="Швидкість гри"
          >
            {gameSpeed}x
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all active:scale-95"
            title={soundEnabled ? 'Вимкнути звук' : 'Увімкнути звук'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {gameState === 'PLAYING' && (
            <button
              type="button"
              onClick={() => setGameState('PAUSED')}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all active:scale-95"
              title="Пауза"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Active Weapons Arsenal Ribbon (Visual Icons of currently active destruction tools) */}
      <div className="bg-slate-900/95 border-b border-slate-800/80 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-20">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Swords className="w-3 h-3 text-amber-400" />
          <span>Зброя ({activeWeapons.length}):</span>
        </span>
        {activeWeapons.map((aw) => {
          const def = WEAPON_REGISTRY.find((w) => w.id === aw.id);
          if (!def) return null;
          return (
            <div
              key={aw.id}
              className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/80 shrink-0 text-xs"
              title={`${def.name} (Рівень ${aw.level}) - ${def.desc}`}
            >
              <span>{def.icon}</span>
              <span className="font-bold text-[10px] text-slate-200">{def.name.split(' ')[0]}</span>
              <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/20 px-1 rounded">
                L{aw.level}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative w-full h-[520px] touch-none">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Fortress Health Bar Overlay */}
        {gameState === 'PLAYING' && (
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-2xl border border-slate-700">
              <Shield className="w-4 h-4 text-sky-400" />
              <div className="flex flex-col">
                <div className="w-32 sm:w-44 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
                    style={{ width: `${Math.max(0, (baseHp / maxBaseHp) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-300 font-mono mt-0.5">
                  Міцність Фортеці: {baseHp}/{maxBaseHp} HP
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[10px] text-slate-300 font-semibold">
              Хвиля: <span className="text-amber-400 font-bold">{waveCount}</span>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* TITLE MENU */}
        {/* -------------------------------------------------------- */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-3xl mb-3 shadow-xl shadow-orange-500/25 border border-orange-400/40">
              🏰
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 mb-1">
              Тютюнова Оборона (Tower Defence)
            </h2>

            <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
              Монстри-цигарки повзуть суцільною навалою! Герой стріляє автоматично. Кожні 10 очок відкривають нові засоби знищення з арсеналу у 20+ видів зброї!
            </p>

            <div className="w-full max-w-xs bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 mb-5 text-left text-xs space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2">
                <span>🤖</span>
                <span><b>Авто-атака:</b> Герой сам націлює та застосовує весь арсенал</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span><b>Кожні 10 очок:</b> Вибір з 3 нових зброй та поліпшень</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🪓</span>
                <span><b>20+ видів зброї:</b> Блискавки, пили, кислота, дрони, метеори</span>
              </div>
            </div>

            <button
              type="button"
              onClick={startNewGame}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/25 hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Почати оборону</span>
            </button>

            {highScore > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                <Trophy className="w-3.5 h-3.5" />
                <span>Рекорд: {highScore} очок</span>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* UPGRADE SELECTION MODAL (EVERY 10 POINTS) */}
        {/* -------------------------------------------------------- */}
        {gameState === 'UPGRADE_MODAL' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Рубіж {score} очок подолано!</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mb-3">Оберіть нову зброю або посилення</h3>

            <div className="w-full max-w-sm space-y-2.5 mb-2">
              {upgradeChoices.map((choice, idx) => (
                <button
                  key={`${choice.weaponId}_${idx}`}
                  type="button"
                  onClick={() => handleSelectUpgrade(choice)}
                  className="w-full p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/60 flex items-center gap-3 text-left transition-all cursor-pointer active:scale-98 group shadow-lg"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">
                    {choice.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {choice.name}
                      </h4>
                      {choice.isNew && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase">
                          Нова
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight font-normal line-clamp-2">
                      {choice.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* PAUSED OVERLAY */}
        {/* -------------------------------------------------------- */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <h3 className="text-2xl font-black text-white mb-2">Оборону призупинено</h3>
            <p className="text-xs text-slate-400 mb-6">Монстри застигли на підході</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setGameState('PLAYING')}
                className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm cursor-pointer hover:bg-amber-400 active:scale-95 transition-all"
              >
                Продовжити битву
              </button>
              <button
                type="button"
                onClick={startNewGame}
                className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-sm cursor-pointer hover:bg-slate-700 active:scale-95 transition-all"
              >
                Почати знову
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* GAME OVER OVERLAY */}
        {/* -------------------------------------------------------- */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-3xl mb-3">
              💀
            </div>
            <h3 className="text-2xl font-black text-red-400 mb-1">Стіну прорвано!</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Навала тютюнових монстрів подолала укріплення. Прокачуйте новий арсенал для повної перемоги!
            </p>

            <div className="w-full max-w-xs bg-slate-900 rounded-2xl border border-slate-800 p-3.5 mb-5 grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Очки</span>
                <span className="text-lg font-black text-amber-400">{score}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Знищено сигарет</span>
                <span className="text-lg font-black text-emerald-400">{totalCigarettesDefeated}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={startNewGame}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/25 hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Спробувати ще раз</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
