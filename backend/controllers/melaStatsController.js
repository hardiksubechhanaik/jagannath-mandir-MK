import asyncHandler from 'express-async-handler';
import { getMelaStats, incrementMelaStat, MELA_STALL_KEYS } from '../lib/melaStatsStore.js';

export const readMelaStats = asyncHandler(async (_req, res) => {
  res.json({ counts: getMelaStats() });
});

export const trackMelaStat = asyncHandler(async (req, res) => {
  const key = String(req.params.key ?? '');
  if (!MELA_STALL_KEYS.includes(key)) {
    res.status(400);
    throw new Error('Invalid mela stall key');
  }

  const count = incrementMelaStat(key);
  res.json({ success: true, key, count });
});
