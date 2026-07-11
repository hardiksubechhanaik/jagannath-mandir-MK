import crypto from 'node:crypto';
import HandoffCode from '../models/HandoffCode.js';

const TTL_MS = 5 * 60_000;
const RECENTLY_USED_MS = 60_000;

/** @type {Map<string, { token: string, expiresAt: number }>} */
const recentlyUsed = new Map();

function pruneRecentlyUsed() {
  const now = Date.now();
  for (const [key, entry] of recentlyUsed.entries()) {
    if (entry.expiresAt <= now) recentlyUsed.delete(key);
  }
}

export async function createHandoffCode(token) {
  const code = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + TTL_MS);
  await HandoffCode.findOneAndUpdate(
    { code },
    { code, token, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return code;
}

export async function consumeHandoffCode(code) {
  if (!code) return null;

  pruneRecentlyUsed();
  const replay = recentlyUsed.get(code);
  if (replay && replay.expiresAt > Date.now()) {
    return replay.token;
  }

  const doc = await HandoffCode.findOneAndDelete({
    code: String(code),
    expiresAt: { $gt: new Date() },
  });
  if (!doc?.token) return null;

  recentlyUsed.set(code, { token: doc.token, expiresAt: Date.now() + RECENTLY_USED_MS });
  return doc.token;
}
