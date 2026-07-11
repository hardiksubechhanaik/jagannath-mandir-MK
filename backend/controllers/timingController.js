import asyncHandler from 'express-async-handler';
import Timing from '../models/Timing.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';
import { repairCanonicalTimings } from '../lib/timingRepair.js';

function rowToClient(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    odia: doc.nameOdia,
    time: doc.time,
    season: doc.season,
    order: doc.order,
  };
}

function sanitizeRows(rows = []) {
  return rows
    .map((row, index) => ({
      id: row.id ? String(row.id) : '',
      name: String(row.name ?? '').trim(),
      odia: String(row.odia ?? row.nameOdia ?? '').trim(),
      time: String(row.time ?? '').trim(),
      note: String(row.note ?? '').trim(),
      order: index,
    }))
    .filter((row) => row.name && row.time);
}

async function groupedTimings() {
  const rows = await Timing.find().sort({ season: 1, order: 1 });
  const grouped = { summer: [], winter: [] };
  for (const row of rows) {
    if (!String(row.name ?? '').trim() || !String(row.time ?? '').trim()) continue;
    grouped[row.season].push({
      id: row._id.toString(),
      name: row.name,
      odia: row.nameOdia,
      time: row.time,
    });
  }
  return grouped;
}

export const listTimings = asyncHandler(async (_req, res) => {
  res.json(await groupedTimings());
});

export const createTiming = asyncHandler(async (req, res) => {
  const { season, name, nameOdia, odia, time, order } = req.body;
  const count = await Timing.countDocuments({ season });
  await Timing.create({
    season,
    name,
    nameOdia: nameOdia || odia,
    time,
    order: order ?? count,
  });
  scheduleDevSnapshot();
  res.status(201).json(await groupedTimings());
});

export const updateTiming = asyncHandler(async (req, res) => {
  const { name, nameOdia, odia, time, season, order } = req.body;
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (nameOdia !== undefined) patch.nameOdia = nameOdia;
  if (odia !== undefined) patch.nameOdia = odia;
  if (time !== undefined) patch.time = time;
  if (season !== undefined) patch.season = season;
  if (order !== undefined) patch.order = order;

  const row = await Timing.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!row) {
    res.status(404);
    throw new Error('Timing not found');
  }
  scheduleDevSnapshot();
  res.json(await groupedTimings());
});

export const deleteTiming = asyncHandler(async (req, res) => {
  const row = await Timing.findByIdAndDelete(req.params.id);
  if (!row) {
    res.status(404);
    throw new Error('Timing not found');
  }
  scheduleDevSnapshot();
  res.json(await groupedTimings());
});

export const bulkUpdateTimings = asyncHandler(async (req, res) => {
  const summer = sanitizeRows(req.body?.summer);
  const winter = sanitizeRows(req.body?.winter);
  const seasons = [
    ['summer', summer],
    ['winter', winter],
  ];

  const keepIds = new Set();

  for (const [season, rows] of seasons) {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.id) {
        const updated = await Timing.findByIdAndUpdate(
          row.id,
          {
            name: row.name,
            nameOdia: row.odia,
            time: row.time,
            note: row.note || '',
            season,
            order: i,
          },
          { new: true },
        );
        if (updated) {
          keepIds.add(updated._id.toString());
          continue;
        }
      }

      const created = await Timing.create({
        season,
        name: row.name,
        nameOdia: row.odia,
        time: row.time,
        note: row.note || '',
        order: i,
      });
      keepIds.add(created._id.toString());
    }
  }

  const all = await Timing.find();
  for (const row of all) {
    if (!keepIds.has(row._id.toString())) {
      await Timing.findByIdAndDelete(row._id);
    }
  }

  scheduleDevSnapshot();
  res.json(await groupedTimings());
});

export const repairTimings = asyncHandler(async (_req, res) => {
  const repaired = await repairCanonicalTimings();
  scheduleDevSnapshot();
  res.json({
    ok: true,
    message: 'Timings reset to the canonical summer/winter schedule.',
    repaired,
    timings: await groupedTimings(),
  });
});

export { rowToClient };
