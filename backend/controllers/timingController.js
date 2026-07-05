import asyncHandler from 'express-async-handler';
import Timing from '../models/Timing.js';

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

async function groupedTimings() {
  const rows = await Timing.find().sort({ season: 1, order: 1 });
  const grouped = { summer: [], winter: [] };
  for (const row of rows) {
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
  res.json(await groupedTimings());
});

export const deleteTiming = asyncHandler(async (req, res) => {
  const row = await Timing.findByIdAndDelete(req.params.id);
  if (!row) {
    res.status(404);
    throw new Error('Timing not found');
  }
  res.json(await groupedTimings());
});

export const bulkUpdateTimings = asyncHandler(async (req, res) => {
  const { summer, winter } = req.body;
  const seasons = [
    ['summer', summer],
    ['winter', winter],
  ];

  const keepIds = new Set();

  for (const [season, rows] of seasons) {
    if (!Array.isArray(rows)) continue;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.id) {
        await Timing.findByIdAndUpdate(row.id, {
          name: row.name,
          nameOdia: row.odia,
          time: row.time,
          note: row.note || '',
          order: i,
        });
        keepIds.add(row.id);
      } else {
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
  }

  const all = await Timing.find();
  for (const row of all) {
    if (!keepIds.has(row._id.toString())) {
      await Timing.findByIdAndDelete(row._id);
    }
  }

  res.json(await groupedTimings());
});

export { rowToClient };
