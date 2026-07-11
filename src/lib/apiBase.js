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

/** Public site API origin (no /api suffix — paths in client.js include /api/...). */
export function resolveApiOrigin() {
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (PRODUCTION_HOSTS.has(hostname)) {
      return origin;
    }
  }

  const configured = fixKnownApiTypos(import.meta.env.VITE_API_URL);
  if (configured) return configured.replace(/\/$/, '').replace(/\/api\/?$/, '');

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '';
    }
  }

  return FALLBACK_API_ORIGIN;
}
