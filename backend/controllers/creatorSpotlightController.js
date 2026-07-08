import asyncHandler from 'express-async-handler';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';
import {
  createCreator,
  deleteCreator,
  getCreator,
  listCreators,
  updateCreator,
} from '../lib/creatorSpotlightStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const creatorUploadsDir = path.join(__dirname, '../uploads/rath-creators');

fs.mkdirSync(creatorUploadsDir, { recursive: true });

function normalizeHandle(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, '');
  return `@${handle}`;
}

function photoPublicPath(filename) {
  return `/uploads/rath-creators/${filename}`;
}

function removePhotoFile(photoUrl) {
  if (!photoUrl || !photoUrl.includes('/uploads/rath-creators/')) return;
  const filename = path.basename(photoUrl);
  const fullPath = path.join(creatorUploadsDir, filename);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

export const listPublicCreators = asyncHandler(async (_req, res) => {
  res.json({ creators: await listCreators() });
});

export const listVolunteerCreators = asyncHandler(async (_req, res) => {
  res.json({ creators: await listCreators() });
});

export const createVolunteerCreator = asyncHandler(async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const instagramHandle = normalizeHandle(req.body?.instagramHandle);
  const tier = req.body?.tier === 'official' ? 'official' : 'digital';
  if (!name) {
    res.status(400);
    throw new Error('Creator name is required');
  }
  if (!instagramHandle || instagramHandle === '@') {
    res.status(400);
    throw new Error('Instagram handle or link is required');
  }

  const photoUrl = req.file ? photoPublicPath(req.file.filename) : '';
  const creator = await createCreator({ name, instagramHandle, photoUrl, tier });
  scheduleDevSnapshot();
  res.status(201).json({ creator });
});

export const updateVolunteerCreator = asyncHandler(async (req, res) => {
  const existing = await getCreator(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Creator not found');
  }

  const patch = {};
  if (req.body?.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!name) {
      res.status(400);
      throw new Error('Creator name cannot be empty');
    }
    patch.name = name;
  }
  if (req.body?.instagramHandle !== undefined) {
    const instagramHandle = normalizeHandle(req.body.instagramHandle);
    if (!instagramHandle || instagramHandle === '@') {
      res.status(400);
      throw new Error('Instagram handle or link is required');
    }
    patch.instagramHandle = instagramHandle;
  }
  if (req.body?.tier !== undefined) {
    patch.tier = req.body.tier === 'official' ? 'official' : 'digital';
  }
  if (req.file) {
    if (existing.photoUrl) removePhotoFile(existing.photoUrl);
    patch.photoUrl = photoPublicPath(req.file.filename);
  }

  const creator = await updateCreator(req.params.id, patch);
  scheduleDevSnapshot();
  res.json({ creator });
});

export const deleteVolunteerCreator = asyncHandler(async (req, res) => {
  const existing = await deleteCreator(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Creator not found');
  }
  if (existing.photoUrl) removePhotoFile(existing.photoUrl);
  scheduleDevSnapshot();
  res.json({ message: 'Creator removed', creator: existing });
});
