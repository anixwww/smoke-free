import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Trees,
  Wind,
  Sun,
  Building,
  Sparkles,
  Droplets,
  Award,
  Plus,
  Coins,
  Heart,
  TrendingUp,
  Clock
} from 'lucide-react';
import { MoneySettings } from '../types';

interface EcoCityTabProps {
  onSwitchTab: (tab: any) => void;
  totalSaved?: number;
  cigsAvoided?: number;
  totalFreeMs?: number;
}

interface BuildingType {
  id: string;
  name: string;
  category: 'nature' | 'energy' | 'wellness' | 'culture';
  icon: string;
  cost: number;
  oxygenPerHour: number;
  vitalityBonus: number;
  desc: string;
  level: number;
  maxLevel: number;
}

const INITIAL_BUILDINGS: BuildingType[] = [
  {
    id: 'botanical_park',
    name: 'Ботанічний Парк Кисню',
    category: 'nature',
    icon: '🌲',
    cost: 150,
    oxygenPerHour: 25,
    vitalityBonus: 10,
    desc: 'Вічнозелені хвойні та листяні алеї, що щомиті виробляють чистий кисень для міста.',
    level: 1,
    maxLevel: 10
  },
  {
    id: 'wind_turbine',
    name: 'Вітряна Турбіна Свіжості',
    category: 'energy',
    icon: '💨',
    cost: 350,
    oxygenPerHour: 45,
    vitalityBonus: 18,
    desc: 'Генератор чистої енергії вітру, що розганяє будь-який дим та пил.',
    level: 0,
    maxLevel: 10
  },
  {
    id: 'crystal_fountain',
    name: 'Фонтан Живої Енергії',
    category: 'wellness',
    icon: '⛲',
    cost: 600,
    oxygenPerHour: 70,
    vitalityBonus: 30,
    desc: 'Каскадні струмені кришталевої води для бадьорості, зволоження та релаксації містян.',
    level: 0,
    maxLevel: 10
  },
  {
    id: 'bike_boulevard',
    name: 'Велосипедний Еко-Бульвар',
    category: 'culture',
    icon: '🚲',
    cost: 1000,
    oxygenPerHour: 110,
    vitalityBonus: 50,
    desc: 'Широкі квітучі алеї для спорту, пробіжок та чистого руху без вихлопів.',
    level: 0,
    maxLevel: 10
  },
  {
    id: 'solar_tower',
    name: 'Сонячна Вежа Світла',
    category: 'energy',
    icon: '☀️',
    cost: 1800,
    oxygenPerHour: 180,
    vitalityBonus: 85,
    desc: 'Кристалічний хмарочос із сонячними батареями, що освітлює зелені сади вночі.',
    level: 0,
    maxLevel: 10
  },
  {
    id: 'zen_sanctuary',
    name: 'Храм Глибокого Дихання',
    category: 'wellness',
    icon: '🏛️',
    cost: 3000,
    oxygenPerHour: 320,
    vitalityBonus: 150,
    desc: 'Святилище медитації та усвідомленості, де кожен подих сповнений гармонією.',
    level: 0,
    maxLevel: 10
  }
];

export const EcoCityTab: React.FC<EcoCityTabProps> = ({
  onSwitchTab,
  totalSaved = 1200,
  cigsAvoided = 180,
  totalFreeMs = 0
}) => {
  const [cityBudget, setCityBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:eco-budget');
      return saved ? Number(saved) : Math.max(200, Math.round(totalSaved));
    } catch {
      return Math.max(200, Math.round(totalSaved));
    }
  });

  const [buildings, setBuildings] = useState<BuildingType[]>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:eco-buildings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BUILDINGS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('quit-smoking:eco-buildings', JSON.stringify(buildings));
      localStorage.setItem('quit-smoking:eco-budget', String(cityBudget));
    } catch {}
  }, [buildings, cityBudget]);

  // Total City Metrics
  const totalOxygen = buildings.reduce((sum, b) => sum + b.oxygenPerHour * b.level, 0);
  const totalVitality = buildings.reduce((sum, b) => sum + b.vitalityBonus * b.level, 0);
  const totalPopulation = 100 + totalVitality * 12;

  // Periodic Eco-Budget Generation based on clean air
  useEffect(() => {
    const interval = setInterval(() => {
      if (totalOxygen > 0) {
        const bonus = Math.max(1, Math.floor(totalOxygen * 0.05));
        setCityBudget((prev) => prev + bonus);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [totalOxygen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Build / Upgrade Handler
  const handleUpgrade = (buildingId: string) => {
    const b = buildings.find((item) => item.id === buildingId);
    if (!b) return;

    const cost = Math.round(b.cost * Math.pow(1.4, b.level));
    if (cityBudget < cost) {
      showToast(`Недостатньо еко-бюджету (потрібно ${cost} ₴)`);
      return;
    }

    setCityBudget((prev) => prev - cost);
    setBuildings((prev) =>
      prev.map((item) => (item.id === buildingId ? { ...item, level: item.level + 1 } : item))
    );
    showToast(`«${b.name}» покращено до ${b.level + 1} рівня! 🌟`);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto select-none relative overflow-hidden bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl pb-6">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-30">
        <button
          type="button"
          onClick={() => onSwitchTab('counter')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {/* Eco Budget */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700 text-xs">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-black text-amber-300 tabular-nums">{cityBudget.toLocaleString()} ₴</span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all active:scale-95"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </header>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-emerald-600/95 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl z-50 animate-fade-in flex items-center gap-1.5 border border-emerald-400/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* City Skyline Panorama Banner */}
      <div className="relative w-full h-44 bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 p-4 flex flex-col justify-between overflow-hidden border-b border-slate-800">
        {/* Sun / Moon & Clouds */}
        <div className="absolute top-3 right-6 w-10 h-10 rounded-full bg-amber-400/20 blur-sm flex items-center justify-center">
          <Sun className="w-7 h-7 text-amber-300" />
        </div>

        {/* City Stats Bar */}
        <div className="grid grid-cols-3 gap-2 z-10">
          <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[9px] text-slate-400 block uppercase font-mono">Кисень О₂</span>
            <span className="text-xs font-black text-cyan-300">+{totalOxygen} л/год</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[9px] text-slate-400 block uppercase font-mono">Життєвість</span>
            <span className="text-xs font-black text-emerald-300">{totalVitality} еко-балів</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[9px] text-slate-400 block uppercase font-mono">Мешканці</span>
            <span className="text-xs font-black text-amber-300">{totalPopulation}</span>
          </div>
        </div>

        {/* Isometric City Vector Skyline */}
        <div className="flex items-end justify-center gap-3 z-10 mt-auto">
          {buildings
            .filter((b) => b.level > 0)
            .map((b) => (
              <div key={b.id} className="flex flex-col items-center animate-bounce-short">
                <span className="text-2xl drop-shadow-md">{b.icon}</span>
                <span className="text-[8px] font-mono text-slate-400">L{b.level}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Building Catalog & Upgrades */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-none">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
          <span>Екологічна інфраструктура міста:</span>
          <span>{buildings.filter((b) => b.level > 0).length}/{buildings.length} збудовано</span>
        </div>

        {buildings.map((b) => {
          const cost = Math.round(b.cost * Math.pow(1.4, b.level));
          const canAfford = cityBudget >= cost;
          const isBuilt = b.level > 0;

          return (
            <div
              key={b.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                isBuilt
                  ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                  : 'bg-slate-950/80 border-slate-850 opacity-80'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-2xl shrink-0">
                {b.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{b.name}</h4>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                    L{b.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight line-clamp-2">{b.desc}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-300 font-mono">
                  <span className="text-cyan-400">+{b.oxygenPerHour * (b.level || 1)} О₂</span>
                  <span className="text-emerald-400">+{b.vitalityBonus * (b.level || 1)} Життєвості</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUpgrade(b.id)}
                className={`px-3 py-2 rounded-xl font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer shrink-0 transition-all active:scale-95 shadow-md ${
                  canAfford
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-110 shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{isBuilt ? 'Покращити' : 'Збудувати'}</span>
                <span className="font-mono text-[10px] opacity-90">{cost} ₴</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
