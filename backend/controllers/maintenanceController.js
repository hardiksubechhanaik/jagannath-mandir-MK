import asyncHandler from 'express-async-handler';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';
import { purgeSampleContent, resyncEssentials } from '../seed/seedData.js';

export const purgeFakeData = asyncHandler(async (_req, res) => {
  const removed = await purgeSampleContent();
  const essentials = await resyncEssentials();
  scheduleDevSnapshot();

  res.json({
    ok: true,
    message: 'Sample donations, messages, gallery items, and blog posts removed.',
    removed,
    essentials,
  });
});
