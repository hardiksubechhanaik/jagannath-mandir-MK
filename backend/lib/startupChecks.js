const WEAK_SECRETS = new Set([
  'change_me',
  'yourpassword',
  'jagannath',
  'secret',
  'password',
]);

export function assertProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return;

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret || jwtSecret.length < 32 || WEAK_SECRETS.has(jwtSecret)) {
    throw new Error('JWT_SECRET must be set to a strong random value (32+ chars) in production');
  }

  if (process.env.USE_MEMORY_DB === 'true') {
    throw new Error('USE_MEMORY_DB must be false in production');
  }

  if (!process.env.MONGO_URI?.trim() && !process.env.MONGODB_URI?.trim()) {
    throw new Error('MONGO_URI must be set in production');
  }

  if (!process.env.WALL_VOLUNTEER_SECRET?.trim()) {
    throw new Error('WALL_VOLUNTEER_SECRET must be set in production');
  }

  if (!process.env.RATH_TRACKER_SECRET?.trim()) {
    throw new Error('RATH_TRACKER_SECRET must be set in production');
  }
}
