import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType } from '../types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ZenIslandTabProps {
  cigsAvoided?: number;
  zenState?: any;
  onUpdateZenState?: any;
  onSwitchTab?: (tab: TabType) => void;
}

interface WaterRipple {
  id: number;
  r: number;
  maxR: number;
  opacity: number;
  speed: number;
}

// =========================================================================
// HYPER-REALISTIC NATURAL RIVER BOULDER & EMBEDDED HYDROTHERMAL QUARTZ VEIN
// =========================================================================
// Organic river stone silhouette: wide grounded curved base, natural rock contours
const NATURAL_BOULDER_PATH =
  'M -118,78 C -124,54 -122,12 -108,-38 C -96,-82 -74,-122 -44,-148 C -18,-164 12,-162 42,-144 C 68,-124 92,-86 104,-38 C 116,14 120,54 114,78 C 104,86 48,90 0,90 C -48,90 -106,86 -118,78 Z';

// Realistic geological rock facet lines & volumetric crevice contours
const ROCK_FACET_1 = 'M -78,-102 C -42,-84 -12,-86 28,-110';
const ROCK_FACET_2 = 'M -92,-24 C -54,-10 14,-16 68,-44';
const ROCK_FACET_3 = 'M -84,42 C -34,48 28,42 78,28';
const ROCK_FACET_4 = 'M 4,-156 C -18,-110 -28,-40 -22,48';

// Deep hydrothermal quartz vein fissures across stone face
const MAIN_QUARTZ_VEIN =
  'M 34,-142 C 48,-104 32,-62 52,-14 C 66,26 44,54 52,78';
const VEIN_BRANCH_LEFT_UPPER =
  'M 40,-112 C 16,-124 -14,-108 -38,-92';
const VEIN_BRANCH_LEFT_MID =
  'M 38,-72 C 12,-52 -18,-32 -42,-12 C -62,4 -48,32 -32,58';
const VEIN_BRANCH_RIGHT_MID =
  'M 52,-14 C 74,-22 92,-14 104,-20';
const VEIN_BRANCH_RIGHT_LOWER =
  'M 46,38 C 62,44 78,38 90,48';
const VEIN_BRANCH_FAR_LEFT =
  'M -42,-12 C -58,8 -78,24 -92,52';

const QUARTZ_NODES = [
  { cx: 34, cy: -142, r: 2.6 },
  { cx: 40, cy: -112, r: 3.2 },
  { cx: 38, cy: -72, r: 3.6 },
  { cx: 52, cy: -14, r: 3.8 },
  { cx: 46, cy: 38, r: 3.4 },
  { cx: 52, cy: 78, r: 2.8 },
  { cx: -38, cy: -92, r: 2.4 },
  { cx: -42, cy: -12, r: 3.0 },
  { cx: -32, cy: 58, r: 2.6 },
  { cx: 104, cy: -20, r: 2.4 }
];

export const ZenIslandTab: React.FC<ZenIslandTabProps> = ({ onSwitchTab }) => {
  const [observationSeconds, setObservationSeconds] = useState<number>(0);
  const [veinGlow, setVeinGlow] = useState<number>(0.35);
  const [ripples, setRipples] = useState<WaterRipple[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [huePhase, setHuePhase] = useState<number>(195); // Starts celestial cyan

  const lastInteractionRef = useRef<number>(Date.now());
  const veinGlowRef = useRef<number>(0.35);
  const animFrameRef = useRef<number | null>(null);
  const lastRippleSpawnRef = useRef<number>(0);

  veinGlowRef.current = veinGlow;

  // 1. Observation Timer & 5-minute Completion Target (300 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setObservationSeconds((prev) => {
        const next = prev + 1;
        if (next >= 300 && !isCompleted) {
          setIsCompleted(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  // 2. Animation Loop (60 FPS): Quartz Color Shifting, Soft Breathing, Water Ripples
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.04, (time - lastTime) / 1000);
      lastTime = time;
      const t = time * 0.001;

      // Color Shift: Iridescent cycle across serene tranquil hues
      // Cyan (195) -> Violet (270) -> Rose (330) -> Amber (45) -> Emerald (150)
      const currentHue = (195 + t * 9) % 360;
      setHuePhase(currentHue);

      // Inactivity & 5-minute progress: 0 at start -> 1 at 300 seconds
      const now = Date.now();
      const inactivitySec = Math.max(0, (now - lastInteractionRef.current) / 1000);
      const sessionSec = observationSeconds + inactivitySec * 0.1;
      const progressRatio = Math.min(1, sessionSec / 300);

      // Soft Quartz Breathing (gentle sinusoidal cycle)
      const breathingBase = 0.3 + 0.18 * Math.sin(t * 0.75);
      if (veinGlowRef.current > breathingBase) {
        const nextVein = Math.max(breathingBase, veinGlowRef.current - 0.25 * dt);
        veinGlowRef.current = nextVein;
        setVeinGlow(nextVein);
      } else {
        veinGlowRef.current = breathingBase;
        setVeinGlow(breathingBase);
      }

      // Water Ripple Management:
      // Spawns smoothly, progressively slows down & stops completely by 5 min (300s)
      if (progressRatio < 1.0) {
        // Ripple interval increases from 3.5s at start to 10s near end
        const rippleInterval = 3500 + progressRatio * 7500;
        if (now - lastRippleSpawnRef.current > rippleInterval) {
          lastRippleSpawnRef.current = now;
          const rippleIntensity = Math.max(0, 1 - progressRatio);
          if (rippleIntensity > 0.05) {
            setRipples((prev) => [
              ...prev,
              {
                id: now + Math.random(),
                r: 22,
                maxR: 190 + Math.random() * 40,
                opacity: 0.45 * rippleIntensity,
                speed: 18 + Math.random() * 6
              }
            ]);
          }
        }
      }

      // Expand & fade existing ripples
      setRipples((prev) =>
        prev
          .map((r) => ({
            ...r,
            r: r.r + dt * r.speed,
            opacity: r.opacity - dt * (0.45 / (r.maxR / r.speed))
          }))
          .filter((r) => r.r < r.maxR && r.opacity > 0.005)
      );

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [observationSeconds]);

  // Touch / Click handler: gently touches the stone without harsh disruption
  const handlePointerDown = useCallback(() => {
    lastInteractionRef.current = Date.now();
    // Gentle luminous response in quartz vein
    const nextVein = Math.min(1.0, veinGlowRef.current + 0.32);
    veinGlowRef.current = nextVein;
    setVeinGlow(nextVein);

    // If game not yet passed, gentle water touch ripple
    if (observationSeconds < 300) {
      const progressRatio = Math.min(1, observationSeconds / 300);
      const intensity = Math.max(0.1, 1 - progressRatio);
      setRipples((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          r: 16,
          maxR: 160,
          opacity: 0.35 * intensity,
          speed: 22
        }
      ]);
    }
  }, [observationSeconds]);

  // Progress from 0 to 1 over 300s (5 minutes)
  const progressRatio = Math.min(1, observationSeconds / 300);
  const darkVignetteOpacity = Math.min(1, 0.3 + progressRatio * 0.7);
  const stoneBodyDarken = Math.min(0.85, progressRatio * 0.85);

  // Dynamic Iridescent Colors
  const primaryColor = `hsl(${huePhase}, 85%, 65%)`;
  const secondaryColor = `hsl(${(huePhase + 60) % 360}, 80%, 68%)`;
  const tertiaryColor = `hsl(${(huePhase + 120) % 360}, 75%, 72%)`;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000] text-stone-100 select-none overflow-hidden font-sans touch-none flex flex-col justify-between"
      onPointerDown={handlePointerDown}
    >
      {/* Floating Ambient Keyframes for exactly 3 dust motes */}
      <style>{`
        @keyframes dustFloat1 {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.15; }
          50% { transform: translate(18px, -36px); opacity: 0.55; }
        }
        @keyframes dustFloat2 {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.2; }
          50% { transform: translate(-24px, -42px); opacity: 0.6; }
        }
        @keyframes dustFloat3 {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.12; }
          50% { transform: translate(14px, -28px); opacity: 0.48; }
        }
      `}</style>

      {/* MINIMAL TOP BAR: Only Return Button & Subtle Progress */}
      <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none transition-opacity duration-1000 opacity-75 hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSwitchTab?.('counter');
          }}
          className="pointer-events-auto w-10 h-10 rounded-full bg-slate-950/80 hover:bg-slate-900 active:scale-95 border border-slate-800/60 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer shadow-lg"
          title="Повернутися"
          aria-label="Повернутися"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Quiet Observation Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-850/60 backdrop-blur-md text-xs font-mono tracking-wider text-slate-400">
          {isCompleted ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Гра пройдена • Спокій
            </span>
          ) : (
            <span>{formatTime(observationSeconds)} / 5:00</span>
          )}
        </div>
      </header>

      {/* FULL-SCREEN IMMERSIVE STONE OBSERVATION SANCTUARY */}
      <main className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none cursor-pointer">
        {/* Progressive Deep Black Darkness Overlay (creates the effect that only the stone exists) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(10,14,24,0.3) 0%, rgba(3,5,10,0.85) 60%, #000000 100%)',
            opacity: 1 - darkVignetteOpacity * 0.65
          }}
        />
        <div
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000"
          style={{ opacity: darkVignetteOpacity * 0.7 }}
        />

        {/* MAXIMUM 3 DUST MOTES ON THE ENTIRE SCREEN (as requested: "максимум пилинки 3шт") */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Dust Mote 1 */}
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-slate-200 blur-[0.6px]"
            style={{
              top: '28%',
              left: '24%',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
              animation: 'dustFloat1 11s ease-in-out infinite'
            }}
          />
          {/* Dust Mote 2 */}
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-sky-200 blur-[0.6px]"
            style={{
              top: '64%',
              left: '76%',
              boxShadow: '0 0 8px rgba(186, 230, 253, 0.35)',
              animation: 'dustFloat2 14s ease-in-out infinite'
            }}
          />
          {/* Dust Mote 3 */}
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 blur-[0.6px]"
            style={{
              top: '38%',
              left: '68%',
              boxShadow: '0 0 8px rgba(226, 232, 240, 0.3)',
              animation: 'dustFloat3 12.5s ease-in-out infinite'
            }}
          />
        </div>

        {/* MAIN STONE & WATER CANVAS */}
        <svg
          viewBox="0 0 460 460"
          className="w-full max-w-lg h-auto max-h-[92vh] select-none pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Real Basalt Rock Volumetric Shading (matching the uploaded image) */}
            <radialGradient id="basaltVolumeGrad" cx="36%" cy="32%" r="70%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="30%" stopColor="#334155" />
              <stop offset="65%" stopColor="#1e293b" />
              <stop offset="85%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Geological Stone Facet Shading */}
            <linearGradient id="facetShadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0f172a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
            </linearGradient>

            {/* Dark Water Horizon Shadow */}
            <radialGradient id="waterShadowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#020617" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Rock Surface Organic Noise */}
            <filter id="naturalRockNoise" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 0 0.16  0 0 0 0.35 0"
                result="colorNoise"
              />
              <feComposite in2="SourceGraphic" in="colorNoise" operator="in" />
            </filter>

            {/* Dynamic Iridescent Hydrothermal Quartz Gradient */}
            <linearGradient id="quartzIridescentGrad" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="35%" stopColor={secondaryColor} />
              <stop offset="70%" stopColor={tertiaryColor} />
              <stop offset="100%" stopColor={primaryColor} />
            </linearGradient>

            {/* Subsurface Luminescence Scatter Filter */}
            <filter id="subsurfaceVeinGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.0" result="innerSoft" />
              <feGaussianBlur stdDeviation="7.5" result="wideHalo" />
              <feMerge>
                <feMergeNode in="wideHalo" />
                <feMergeNode in="innerSoft" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. CALM WATER RIPPLES (Gradually calm down and completely vanish at 5 minutes) */}
          <g
            transform="translate(230, 310)"
            style={{
              opacity: Math.max(0, (1 - progressRatio) * 0.9),
              transition: 'opacity 1.5s ease-out'
            }}
          >
            {/* Soft Ambient Resting Water Oval */}
            <ellipse cx="0" cy="0" rx="140" ry="22" fill="none" stroke="#38bdf8" strokeWidth="0.75" opacity="0.08" />
            <ellipse cx="0" cy="0" rx="95" ry="15" fill="none" stroke="#38bdf8" strokeWidth="1.0" opacity="0.14" />
            <ellipse cx="0" cy="0" rx="60" ry="10" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.2" />

            {/* Expanding and decaying ripples */}
            {ripples.map((r) => (
              <ellipse
                key={r.id}
                cx="0"
                cy="0"
                rx={r.r}
                ry={r.r * 0.16}
                fill="none"
                stroke={primaryColor}
                strokeWidth={1.5}
                opacity={r.opacity}
              />
            ))}
          </g>

          {/* Contact Water Shadow */}
          <ellipse
            cx="230"
            cy="310"
            rx="115"
            ry="20"
            fill="url(#waterShadowGrad)"
            opacity={0.85}
          />

          {/* 2. MAIN NATURAL BOULDER MONOLITH (Center: 230, 220) */}
          <g transform="translate(230, 220)">
            {/* Rock Base Silhouette */}
            <path
              d={NATURAL_BOULDER_PATH}
              fill="url(#basaltVolumeGrad)"
              stroke="#020617"
              strokeWidth="2.0"
            />

            {/* Organic Texture Grain */}
            <path
              d={NATURAL_BOULDER_PATH}
              fill="none"
              filter="url(#naturalRockNoise)"
              opacity={0.7}
            />

            {/* Geological Stone Facets & Crevices */}
            <g opacity="0.55">
              <path d={ROCK_FACET_1} fill="none" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
              <path d={ROCK_FACET_1} fill="none" stroke="#020617" strokeWidth="2.0" strokeLinecap="round" transform="translate(0, 1.6)" />
              <path d={ROCK_FACET_2} fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
              <path d={ROCK_FACET_3} fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
              <path d={ROCK_FACET_4} fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            {/* Dark Void Shadow overlay across rock body as screen darkens */}
            <path
              d={NATURAL_BOULDER_PATH}
              fill="#000000"
              opacity={stoneBodyDarken}
              style={{ transition: 'opacity 1.5s ease-out' }}
            />

            {/* ======================================================== */}
            {/* 3. HYDROTHERMAL QUARTZ VEINS (SHIMMERS & CHANGES COLOR)  */}
            {/* ======================================================== */}
            {/* Deep Rock Fissure Trench */}
            <g opacity={0.85}>
              <path d={MAIN_QUARTZ_VEIN} fill="none" stroke="#020617" strokeWidth="5.5" strokeLinecap="round" />
              <path d={VEIN_BRANCH_LEFT_UPPER} fill="none" stroke="#020617" strokeWidth="3.4" strokeLinecap="round" />
              <path d={VEIN_BRANCH_LEFT_MID} fill="none" stroke="#020617" strokeWidth="4.2" strokeLinecap="round" />
              <path d={VEIN_BRANCH_RIGHT_MID} fill="none" stroke="#020617" strokeWidth="3.2" strokeLinecap="round" />
              <path d={VEIN_BRANCH_RIGHT_LOWER} fill="none" stroke="#020617" strokeWidth="3.2" strokeLinecap="round" />
              <path d={VEIN_BRANCH_FAR_LEFT} fill="none" stroke="#020617" strokeWidth="3.0" strokeLinecap="round" />
            </g>

            {/* Soft Breathing & Iridescent Shimmering Quartz Light */}
            <g
              filter="url(#subsurfaceVeinGlow)"
              style={{
                opacity: Math.max(0.35, veinGlow),
                transition: 'opacity 0.2s ease-out'
              }}
            >
              {/* Wide Subsurface Glow */}
              <path
                d={MAIN_QUARTZ_VEIN}
                fill="none"
                stroke="url(#quartzIridescentGrad)"
                strokeWidth={7 + veinGlow * 12}
                strokeLinecap="round"
                opacity={0.35 + veinGlow * 0.4}
                style={{ filter: 'blur(5.5px)' }}
              />
              <path
                d={VEIN_BRANCH_LEFT_MID}
                fill="none"
                stroke="url(#quartzIridescentGrad)"
                strokeWidth={5 + veinGlow * 9}
                strokeLinecap="round"
                opacity={0.3 + veinGlow * 0.35}
                style={{ filter: 'blur(4.5px)' }}
              />

              {/* Main Vein Body */}
              <path
                d={MAIN_QUARTZ_VEIN}
                fill="none"
                stroke="url(#quartzIridescentGrad)"
                strokeWidth={2.8 + veinGlow * 2.2}
                strokeLinecap="round"
              />
              <path
                d={VEIN_BRANCH_LEFT_UPPER}
                fill="none"
                stroke="url(#quartzIridescentGrad)"
                strokeWidth={1.8 + veinGlow * 1.5}
                strokeLinecap="round"
              />
              <path
                d={VEIN_BRANCH_LEFT_MID}
                fill="none"
                stroke="url(#quartzIridescentGrad)"
                strokeWidth={2.2 + veinGlow * 1.8}
                strokeLinecap="round"
              />
              <path
                d={VEIN_BRANCH_RIGHT_MID}
                fill="none"
                stroke="url(#quartzIridescentGrad)"
                strokeWidth={1.6 + veinGlow * 1.4}
                strokeLinecap="round"
              />
              <path
                d={VEIN_BRANCH_RIGHT_LOWER}
                fill="none"
                stroke="url(#quartzIridescentGrad)"
                strokeWidth={1.6 + veinGlow * 1.4}
                strokeLinecap="round"
              />
              <path
                d={VEIN_BRANCH_FAR_LEFT}
                fill="none"
                stroke="url(#quartzIridescentGrad)"
                strokeWidth={1.5 + veinGlow * 1.3}
                strokeLinecap="round"
              />

              {/* White Crystal Core Lines */}
              <path
                d={MAIN_QUARTZ_VEIN}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={1.2 + veinGlow * 0.9}
                strokeLinecap="round"
                opacity={0.75 + veinGlow * 0.25}
              />
              <path
                d={VEIN_BRANCH_LEFT_MID}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={1.0 + veinGlow * 0.7}
                strokeLinecap="round"
                opacity={0.65 + veinGlow * 0.3}
              />

              {/* Quartz Micro-Gem Nodes */}
              {QUARTZ_NODES.map((node, i) => (
                <g key={i} transform={`translate(${node.cx}, ${node.cy})`}>
                  <circle cx="0" cy="0" r={node.r * (0.8 + veinGlow * 0.55)} fill="#FFFFFF" />
                  <circle
                    cx="0"
                    cy="0"
                    r={node.r * 1.5}
                    fill={primaryColor}
                    opacity={0.4}
                    style={{ filter: 'blur(2px)' }}
                  />
                </g>
              ))}
            </g>

            {/* Subtle Water Reflection of the Stone & Quartz Glow */}
            <g
              transform="translate(0, 96) scale(1, -0.22)"
              style={{
                opacity: Math.max(0, (1 - progressRatio) * 0.22),
                transition: 'opacity 1.5s ease-out'
              }}
            >
              <path d={NATURAL_BOULDER_PATH} fill="#0f172a" />
              <path
                d={MAIN_QUARTZ_VEIN}
                fill="none"
                stroke="url(#quartzIridescentGrad)"
                strokeWidth={4 + veinGlow * 5}
                opacity={0.3 + veinGlow * 0.5}
              />
            </g>
          </g>
        </svg>
      </main>
    </div>
  );
};
