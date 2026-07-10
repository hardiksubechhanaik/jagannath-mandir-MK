import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';
import { normalizePrasadPricing } from '../lib/prasadPricing.js';

async function getSettingsDoc() {
  let doc = await Setting.findOne();
  if (!doc) {
    doc = await Setting.create({});
  }
  return doc;
}

import { sanitizeLinkUrl } from '../lib/validators.js';

function normalizeWelcomePopupImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((item) => item && String(item.url || '').trim())
    .map((item) => ({
      url: String(item.url).trim(),
      alt: String(item.alt || '').trim().slice(0, 200),
      linkUrl: sanitizeLinkUrl(item.linkUrl),
      caption: String(item.caption || '').trim().slice(0, 300),
    }));
}

function toClient(doc) {
  const images = normalizeWelcomePopupImages(doc.welcomePopupImages);
  return {
    status: doc.status,
    phone: doc.phone,
    email: doc.email,
    address: doc.address,
    morning: doc.morning,
    evening: doc.evening,
    paymentsEnabled: Boolean(doc.paymentsEnabled),
    welcomePopupEnabled: doc.welcomePopupEnabled !== false,
    welcomePopupEyebrow: doc.welcomePopupEyebrow || '',
    welcomePopupHeading: doc.welcomePopupHeading || '',
    welcomePopupSubline: doc.welcomePopupSubline || '',
    welcomePopupImages: images,
    prasadPricing: normalizePrasadPricing(doc.prasadPricing),
  };
}

export const getSettings = asyncHandler(async (_req, res) => {
  const doc = await getSettingsDoc();
  res.json(toClient(doc));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const doc = await getSettingsDoc();
  const fields = [
    'status',
    'phone',
    'email',
    'address',
    'morning',
    'evening',
    'paymentsEnabled',
    'welcomePopupEnabled',
    'welcomePopupEyebrow',
    'welcomePopupHeading',
    'welcomePopupSubline',
  ];
  for (const field of fields) {
    if (req.body[field] !== undefined) doc[field] = req.body[field];
  }
  if (req.body.welcomePopupImages !== undefined) {
    doc.welcomePopupImages = normalizeWelcomePopupImages(req.body.welcomePopupImages);
    doc.markModified('welcomePopupImages');
  }
  if (req.body.prasadPricing !== undefined) {
    doc.prasadPricing = normalizePrasadPricing(req.body.prasadPricing);
    doc.markModified('prasadPricing');
  }
  await doc.save();
  scheduleDevSnapshot();
  res.json(toClient(doc));
});

export { toClient };
