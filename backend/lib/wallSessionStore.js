import crypto from 'node:crypto';

const USER_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const VOLUNTEER_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/** @type {Map<string, { phone: string, expiresAt: number }>} */
const userSessions = new Map();

/** @type {Map<string, { expiresAt: number }>} */
const volunteerSessions = new Map();

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function pruneExpired(store) {
  const now = Date.now();
  for (const [token, entry] of store.entries()) {
    if (entry.expiresAt <= now) store.delete(token);
  }
}

export function createUserSession(phone) {
  pruneExpired(userSessions);
  const token = createToken();
  userSessions.set(token, { phone, expiresAt: Date.now() + USER_SESSION_TTL_MS });
  return token;
}

export function getUserSession(token) {
  if (!token) return null;
  const entry = userSessions.get(token);
  if (!entry || entry.expiresAt <= Date.now()) {
    userSessions.delete(token);
    return null;
  }
  return entry;
}

export function createVolunteerSession() {
  pruneExpired(volunteerSessions);
  const token = createToken();
  volunteerSessions.set(token, { expiresAt: Date.now() + VOLUNTEER_SESSION_TTL_MS });
  return token;
}

export function getVolunteerSession(token) {
  if (!token) return null;
  const entry = volunteerSessions.get(token);
  if (!entry || entry.expiresAt <= Date.now()) {
    volunteerSessions.delete(token);
    return null;
  }
  return entry;
}

export function getVolunteerSecret() {
  if (process.env.WALL_VOLUNTEER_SECRET) return process.env.WALL_VOLUNTEER_SECRET;
  if (process.env.NODE_ENV === 'production') return null;
  return process.env.RATH_TRACKER_SECRET || null;
}
