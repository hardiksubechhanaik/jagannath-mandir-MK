import crypto from 'node:crypto';

const TTL_MS = 60_000;
/** Allow duplicate exchange briefly (React Strict Mode / double navigation). */
const RECENTLY_USED_MS = 30_000;

/** @type {Map<string, { token: string, expiresAt: number }>} */
const codes = new Map();

/** @type {Map<string, { token: string, expiresAt: number }>} */
const recentlyUsed = new Map();

function pruneExpired(store) {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}

export function createHandoffCode(token) {
  pruneExpired(codes);
  const code = crypto.randomBytes(24).toString('hex');
  codes.set(code, { token, expiresAt: Date.now() + TTL_MS });
  return code;
}

export function consumeHandoffCode(code) {
  if (!code) return null;

  pruneExpired(recentlyUsed);
  const replay = recentlyUsed.get(code);
  if (replay && replay.expiresAt > Date.now()) {
    return replay.token;
  }

  const entry = codes.get(code);
  codes.delete(code);
  if (!entry || entry.expiresAt <= Date.now()) return null;

  recentlyUsed.set(code, { token: entry.token, expiresAt: Date.now() + RECENTLY_USED_MS });
  return entry.token;
}
