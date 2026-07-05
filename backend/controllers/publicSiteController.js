import asyncHandler from 'express-async-handler';
import LiveNotification from '../models/LiveNotification.js';
import {
  getPublicHome,
  getPublicAbout,
  getPublicVisit,
  getPublicDeities,
  getPublicFestivals,
  getPublicLiveDarshan,
  getPublicYoutubeStats,
  getPublicDonate,
  getPublicContact,
  getPublicGallery,
  getPublicTempleStatus,
  getPublicBlogs,
  getPublicNiti,
} from '../services/publicDataService.js';
import { getPersistenceMode } from '../config/devSnapshot.js';

export const publicHealth = (_req, res) => {
  const payload = {
    ok: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
  if (process.env.NODE_ENV !== 'production') {
    payload.persistence = getPersistenceMode();
  }
  res.json(payload);
};

export const publicHome = asyncHandler(async (_req, res) => {
  res.json(await getPublicHome());
});

export const publicAbout = asyncHandler(async (_req, res) => {
  res.json(await getPublicAbout());
});

export const publicVisit = asyncHandler(async (_req, res) => {
  res.json(await getPublicVisit());
});

export const publicDeities = asyncHandler(async (_req, res) => {
  res.json(await getPublicDeities());
});

export const publicFestivals = asyncHandler(async (_req, res) => {
  res.json(await getPublicFestivals());
});

export const publicLiveDarshan = asyncHandler(async (_req, res) => {
  res.json(await getPublicLiveDarshan());
});

export const publicYoutubeStats = asyncHandler(async (_req, res) => {
  res.json(await getPublicYoutubeStats());
});

export const publicDonate = asyncHandler(async (_req, res) => {
  res.json(await getPublicDonate());
});

export const publicContact = asyncHandler(async (_req, res) => {
  res.json(await getPublicContact());
});

export const publicGallery = asyncHandler(async (_req, res) => {
  res.json(await getPublicGallery());
});

export const publicTempleStatus = asyncHandler(async (_req, res) => {
  res.json(await getPublicTempleStatus());
});

export const publicBlogs = asyncHandler(async (_req, res) => {
  res.json(await getPublicBlogs());
});

export const publicNiti = asyncHandler(async (req, res) => {
  res.json(await getPublicNiti(req.query.season));
});

export const createLiveNotification = asyncHandler(async (req, res) => {
  const contact = String(req.body?.contact ?? '').trim().slice(0, 120);
  if (!contact) {
    res.status(400);
    throw new Error('Email or phone number is required.');
  }

  const record = await LiveNotification.create({ contact });
  res.status(201).json({ ok: true, id: record._id.toString() });
});
