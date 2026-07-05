import asyncHandler from 'express-async-handler';
import {
  approveDiya,
  countApprovedDiyas,
  createDiya,
  listApprovedDiyas,
  listPendingDiyas,
  MAX_APPROVED_DIYAS,
  rejectDiya,
} from '../lib/diyaStore.js';
import { getLiveBoardOccupancy } from '../lib/wallBoardOccupancy.js';
import { pickNextWallPosition } from '../lib/wallBoardLayout.js';

function serializeDiya(entry) {
  return {
    id: entry.id,
    name: entry.name,
    status: entry.status,
    createdAt: entry.createdAt,
    approvedAt: entry.approvedAt ?? null,
    leftPct: entry.leftPct ?? null,
    topPct: entry.topPct ?? null,
    rot: entry.rot ?? 0,
    z: entry.z ?? 8,
  };
}

export const submitDiya = asyncHandler(async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  if (name.length < 1) {
    res.status(400);
    throw new Error('Please enter your name');
  }

  const diya = createDiya(name);
  res.status(201).json({
    message: 'Diya submitted for volunteer review',
    diya: serializeDiya(diya),
  });
});

export const getApprovedDiyas = asyncHandler(async (_req, res) => {
  const items = listApprovedDiyas();
  res.json({
    diyas: items.map(serializeDiya),
    count: items.length,
    maxDiyas: MAX_APPROVED_DIYAS,
  });
});

export const listVolunteerPendingDiyas = asyncHandler(async (_req, res) => {
  const items = listPendingDiyas();
  res.json({
    diyas: items.map(serializeDiya),
    approvedCount: countApprovedDiyas(),
    maxDiyas: MAX_APPROVED_DIYAS,
  });
});

export const approveVolunteerDiya = asyncHandler(async (req, res) => {
  const occupied = await getLiveBoardOccupancy();
  const layout = pickNextWallPosition(req.params.id, occupied, 24);
  const result = approveDiya(req.params.id, layout);
  if (!result) {
    res.status(404);
    throw new Error('Diya not found or already reviewed');
  }
  res.json({ success: true, diya: serializeDiya(result) });
});

export const rejectVolunteerDiya = asyncHandler(async (req, res) => {
  const result = rejectDiya(req.params.id);
  if (!result) {
    res.status(404);
    throw new Error('Diya not found or already reviewed');
  }
  res.json({ success: true });
});
