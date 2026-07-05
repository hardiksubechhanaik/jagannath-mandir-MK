import asyncHandler from 'express-async-handler';
import Festival from '../models/Festival.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';
import {
  buildFestivalIsoDate,
  enrichFestival,
  sortFestivalsByDate,
  weekdayFromIsoDate,
} from '../../src/lib/festivalDates.js';

function toClient(doc) {
  return enrichFestival({
    id: doc._id.toString(),
    day: doc.day,
    month: doc.month,
    name: doc.name,
    desc: doc.desc,
    odia: doc.odia || '',
    featured: doc.featured || false,
    date: doc.date || '',
    weekday: doc.weekday || '',
  });
}

function resolveFestivalDate({ day, month, date }) {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return date;
  }
  return buildFestivalIsoDate(day, month);
}

async function listSortedFestivals() {
  const festivals = await Festival.find();
  return sortFestivalsByDate(festivals.map(toClient));
}

export const listFestivals = asyncHandler(async (_req, res) => {
  res.json(await listSortedFestivals());
});

export const createFestival = asyncHandler(async (req, res) => {
  const { day, month, name, desc, odia, featured, date } = req.body;
  const isoDate = resolveFestivalDate({ day, month, date });
  const count = await Festival.countDocuments();
  await Festival.create({
    day: day || '1',
    month: month || 'Jan',
    name,
    desc: desc || '',
    odia: odia || '',
    featured: Boolean(featured),
    date: isoDate,
    weekday: weekdayFromIsoDate(isoDate),
    order: count,
  });
  scheduleDevSnapshot();
  res.status(201).json(await listSortedFestivals());
});

export const updateFestival = asyncHandler(async (req, res) => {
  const { day, month, name, desc, odia, featured, date } = req.body;
  const existing = await Festival.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Festival not found');
  }

  const patch = {};
  if (day !== undefined) patch.day = day;
  if (month !== undefined) patch.month = month;
  if (name !== undefined) patch.name = name;
  if (desc !== undefined) patch.desc = desc;
  if (odia !== undefined) patch.odia = odia;
  if (featured !== undefined) patch.featured = Boolean(featured);

  const nextDay = patch.day ?? existing.day;
  const nextMonth = patch.month ?? existing.month;
  const nextDate = date !== undefined ? date : existing.date;
  const isoDate = resolveFestivalDate({ day: nextDay, month: nextMonth, date: nextDate });
  patch.date = isoDate;
  patch.weekday = weekdayFromIsoDate(isoDate);

  await Festival.findByIdAndUpdate(req.params.id, patch, { new: true });
  scheduleDevSnapshot();
  res.json(await listSortedFestivals());
});

export const deleteFestival = asyncHandler(async (req, res) => {
  const festival = await Festival.findByIdAndDelete(req.params.id);
  if (!festival) {
    res.status(404);
    throw new Error('Festival not found');
  }
  scheduleDevSnapshot();
  res.json(await listSortedFestivals());
});
