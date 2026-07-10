import asyncHandler from 'express-async-handler';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';
import {
  createCreator,
  deleteCreator,
  getCreator,
  listCreators,
  updateCreator,
} from '../lib/creatorSpotlightStore.js';
import { deleteStoredMedia, mediaPath, saveUploadedImage } from '../lib/mediaStorage.js';

function normalizeHandle(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, '');
  return `@${handle}`;
}

function parseBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 'on';
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
  const partnerType = String(req.body?.partnerType ?? '').trim() || 'Partner';
  const details = String(req.body?.details ?? '').trim();
  const highlighted = parseBoolean(req.body?.highlighted);

  if (!name) {
    res.status(400);
    throw new Error('Partner name is required');
  }

  let photoUrl = '';
  if (req.file) {
    const fileId = await saveUploadedImage(req.file, 'creator');
    photoUrl = mediaPath(fileId);
  }

  const creator = await createCreator({
    name,
    instagramHandle,
    photoUrl,
    partnerType,
    details,
    highlighted,
  });
  scheduleDevSnapshot();
  res.status(201).json({ creator });
});

export const updateVolunteerCreator = asyncHandler(async (req, res) => {
  const existing = await getCreator(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Partner not found');
  }

  const patch = {};
  if (req.body?.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!name) {
      res.status(400);
      throw new Error('Partner name cannot be empty');
    }
    patch.name = name;
  }
  if (req.body?.instagramHandle !== undefined) {
    patch.instagramHandle = normalizeHandle(req.body.instagramHandle);
  }
  if (req.body?.partnerType !== undefined) {
    patch.partnerType = String(req.body.partnerType).trim() || 'Partner';
  }
  if (req.body?.details !== undefined) {
    patch.details = String(req.body.details).trim();
  }
  if (req.body?.highlighted !== undefined) {
    patch.highlighted = parseBoolean(req.body.highlighted);
  }
  if (req.file) {
    if (existing.photoUrl) {
      await deleteStoredMedia(existing.photoUrl);
    }
    const fileId = await saveUploadedImage(req.file, 'creator');
    patch.photoUrl = mediaPath(fileId);
  }

  const creator = await updateCreator(req.params.id, patch);
  scheduleDevSnapshot();
  res.json({ creator });
});

export const deleteVolunteerCreator = asyncHandler(async (req, res) => {
  const existing = await deleteCreator(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Partner not found');
  }
  if (existing.photoUrl) {
    await deleteStoredMedia(existing.photoUrl);
  }
  scheduleDevSnapshot();
  res.json({ message: 'Partner removed', creator: existing });
});
