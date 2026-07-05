/** Rath Yatra season — nav link and CTAs show only during this window (or when forced via env). */

const RATH_SEASON_START = new Date('2026-07-14T00:00:00+05:30');
const RATH_SEASON_END = new Date('2026-07-18T23:59:59+05:30');

export function isRathYatraSeason(now = new Date()) {
  if (import.meta.env.VITE_RATH_SEASON === 'true') return true;
  return now >= RATH_SEASON_START && now <= RATH_SEASON_END;
}
