import Timing from '../models/Timing.js';
import SpecialTimetable from '../models/SpecialTimetable.js';
import { SUMMER_NITI, WINTER_NITI } from '../../src/data/niti.js';
import { isTimingDataCorrupt, repairCanonicalTimings } from './timingRepair.js';
import {
  formatIndianDateKey,
  formatIndianDateRange,
  formatIndianRitualTime,
} from '../../src/lib/indianDates.js';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function toIstDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
}

export function getSeasonForDate(date = new Date()) {
  const month = Number(toIstDateKey(date).slice(5, 7));
  return month >= 3 && month <= 9 ? 'summer' : 'winter';
}

function sortRows(rows = []) {
  return [...rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function mapTimingRow(row) {
  return {
    time: formatIndianRitualTime(row.time),
    name: row.name,
    odia: row.nameOdia ?? row.odia ?? '',
    note: row.note || '',
  };
}

async function getBaselineTimingsGrouped() {
  let rows = await Timing.find().sort({ season: 1, order: 1 });
  if (isTimingDataCorrupt(rows)) {
    await repairCanonicalTimings();
    rows = await Timing.find().sort({ season: 1, order: 1 });
  }
  if (!rows.length) {
    return {
      summer: SUMMER_NITI.map(({ time, name, odia, note }) => ({ time, name, odia, note })),
      winter: WINTER_NITI.map(({ time, name, odia, note }) => ({ time, name, odia, note })),
    };
  }

  const grouped = { summer: [], winter: [] };
  for (const row of rows) {
    if (!String(row.name ?? '').trim() || !String(row.time ?? '').trim()) continue;
    grouped[row.season].push(mapTimingRow(row));
  }
  return grouped;
}

function mapSpecialDoc(doc) {
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const items = sortRows(plain.rows ?? []).map((row) => ({
    time: formatIndianRitualTime(row.time),
    name: row.name,
    odia: row.nameOdia ?? '',
    note: row.note || '',
  }));

  return {
    id: plain._id?.toString(),
    title: plain.title,
    titleOdia: plain.titleOdia || '',
    startDate: plain.startDate,
    endDate: plain.endDate,
    startDateDisplay: formatIndianDateKey(plain.startDate),
    endDateDisplay: formatIndianDateKey(plain.endDate),
    dateRangeDisplay: formatIndianDateRange(plain.startDate, plain.endDate),
    note: plain.note || '',
    active: plain.active !== false,
    priority: plain.priority ?? 0,
    items,
  };
}

export async function findActiveSpecialTimetable(asOf = new Date()) {
  const dateKey = toIstDateKey(asOf);
  if (!DATE_KEY_RE.test(dateKey)) return null;

  const doc = await SpecialTimetable.findOne({
    active: true,
    startDate: { $lte: dateKey },
    endDate: { $gte: dateKey },
  })
    .sort({ priority: -1, startDate: -1 })
    .lean();

  return doc ? mapSpecialDoc(doc) : null;
}

export async function resolvePublicNiti(asOf = new Date()) {
  const [baseline, special] = await Promise.all([
    getBaselineTimingsGrouped(),
    findActiveSpecialTimetable(asOf),
  ]);

  const activeSeason = getSeasonForDate(asOf);

  if (special) {
    return {
      mode: 'special',
      activeSeason,
      summer: baseline.summer,
      winter: baseline.winter,
      special,
    };
  }

  return {
    mode: 'seasonal',
    activeSeason,
    summer: baseline.summer,
    winter: baseline.winter,
    special: null,
  };
}

export { getBaselineTimingsGrouped, mapSpecialDoc };
