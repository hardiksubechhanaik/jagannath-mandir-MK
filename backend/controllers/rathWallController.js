import asyncHandler from 'express-async-handler';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RathWallPhoto from '../models/RathWallPhoto.js';
import BlockedWallPhone from '../models/BlockedWallPhone.js';
import { normalizePhone } from '../lib/wallOtpStore.js';
import {
  createVolunteerSession,
  getVolunteerSecret,
} from '../lib/wallSessionStore.js';
import { getWallSettings, setUploadsOpen } from '../lib/wallSettingsStore.js';
import { clearApprovedDiyas } from '../lib/diyaStore.js';
import { clearApprovedSankalps } from '../lib/sankalpStore.js';
import { getLiveBoardOccupancy } from '../lib/wallBoardOccupancy.js';
import { pickNextWallPosition } from '../lib/wallBoardLayout.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const wallUploadsDir = path.join(__dirname, '../uploads/rath-wall');

export const MAX_WALL_PHOTOS = 20;
const GUEST_PHONE = 'guest';

async function enforceWallPhotoCap() {
  const approvedCount = await RathWallPhoto.countDocuments({ status: 'approved' });
  if (approvedCount <= MAX_WALL_PHOTOS) return;

  const excessCount = approvedCount - MAX_WALL_PHOTOS;
  const oldest = await RathWallPhoto.find({ status: 'approved' })
    .sort({ approvedAt: 1, createdAt: 1 })
    .limit(excessCount)
    .select('_id');

  if (oldest.length > 0) {
    await RathWallPhoto.deleteMany({ _id: { $in: oldest.map((doc) => doc._id) } });
  }
}

const LEGACY_SEED_PHONES = [
  '910000000001',
  '910000000002',
  '910000000003',
  '910000000004',
  '910000000005',
  '910000000006',
];

let legacySeedCleanupDone = false;

async function removeLegacySeedPhotos() {
  if (legacySeedCleanupDone) return;
  await RathWallPhoto.deleteMany({ phone: { $in: LEGACY_SEED_PHONES } });
  legacySeedCleanupDone = true;
}

function serializePhoto(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    caption: doc.caption,
    url: doc.imageUrl,
    leftPct: doc.leftPct,
    topPct: doc.topPct,
    rot: doc.rot,
    z: doc.z,
    style: doc.style,
    status: doc.status,
    createdAt: doc.createdAt,
    approvedAt: doc.approvedAt,
  };
}

export const submitWallPhoto = asyncHandler(async (req, res) => {
  if (!getWallSettings().uploadsOpen) {
    res.status(403);
    throw new Error('Photo uploads are closed right now.');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Photo image is required');
  }

  const name = String(req.body?.name ?? '').trim() || 'Devotee';
  const caption = String(req.body?.caption ?? '').trim() || 'A moment from the yatra.';

  const maxZ = await RathWallPhoto.findOne({ status: 'approved' }).sort({ z: -1 }).lean();
  const z = (maxZ?.z ?? 20) + 1;

  const imageUrl = `/uploads/rath-wall/${req.file.filename}`;
  const photo = await RathWallPhoto.create({
    phone: GUEST_PHONE,
    name: name.slice(0, 80),
    caption: caption.slice(0, 200),
    imageUrl,
    status: 'pending',
    leftPct: 8 + Math.random() * 70,
    topPct: 8 + Math.random() * 58,
    rot: -8 + Math.random() * 16,
    z,
    style: Math.random() > 0.5 ? 'pin' : 'tape',
  });

  res.status(201).json({
    success: true,
    message: 'Photo submitted for volunteer review',
    photo: serializePhoto(photo),
  });
});

export const getApprovedWallPhotos = asyncHandler(async (_req, res) => {
  await removeLegacySeedPhotos();
  await enforceWallPhotoCap();
  const photos = await RathWallPhoto.find({ status: 'approved' })
    .sort({ z: 1 })
    .limit(MAX_WALL_PHOTOS)
    .lean();
  const settings = getWallSettings();
  res.json({
    photos: photos.map((doc) => serializePhoto(doc)),
    count: photos.length,
    maxPhotos: MAX_WALL_PHOTOS,
    uploadsOpen: settings.uploadsOpen,
  });
});

export const getWallStatus = asyncHandler(async (_req, res) => {
  const pendingCount = await RathWallPhoto.countDocuments({ status: 'pending' });
  const approvedCount = await RathWallPhoto.countDocuments({ status: 'approved' });
  res.json({
    ...getWallSettings(),
    pendingCount,
    approvedCount,
    maxPhotos: MAX_WALL_PHOTOS,
  });
});

export const volunteerWallLogin = asyncHandler(async (req, res) => {
  const expected = getVolunteerSecret();
  if (!expected) {
    res.status(503);
    throw new Error('Wall volunteer login is not configured');
  }

  if (req.body?.secret !== expected) {
    res.status(401);
    throw new Error('Invalid volunteer password');
  }

  const token = createVolunteerSession();
  res.json({ success: true, token });
});

export const listPendingWallPhotos = asyncHandler(async (_req, res) => {
  const photos = await RathWallPhoto.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .lean();

  res.json({
    photos: photos.map((doc) => ({
      ...serializePhoto(doc),
      phone: doc.phone,
    })),
  });
});

export const approveWallPhoto = asyncHandler(async (req, res) => {
  const photo = await RathWallPhoto.findById(req.params.id);
  if (!photo) {
    res.status(404);
    throw new Error('Photo not found');
  }

  if (photo.status !== 'pending') {
    res.status(400);
    throw new Error('Photo is not pending');
  }

  const occupied = await getLiveBoardOccupancy();
  const placement = pickNextWallPosition(photo._id.toString(), occupied, 18);

  const maxZ = await RathWallPhoto.findOne({ status: 'approved' }).sort({ z: -1 }).lean();
  photo.z = Math.max(placement.z, (maxZ?.z ?? 20) + 1);
  photo.leftPct = placement.leftPct;
  photo.topPct = placement.topPct;
  photo.rot = placement.rot;
  photo.status = 'approved';
  photo.approvedAt = new Date();
  await photo.save();
  await enforceWallPhotoCap();

  res.json({ success: true, photo: serializePhoto(photo) });
});

export const rejectWallPhoto = asyncHandler(async (req, res) => {
  const photo = await RathWallPhoto.findById(req.params.id);
  if (!photo) {
    res.status(404);
    throw new Error('Photo not found');
  }

  photo.status = 'rejected';
  photo.rejectedAt = new Date();
  await photo.save();

  if (req.body?.blockPhone) {
    await BlockedWallPhone.findOneAndUpdate(
      { phone: photo.phone },
      { phone: photo.phone, reason: req.body?.reason ?? 'Rejected by volunteer' },
      { upsert: true },
    );
  }

  res.json({ success: true });
});

export const blockWallPhone = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) {
    res.status(400);
    throw new Error('Valid phone number required');
  }

  await BlockedWallPhone.findOneAndUpdate(
    { phone },
    { phone, reason: req.body?.reason ?? 'Blocked by volunteer' },
    { upsert: true },
  );

  res.json({ success: true });
});

export const getVolunteerWallSettings = asyncHandler(async (_req, res) => {
  const pendingCount = await RathWallPhoto.countDocuments({ status: 'pending' });
  const approvedCount = await RathWallPhoto.countDocuments({ status: 'approved' });
  res.json({
    ...getWallSettings(),
    pendingCount,
    approvedCount,
    maxPhotos: MAX_WALL_PHOTOS,
  });
});

export const updateVolunteerWallSettings = asyncHandler(async (req, res) => {
  if (typeof req.body?.uploadsOpen !== 'boolean') {
    res.status(400);
    throw new Error('uploadsOpen must be true or false');
  }

  const settings = setUploadsOpen(req.body.uploadsOpen);
  const pendingCount = await RathWallPhoto.countDocuments({ status: 'pending' });
  const approvedCount = await RathWallPhoto.countDocuments({ status: 'approved' });

  res.json({
    ...settings,
    pendingCount,
    approvedCount,
    maxPhotos: MAX_WALL_PHOTOS,
  });
});

export const clearPublicWall = asyncHandler(async (_req, res) => {
  const approvedPhotos = await RathWallPhoto.find({ status: 'approved' }).lean();

  approvedPhotos.forEach((photo) => {
    if (!photo.imageUrl?.includes('/uploads/rath-wall/')) return;
    const filename = path.basename(photo.imageUrl);
    const fullPath = path.join(wallUploadsDir, filename);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  });

  const photoResult = await RathWallPhoto.deleteMany({ status: 'approved' });
  const sankalpsRemoved = clearApprovedSankalps();
  const diyasRemoved = clearApprovedDiyas();

  res.json({
    success: true,
    cleared: {
      photos: photoResult.deletedCount ?? 0,
      sankalps: sankalpsRemoved,
      diyas: diyasRemoved,
    },
  });
});
