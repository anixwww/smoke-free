import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ForestTree, TreeSpeciesId, CurrentTree } from '../types';
import { TREE_SPECIES } from '../data/treeSpecies';
import { MoonPhaseData } from './TreeTab';
import {
  ArrowLeft,
  Check,
  X
} from 'lucide-react';

interface CozyForestModalProps {
  isOpen: boolean;
  onClose: () => void;
  forest: ForestTree[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  availableSeeds?: number;
  cigsAvoided?: number;
  currentTree?: CurrentTree | null;
  moonData?: MoonPhaseData;
  onPlantSeed?: (speciesId: TreeSpeciesId) => void;
}

interface ForestFirefly {
  id: number;
  x: number;
  y: number;
  r: number;
  alpha: number;
  vx: number;
  vy: number;
  phase: number;
}

interface FallingPetal {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  vx: number;
  vy: number;
  phase: number;
}

// Generate SVG path for astronomical moon phase
const getMoonSvgData = (cx: number, cy: number, r: number, phase: number = 0.5) => {
  const normPhase = ((phase % 1) + 1) % 1;
  const isWaxing = normPhase < 0.5;
  const k = Math.cos(2 * Math.PI * normPhase);
  const rx = Math.max(0.1, Math.abs(k) * r);

  if (normPhase < 0.02 || normPhase > 0.98) {
    return { isFull: false, isNew: true, path: '' };
  }
  if (normPhase >= 0.48 && normPhase <= 0.52) {
    return { isFull: true, isNew: false, path: '' };
  }

  if (isWaxing) {
    // Lit side is right
    const sweep = k < 0 ? 1 : 0;
    const path = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;
    return { isFull: false, isNew: false, path };
  } else {
    // Lit side is left
    const sweep = k < 0 ? 0 : 1;
    const path = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;
    return { isFull: false, isNew: false, path };
  }
};

export const CozyForestModal: React.FC<CozyForestModalProps> = ({
  isOpen,
  onClose,
  forest,
  availableSeeds = 0,
  cigsAvoided = 0,
  currentTree = null,
  moonData,
  onPlantSeed
}) => {
  const [modalTab, setModalTab] = useState<'forest' | 'seeds'>('forest');
  const [time, setTime] = useState(0);
  const [selectedTree, setSelectedTree] = useState<ForestTree | null>(null);
  const [windStrength] = useState<number>(1.0);
  const [fireflies, setFireflies] = useState<ForestFirefly[]>([]);
  const [petals, setPetals] = useState<FallingPetal[]>([]);
  const rafRef = useRef<number | null>(null);

  // Progress to next seed (300 cigs avoided per seed)
  const progressToNextSeed = cigsAvoided % 300;

  // Initialize atmospheric particles
  useEffect(() => {
    if (!isOpen) return;

    const newFireflies: ForestFirefly[] = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: Math.random() * 800,
      y: 100 + Math.random() * 450,
      r: 1.2 + Math.random() * 2.2,
      alpha: 0.25 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.15 - Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2
    }));
    setFireflies(newFireflies);

    const PETAL_COLORS = ['#F472B6', '#FBBF24', '#34D399', '#A7F3D0', '#FDE68A'];
    const newPetals: FallingPetal[] = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 850,
      y: Math.random() * 550,
      size: 3 + Math.random() * 4.5,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 60,
      vx: 0.8 + Math.random() * 1.5,
      vy: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2
    }));
    setPetals(newPetals);

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = Math.min(0.033, (now - lastTime) * 0.001);
      lastTime = now;

      setTime((prev) => prev + dt);

      setFireflies((prev) =>
        prev.map((f) => {
          let nx = f.x + f.vx * 20 * dt + Math.sin(now * 0.001 + f.phase) * 0.3;
          let ny = f.y + f.vy * 20 * dt + Math.cos(now * 0.0012 + f.phase) * 0.25;
          if (nx < -20) nx = 820;
          if (nx > 820) nx = -20;
          if (ny < 80) ny = 560;
          if (ny > 570) ny = 90;
          return { ...f, x: nx, y: ny };
        })
      );

      setPetals((prev) =>
        prev.map((p) => {
          let nx = p.x + (p.vx * 28 + Math.sin(now * 0.0015 + p.phase) * 15) * dt;
          let ny = p.y + (p.vy * 22 + Math.cos(now * 0.001 + p.phase) * 6) * dt;
          let nRot = p.rotation + p.rotSpeed * dt;
          if (nx > 840) nx = -20;
          if (ny > 580) {
            ny = -10;
            nx = Math.random() * 800;
          }
          return { ...p, x: nx, y: ny, rotation: nRot };
        })
      );

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen]);

  const arrangedTrees = useMemo(() => {
    if (!forest || forest.length === 0) return [];
    return forest.map((tree, idx) => {
      const total = forest.length;
      const hash = tree.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const layer = idx % 3;
      const baseX = total === 1 ? 400 : 90 + ((idx + 0.5) / total) * 620 + ((hash % 40) - 20);
      const baseY = layer === 0 ? 370 + (hash % 20) : layer === 1 ? 415 + (hash % 25) : 465 + (hash % 30);
      const scale = layer === 0 ? 0.65 : layer === 1 ? 0.85 : 1.08;
      const swayOffset = (hash % 100) * 0.1;
      const swaySpeed = 0.8 + ((hash % 10) / 10) * 0.5;

      return {
        tree,
        x: Math.max(70, Math.min(730, baseX)),
        y: baseY,
        scale,
        layer,
        swayOffset,
        swaySpeed
      };
    });
  }, [forest]);

  if (!isOpen) return null;

  const currentMoonPhase = moonData?.phase ?? 0.5;
  const moonSvg = getMoonSvgData(400, 130, 26, currentMoonPhase);

  const renderCozyTree = (t: any) => {
    const spec = TREE_SPECIES[t.tree.speciesId as TreeSpeciesId] || TREE_SPECIES.oak;
    const swayAngle = Math.sin(time * t.swaySpeed * windStrength + t.swayOffset) * 2.5;
    const spId = t.tree.speciesId as TreeSpeciesId;

    return (
      <g
        key={t.tree.id}
        transform={`translate(${t.x}, ${t.y}) scale(${t.scale})`}
        className="cursor-pointer transition-transform hover:opacity-95"
        onClick={() => setSelectedTree(t.tree)}
      >
        <ellipse cx="0" cy="8" rx={24 * t.scale} ry={6 * t.scale} fill="rgba(0,0,0,0.3)" />
        <g transform={`rotate(${swayAngle} 0 0)`}>
          {/* Main trunk */}
          <path
            d="M-4,0 Q-3,-40 -1,-70 Q1,-40 4,0 Z"
            fill={spec.trunkColor || '#5C381E'}
          />

          {spId === 'pine' ? (
            /* Pine: Tiered layered pagoda conifer */
            <g>
              <polygon points="0,-125 -22,-85 22,-85" fill={spec.leafColor || '#1B6B45'} opacity="0.95" />
              <polygon points="0,-95 -28,-60 28,-60" fill={spec.leafColor || '#1B6B45'} opacity="0.9" />
              <polygon points="0,-70 -34,-35 34,-35" fill={spec.leafColor || '#1B6B45'} opacity="0.88" />
            </g>
          ) : spId === 'sakura' ? (
            /* Sakura: Weeping graceful pink blossom clouds */
            <g>
              <path d="M-1,-70 Q-15,-95 -28,-75 Q-20,-60 -2,-65" fill={spec.trunkColor || '#4A2E2B'} />
              <path d="M1,-70 Q16,-95 28,-75 Q20,-60 2,-65" fill={spec.trunkColor || '#4A2E2B'} />
              <circle cx="-16" cy="-86" r="22" fill="#F4A3C2" opacity="0.88" />
              <circle cx="16" cy="-86" r="22" fill="#FDA4AF" opacity="0.88" />
              <circle cx="0" cy="-96" r="24" fill="#F4A3C2" opacity="0.95" />
              <circle cx="-2" cy="-96" r="4" fill="#DB2777" opacity="0.8" />
            </g>
          ) : spId === 'apple' ? (
            /* Apple Tree: Rounded orchard crown with red apples */
            <g>
              <circle cx="0" cy="-78" r="32" fill={spec.leafColor || '#369A5D'} opacity="0.92" />
              <circle cx="-14" cy="-82" r="22" fill={spec.leafColor || '#369A5D'} opacity="0.9" />
              <circle cx="14" cy="-82" r="22" fill={spec.leafColor || '#369A5D'} opacity="0.9" />
              <circle cx="-10" cy="-74" r="3" fill="#DC2626" />
              <circle cx="8" cy="-70" r="3.2" fill="#DC2626" />
              <circle cx="-2" cy="-88" r="3" fill="#DC2626" />
            </g>
          ) : spId === 'maple' ? (
            /* Maple: Golden-amber fan crown */
            <g>
              <ellipse cx="0" cy="-82" rx="36" ry="30" fill={spec.leafColor || '#E68A2E'} opacity="0.95" />
              <ellipse cx="-16" cy="-74" rx="20" ry="18" fill="#F59E0B" opacity="0.9" />
              <ellipse cx="16" cy="-74" rx="20" ry="18" fill="#F59E0B" opacity="0.9" />
              <ellipse cx="0" cy="-96" rx="22" ry="18" fill="#D97706" opacity="0.9" />
            </g>
          ) : (
            /* Oak: Mighty broad horizontal dome */
            <g>
              <ellipse cx="0" cy="-80" rx="38" ry="28" fill={spec.leafColor || '#2D8055'} opacity="0.95" />
              <ellipse cx="-20" cy="-74" rx="24" ry="20" fill={spec.leafColor || '#2D8055'} opacity="0.9" />
              <ellipse cx="20" cy="-74" rx="24" ry="20" fill={spec.leafColor || '#2D8055'} opacity="0.9" />
              <ellipse cx="0" cy="-95" rx="26" ry="20" fill="#3AA66E" opacity="0.9" />
            </g>
          )}
        </g>
      </g>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050b08] text-stone-100 select-none overflow-hidden touch-none flex flex-col w-full h-full animate-fade-in font-sans">
      {/* FULL SCREEN TOP HEADER: ONLY RETURN ARROW */}
      <header className="absolute top-4 left-4 z-30 pointer-events-none">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => (modalTab === 'seeds' ? setModalTab('forest') : onClose())}
          className="pointer-events-auto w-10 h-10 rounded-full bg-stone-900/70 hover:bg-stone-800/90 active:scale-95 border border-emerald-900/60 backdrop-blur-md flex items-center justify-center text-emerald-300 hover:text-white transition-all cursor-pointer shadow-lg"
          title="Повернутися"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </header>

      {/* TAB 1: FULL SCREEN PANORAMIC FOREST */}
      {modalTab === 'forest' && (
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          <svg
            viewBox="0 0 800 500"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full block select-none flex-1"
          >
            <defs>
              <radialGradient id="forestSky" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#1e3328" />
                <stop offset="50%" stopColor="#122019" />
                <stop offset="100%" stopColor="#070d0a" />
              </radialGradient>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(226, 232, 240, 0.2)" />
                <stop offset="50%" stopColor="rgba(52, 211, 153, 0.05)" />
                <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
              </radialGradient>
            </defs>

            <rect width="800" height="500" fill="url(#forestSky)" />

            {/* RADIANT LUMINOUS MOON IN FOREST SKY */}
            <circle cx="400" cy="130" r="160" fill="url(#moonGlow)" />
            {/* Soft Luminous Base Disc */}
            <circle cx="400" cy="130" r="26" fill="rgba(226, 232, 240, 0.35)" />
            <circle cx="392" cy="125" r="6" fill="rgba(255,255,255,0.1)" />
            <circle cx="406" cy="137" r="7.5" fill="rgba(255,255,255,0.1)" />

            {/* Radiant Illuminated Lunar Phase */}
            {moonSvg.isFull ? (
              <circle cx="400" cy="130" r="26" fill="#FFFFFF" opacity="0.95" />
            ) : moonSvg.isNew ? (
              <path d={getMoonSvgData(400, 130, 26, 0.18).path} fill="#FFFFFF" opacity="0.95" />
            ) : (
              <path d={moonSvg.path} fill="#FFFFFF" opacity="0.95" />
            )}
            <circle cx="400" cy="130" r="26" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.0" />

            {/* Distant Mountains */}
            <path d="M-50,290 Q150,220 350,260 T750,240 L850,280 L850,500 L-50,500 Z" fill="#0d1813" opacity="0.7" />
            <path d="M-50,330 Q200,280 420,310 T850,290 L850,500 L-50,500 Z" fill="#101f18" opacity="0.85" />

            {/* Layered Forest Hills */}
            <path d="M-50,390 Q300,360 850,380 L850,500 L-50,500 Z" fill="#13241c" />
            <path d="M-50,435 Q200,410 500,430 T850,420 L850,500 L-50,500 Z" fill="#162c22" />
            <path d="M-50,475 Q320,440 600,470 T850,455 L850,500 L-50,500 Z" fill="#1a3529" />

            {/* Grown Trees in Full View */}
            {arrangedTrees.map((t) => renderCozyTree(t))}

            {forest.length === 0 && (
              <g
                className="cursor-pointer"
                onClick={() => setModalTab('seeds')}
              >
                <ellipse cx="400" cy="425" rx="55" ry="16" fill="rgba(6, 78, 59, 0.45)" />
                <ellipse cx="400" cy="420" rx="35" ry="10" fill="#2d503d" stroke="#529b77" strokeWidth="1.5" />
                <circle cx="400" cy="416" r="3.5" fill="#fef08a" />
              </g>
            )}

            {/* Falling Leaves and Petals */}
            {petals.map((p) => (
              <ellipse
                key={p.id}
                cx={p.x}
                cy={p.y}
                rx={p.size}
                ry={p.size * 0.55}
                fill={p.color}
                opacity="0.8"
                transform={`rotate(${p.rotation} ${p.x} ${p.y})`}
              />
            ))}

            {/* Bioluminescent fireflies */}
            {fireflies.map((f) => (
              <circle key={f.id} cx={f.x} cy={f.y} r={f.r} fill="#a7f3d0" opacity={f.alpha} />
            ))}
          </svg>

          {/* Bottom Floating Selected Tree Info (only shown when a tree is clicked) */}
          {selectedTree && (
            <div className="absolute bottom-6 left-4 right-4 z-30 pointer-events-none flex justify-center">
              {(() => {
                const spec = TREE_SPECIES[selectedTree.speciesId as TreeSpeciesId] || TREE_SPECIES.oak;
                return (
                  <div className="pointer-events-auto max-w-md w-full p-4 rounded-3xl bg-stone-950/85 border border-emerald-800/50 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-900/50 border border-emerald-700/40 flex items-center justify-center text-2xl shrink-0">
                        {spec.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{spec.name}</h4>
                          <span className="text-[10px] text-emerald-400 italic">({spec.botanicalName})</span>
                        </div>
                        <p className="text-xs text-emerald-300/80 leading-snug">{spec.symbol}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-400 font-mono">
                          <span>Дозріло: {new Date(selectedTree.grownAt).toLocaleDateString('uk-UA')}</span>
                          <span className="text-emerald-400 font-semibold">+45 кг O₂</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTree(null)}
                      className="text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-900 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEED SELECTION & NEXT SEED TIMER (FULL SCREEN) */}
      {modalTab === 'seeds' && (
        <div className="pt-20 pb-8 px-4 max-w-xl mx-auto w-full h-full overflow-y-auto space-y-4">
          {/* SEED STATS CARD */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/40 to-emerald-950/40 border border-amber-500/30 backdrop-blur-md shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl">
                🌰
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-200">Доступно зернин:</span>
                  <span className="font-mono text-base font-extrabold text-amber-400">{availableSeeds}</span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  1 зернина за кожні 300 невикурених сигарет
                </p>
              </div>
            </div>

            {/* Progress to next seed */}
            <div className="text-right">
              <div className="text-sm font-mono font-bold text-emerald-400">
                {progressToNextSeed}\300 сигарет
              </div>
            </div>
          </div>

          {/* 5 SACRED TREE SPECIES */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider px-1">
              Оберіть зернину для посадки:
            </h4>

            {(Object.keys(TREE_SPECIES) as TreeSpeciesId[]).map((spId) => {
              const sp = TREE_SPECIES[spId];
              const isCurrent = currentTree?.speciesId === spId;

              return (
                <div
                  key={spId}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-emerald-500/15 border-emerald-500/50'
                      : 'bg-stone-900/60 border-stone-800/80 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-stone-800/90 flex items-center justify-center text-2xl shrink-0">
                      {sp.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-100">{sp.name}</span>
                        <span className="text-xs text-stone-400 italic">({sp.botanicalName})</span>
                      </div>
                      <p className="text-xs text-stone-400 leading-tight mt-0.5">{sp.symbol}</p>
                      <p className="text-[11px] text-emerald-400/80 mt-1">Час дозрівання: 20 днів</p>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Росте</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={availableSeeds <= 0 && currentTree !== null}
                        onClick={() => {
                          onPlantSeed?.(spId);
                          setModalTab('forest');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          availableSeeds > 0 || currentTree === null
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md active:scale-95'
                            : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                        }`}
                      >
                        Посадити
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
