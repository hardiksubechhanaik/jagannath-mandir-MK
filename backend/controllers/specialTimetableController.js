import asyncHandler from 'express-async-handler';
import SpecialTimetable from '../models/SpecialTimetable.js';
import { mapSpecialDoc } from '../lib/timetableResolver.js';
import { normalizeHexColor } from '../lib/colorUtils.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeRows(rows = []) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row, index) => ({
      time: String(row.time ?? '').trim(),
      name: String(row.name ?? '').trim(),
      nameOdia: String(row.nameOdia ?? row.odia ?? '').trim(),
      note: String(row.note ?? '').trim(),
      order: Number.isFinite(row.order) ? row.order : index,
    }))
    .filter((row) => row.time && row.name);
}

function validateDateRange(startDate, endDate) {
  if (!DATE_KEY_RE.test(startDate) || !DATE_KEY_RE.test(endDate)) {
    return 'Dates must use YYYY-MM-DD format';
  }
  if (startDate > endDate) {
    return 'Start date must be on or before end date';
  }
  return null;
}

function normalizeStatusMode(mode) {
  const value = String(mode ?? 'auto').trim();
  return ['auto', 'open', 'closed'].includes(value) ? value : 'auto';
}

function toClient(doc) {
  return mapSpecialDoc(doc);
}

export const listSpecialTimetables = asyncHandler(async (_req, res) => {
  const rows = await SpecialTimetable.find().sort({ startDate: -1, priority: -1 });
  res.json(rows.map(toClient));
});

export const createSpecialTimetable = asyncHandler(async (req, res) => {
  const title = String(req.body?.title ?? '').trim();
  const titleOdia = String(req.body?.titleOdia ?? '').trim();
  const startDate = String(req.body?.startDate ?? '').trim();
  const endDate = String(req.body?.endDate ?? '').trim();
  const note = String(req.body?.note ?? '').trim();
  const active = req.body?.active !== false;
  const priority = Number(req.body?.priority) || 0;
  const templeStatusMode = normalizeStatusMode(req.body?.templeStatusMode);
  const templeStatusHead = String(req.body?.templeStatusHead ?? '').trim();
  const templeStatusSub = String(req.body?.templeStatusSub ?? '').trim();
  const templeStatusRibbon = String(req.body?.templeStatusRibbon ?? '').trim();
  const accentColor = normalizeHexColor(req.body?.accentColor);
  const rows = normalizeRows(req.body?.rows);

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  const dateError = validateDateRange(startDate, endDate);
  if (dateError) {
    res.status(400);
    throw new Error(dateError);
  }

  if (!rows.length) {
    res.status(400);
    throw new Error('Add at least one timing row');
  }

  const doc = await SpecialTimetable.create({
    title,
    titleOdia,
    startDate,
    endDate,
    note,
    active,
    priority,
    templeStatusMode,
    templeStatusHead,
    templeStatusSub,
    templeStatusRibbon,
    accentColor,
    rows,
  });

  scheduleDevSnapshot();
  res.status(201).json(toClient(doc));
});

export const updateSpecialTimetable = asyncHandler(async (req, res) => {
  const existing = await SpecialTimetable.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Special timetable not found');
  }

  const patch = {};
  if (req.body?.title !== undefined) {
    const title = String(req.body.title).trim();
    if (!title) {
      res.status(400);
      throw new Error('Title cannot be empty');
    }
    patch.title = title;
  }
  if (req.body?.titleOdia !== undefined) patch.titleOdia = String(req.body.titleOdia).trim();
  if (req.body?.note !== undefined) patch.note = String(req.body.note).trim();
  if (req.body?.active !== undefined) patch.active = Boolean(req.body.active);
  if (req.body?.priority !== undefined) patch.priority = Number(req.body.priority) || 0;
  if (req.body?.templeStatusMode !== undefined) {
    patch.templeStatusMode = normalizeStatusMode(req.body.templeStatusMode);
  }
  if (req.body?.templeStatusHead !== undefined) {
    patch.templeStatusHead = String(req.body.templeStatusHead).trim();
  }
  if (req.body?.templeStatusSub !== undefined) {
    patch.templeStatusSub = String(req.body.templeStatusSub).trim();
  }
  if (req.body?.templeStatusRibbon !== undefined) {
    patch.templeStatusRibbon = String(req.body.templeStatusRibbon).trim();
  }
  if (req.body?.accentColor !== undefined) {
    patch.accentColor = normalizeHexColor(req.body.accentColor);
  }

  const startDate = req.body?.startDate !== undefined
    ? String(req.body.startDate).trim()
    : existing.startDate;
  const endDate = req.body?.endDate !== undefined
    ? String(req.body.endDate).trim()
    : existing.endDate;

  if (req.body?.startDate !== undefined || req.body?.endDate !== undefined) {
    const dateError = validateDateRange(startDate, endDate);
    if (dateError) {
      res.status(400);
      throw new Error(dateError);
    }
    patch.startDate = startDate;
    patch.endDate = endDate;
  }

  if (req.body?.rows !== undefined) {
    const rows = normalizeRows(req.body.rows);
    if (!rows.length) {
      res.status(400);
      throw new Error('Add at least one timing row');
    }
    patch.rows = rows;
  }

  const doc = await SpecialTimetable.findByIdAndUpdate(
    req.params.id,
    { $set: patch },
    { new: true, runValidators: true },
  );

  scheduleDevSnapshot();
  res.json(toClient(doc));
});

export const deleteSpecialTimetable = asyncHandler(async (req, res) => {
  const doc = await SpecialTimetable.findByIdAndDelete(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Special timetable not found');
  }
  scheduleDevSnapshot();
  res.json({ message: 'Special timetable removed', timetable: toClient(doc) });
});
