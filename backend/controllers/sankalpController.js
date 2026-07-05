import asyncHandler from 'express-async-handler';
import {
  approveSankalp,
  countApprovedSankalps,
  createSankalp,
  listApprovedSankalps,
  listPendingSankalps,
  MAX_APPROVED_SANKALPS,
  rejectSankalp,
} from '../lib/sankalpStore.js';
import { getLiveBoardOccupancy } from '../lib/wallBoardOccupancy.js';
import { pickNextWallPosition } from '../lib/wallBoardLayout.js';

function serializeSankalp(entry) {
  return {
    id: entry.id,
    text: entry.text,
    status: entry.status,
    createdAt: entry.createdAt,
    approvedAt: entry.approvedAt ?? null,
    leftPct: entry.leftPct ?? null,
    topPct: entry.topPct ?? null,
    rot: entry.rot ?? 0,
    z: entry.z ?? 12,
  };
}

export const submitSankalp = asyncHandler(async (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  if (text.length < 3) {
    res.status(400);
    throw new Error('Please share your sankalp (at least 3 characters)');
  }

  const sankalp = createSankalp(text);
  res.status(201).json({
    message: 'Sankalp submitted for volunteer review',
    sankalp: serializeSankalp(sankalp),
  });
});

export const getApprovedSankalps = asyncHandler(async (_req, res) => {
  const sankalps = listApprovedSankalps();
  res.json({
    sankalps: sankalps.map(serializeSankalp),
    count: sankalps.length,
    maxSankalps: MAX_APPROVED_SANKALPS,
  });
});

export const listVolunteerPendingSankalps = asyncHandler(async (_req, res) => {
  const sankalps = listPendingSankalps();
  res.json({
    sankalps: sankalps.map(serializeSankalp),
    approvedCount: countApprovedSankalps(),
    maxSankalps: MAX_APPROVED_SANKALPS,
  });
});

export const approveVolunteerSankalp = asyncHandler(async (req, res) => {
  const occupied = await getLiveBoardOccupancy();
  const layout = pickNextWallPosition(req.params.id, occupied, 20);
  const result = approveSankalp(req.params.id, layout);
  if (!result) {
    res.status(404);
    throw new Error('Sankalp not found or already reviewed');
  }
  res.json({ success: true, sankalp: serializeSankalp(result) });
});

export const rejectVolunteerSankalp = asyncHandler(async (req, res) => {
  const result = rejectSankalp(req.params.id);
  if (!result) {
    res.status(404);
    throw new Error('Sankalp not found or already reviewed');
  }
  res.json({ success: true });
});
