const PRODUCTION_HOSTS = new Set([
  'www.shreejagannathmandirmk.in',
  'shreejagannathmandirmk.in',
]);

const FALLBACK_API_ORIGIN = 'https://jagannath-mandir-mk.onrender.com';

function fixKnownApiTypos(url) {
  return String(url || '').replace(
    /jagannath-mandir-ak\.onrender\.com/gi,
    'jagannath-mandir-mk.onrender.com',
  );
}

function toApiBase(origin) {
  const trimmed = fixKnownApiTypos(origin).replace(/\/$/, '');
  if (!trimmed) return '/api';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

/** Resolve admin API base URL at runtime (avoids broken VITE_API_URL on Vercel). */
export function resolveApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (PRODUCTION_HOSTS.has(hostname)) {
      return `${origin}/api`;
    }
  }

  const configured = fixKnownApiTypos(import.meta.env.VITE_API_URL);
  if (configured) return toApiBase(configured);

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return toApiBase('http://localhost:5001');
    }
  }

  return toApiBase(FALLBACK_API_ORIGIN);
}

export function resolveApiOrigin() {
  return resolveApiBaseUrl().replace(/\/api\/?$/, '');
}
