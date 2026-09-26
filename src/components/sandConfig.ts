export interface SandLevelConfig {
  level: number;
  name: string;
  description: string;
  equivalentMinutes: number;
  color: string;
  glow: string;
  size: number;
  shape: 'circle' | 'square' | 'diamond' | 'triangle' | 'pentagon' | 'star';
}

export const SAND_TIERS: Omit<SandLevelConfig, 'level'>[] = [
  {
    name: 'Піщинка',
    description: '1 хвилина чистого подиху',
    equivalentMinutes: 1,
    color: '#ffb84d',
    glow: '#ff9d2e',
    size: 2.2,
    shape: 'circle'
  },
  {
    name: 'Зерно',
    description: '10 хвилин спокою та сили',
    equivalentMinutes: 10,
    color: '#ff9225',
    glow: '#ff7b00',
    size: 3.6,
    shape: 'circle'
  },
  {
    name: 'Кристал',
    description: '100 хвилин (1.6 год) витримки',
    equivalentMinutes: 100,
    color: '#ffd166',
    glow: '#ffaa00',
    size: 5.2,
    shape: 'diamond'
  },
  {
    name: 'Самоцвіт',
    description: '1,000 хвилин (~16.6 год) оновлення',
    equivalentMinutes: 1000,
    color: '#ff6f3c',
    glow: '#ff4d20',
    size: 7.2,
    shape: 'star'
  },
  {
    name: 'Ефірна Сфера',
    description: '10,000 хвилин (~7 днів) гармонії',
    equivalentMinutes: 10000,
    color: '#ffe49e',
    glow: '#ff9900',
    size: 9.8,
    shape: 'circle'
  },
  {
    name: 'Квантова Монада',
    description: '100,000 хвилин (~70 днів) незламності',
    equivalentMinutes: 100000,
    color: '#fff6e0',
    glow: '#ffb84d',
    size: 13.0,
    shape: 'star'
  }
];

export function getLevelConfig(level: number): SandLevelConfig {
  const index = Math.max(0, Math.min(level - 1, SAND_TIERS.length - 1));
  const tier = SAND_TIERS[index];
  return {
    level,
    ...tier
  };
}

export interface LevelCountItem {
  level: number;
  count: number;
  config: SandLevelConfig;
}

export function getLevelCounts(totalSeconds: number): LevelCountItem[] {
  const totalMinutes = Math.max(0, Math.floor(totalSeconds / 60));
  let n = totalMinutes;
  const results: LevelCountItem[] = [];

  for (let level = 1; level <= 6; level++) {
    const count = n % 10;
    const config = getLevelConfig(level);
    results.push({ level, count, config });
    n = Math.floor(n / 10);
  }

  // If beyond tier 6, keep tier 6 showing remaining overflow
  if (n > 0) {
    results[results.length - 1].count += n * 10;
  }

  return results;
}

// Backward compatibility helper for components expecting LEVEL_CONFIG array
export const LEVEL_CONFIG = Array.from({ length: 15 }, (_, i) => getLevelConfig(i + 1));

export function drawGrainShape(
  ctx: CanvasRenderingContext2D,
  shape: string,
  x: number,
  y: number,
  size: number,
  rot: number
) {
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(x, y, size, 0, Math.PI * 2);
  } else if (shape === 'square') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.rect(-size * 0.8, -size * 0.8, size * 1.6, size * 1.6);
    ctx.restore();
  } else if (shape === 'diamond') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot + Math.PI / 4);
    ctx.rect(-size * 0.75, -size * 0.75, size * 1.5, size * 1.5);
    ctx.restore();
  } else if (shape === 'triangle') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.9, size * 0.8);
    ctx.lineTo(-size * 0.9, size * 0.8);
    ctx.closePath();
    ctx.restore();
  } else if (shape === 'star') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const points = 5;
    const step = Math.PI / points;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? size : size * 0.45;
      const a = i * step - Math.PI / 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.restore();
  } else {
    // Pentagon
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const px = Math.cos(a) * size;
      const py = Math.sin(a) * size;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.restore();
  }
}

export function drawGlowingGrain(
  ctx: CanvasRenderingContext2D,
  shape: string,
  x: number,
  y: number,
  size: number,
  rot: number,
  color: string,
  glowColor: string,
  haloBlur = 10
) {
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = haloBlur;

  const grad = ctx.createRadialGradient(
    x - size * 0.25,
    y - size * 0.25,
    size * 0.1,
    x,
    y,
    size * 1.2
  );
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.35, glowColor);
  grad.addColorStop(1, color);

  ctx.fillStyle = grad;
  drawGrainShape(ctx, shape, x, y, size, rot);
  ctx.fill();

  // Highlight dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.3, Math.max(0.8, size * 0.25), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
