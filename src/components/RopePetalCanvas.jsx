import { useEffect, useRef } from 'react';

const PETAL_COUNT = 3500;

const ROPE_PETAL_PALETTE = [
  { light: '#FFF4C2', color: '#FFB627', dark: '#E8870A' },
  { light: '#FFECAA', color: '#FF9500', dark: '#D97706' },
  { light: '#FFF9DB', color: '#FFD56B', dark: '#F5A623' },
  { light: '#FFF0C2', color: '#FFAB00', dark: '#DB8700' },
  { light: '#FFE4EC', color: '#F783AC', dark: '#E64980' },
  { light: '#FFD6E0', color: '#FF6B9D', dark: '#C2255C' },
  { light: '#FFE3E3', color: '#FF6B6B', dark: '#C92A2A' },
  { light: '#FFC9C9', color: '#FA5252', dark: '#A61E1E' },
  { light: '#FFFFFF', color: '#FFF8ED', dark: '#E8DFD0' },
  { light: '#FFFBF0', color: '#FFF3D6', dark: '#E6D5B8' },
  { light: '#DCFFE8', color: '#6BCB77', dark: '#2F9E44' },
  { light: '#D3F9D8', color: '#51CF66', dark: '#2B8A3E' },
  { light: '#E6FCF5', color: '#38D9A9', dark: '#0CA678' },
  { light: '#D0EBFF', color: '#4DABF7', dark: '#1971C2' },
  { light: '#A5D8FF', color: '#339AF0', dark: '#1864AB' },
  { light: '#BAC8FF', color: '#748FFC', dark: '#364FC7' },
  { light: '#91A7FF', color: '#4C6EF5', dark: '#1E3A8A' },
  { light: '#748FFC', color: '#364FC7', dark: '#0B1F66' },
];

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function createPetals() {
  const spread = Math.max(window.innerWidth, window.innerHeight) * 0.78;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  return Array.from({ length: PETAL_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * spread;
    const palette = ROPE_PETAL_PALETTE[Math.floor(Math.random() * ROPE_PETAL_PALETTE.length)];
    return {
      spreadX: Math.cos(angle) * dist,
      spreadY: Math.sin(angle) * dist,
      width: 2.5 + Math.random() * 2.5,
      height: 6 + Math.random() * 5,
      ...palette,
      duration: 2400 + Math.random() * 2200,
      delay: Math.random() * 850,
      spin: (-280 + Math.random() * 560) * (Math.PI / 180),
      rotate: Math.random() * Math.PI * 2,
      cx,
      cy,
    };
  });
}

function drawPetal(ctx, petal, elapsed, layerOpacity) {
  const tRaw = (elapsed - petal.delay) / petal.duration;
  if (tRaw <= 0 || tRaw >= 1) return;

  const t = easeOutCubic(tRaw);
  const x = petal.cx + petal.spreadX * t;
  const y = petal.cy + petal.spreadY * t;
  const rot = petal.rotate + petal.spin * t;

  let alpha = 0.92;
  if (tRaw < 0.08) alpha = (tRaw / 0.08) * 0.92;
  else if (tRaw > 0.85) alpha = ((1 - tRaw) / 0.15) * 0.92;
  alpha *= layerOpacity;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = petal.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, petal.width / 2, petal.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function RopePetalCanvas({ fading = false, className = '' }) {
  const canvasRef = useRef(null);
  const petalsRef = useRef([]);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const fadeRef = useRef(1);

  useEffect(() => {
    petalsRef.current = createPetals();
    startRef.current = performance.now();
    fadeRef.current = 1;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    function frame(now) {
      const elapsed = now - startRef.current;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < petalsRef.current.length; i += 1) {
        drawPetal(ctx, petalsRef.current[i], elapsed, fadeRef.current);
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!fading) {
      fadeRef.current = 1;
      return undefined;
    }

    const start = performance.now();
    const duration = 850;

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      fadeRef.current = 1 - t;
      if (t < 1) requestAnimationFrame(tick);
    }

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [fading]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
