import { useEffect, useRef } from 'react';

const DIYA_COUNT = 100;

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function createDiyas() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  return Array.from({ length: DIYA_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * w,
    startY: h + Math.random() * h * 0.25,
    drift: -60 + Math.random() * 120,
    rise: h * 1.12 + Math.random() * h * 0.15,
    size: 14 + Math.random() * 20,
    duration: 4200 + Math.random() * 3600,
    delay: Math.random() * 1600,
    flicker: Math.random() * Math.PI * 2,
    sway: 6 + Math.random() * 14,
  }));
}

function drawDiya(ctx, diya, elapsed, layerOpacity) {
  const tRaw = (elapsed - diya.delay) / diya.duration;
  if (tRaw <= 0 || tRaw >= 1) return;

  const t = easeInOutSine(tRaw);
  const sway = Math.sin(elapsed * 0.0025 + diya.flicker) * diya.sway;
  const x = diya.x + diya.drift * t + sway;
  const y = diya.startY - diya.rise * t;

  if (y < -diya.size * 2 || y > window.innerHeight + diya.size * 2) return;

  let alpha = layerOpacity;
  if (tRaw < 0.06) alpha *= tRaw / 0.06;
  else if (tRaw > 0.88) alpha *= (1 - tRaw) / 0.12;
  alpha *= 0.82 + 0.18 * Math.sin(elapsed * 0.005 + diya.flicker);

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.font = `${diya.size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🪔', 0, 0);
  ctx.restore();
}

export default function DiyaLanternCanvas({ fading = false, className = '' }) {
  const canvasRef = useRef(null);
  const diyasRef = useRef([]);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const fadeRef = useRef(1);

  useEffect(() => {
    diyasRef.current = createDiyas();
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

      const list = diyasRef.current;
      for (let i = 0; i < list.length; i += 1) {
        drawDiya(ctx, list[i], elapsed, fadeRef.current);
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

    const fadeStart = performance.now();
    const duration = 900;

    function tick(now) {
      const t = Math.min((now - fadeStart) / duration, 1);
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
