import rateLimit from 'express-rate-limit';

const skipInDev =
  process.env.NODE_ENV !== 'production' || process.env.USE_MEMORY_DB === 'true';

function limiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
    skip: () => skipInDev,
  });
}

export const loginLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many login attempts. Please try again in a few minutes.',
});

export const handoffLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many handoff attempts. Please try again later.',
});

export const publicWriteLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many submissions. Please try again in a few minutes.',
});

/** Mela stall counters — separate bucket so rope pulls etc. do not block form submissions. */
export const analyticsLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 500,
  message: 'Too many requests. Please slow down.',
});

export const uploadLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Too many uploads. Please try again later.',
});

export const newsletterSubscribeLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many subscription attempts. Please try again later.',
});

export const broadcastLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many broadcasts sent recently. Please wait before sending again.',
});
