import Timing from '../models/Timing.js';
import { SUMMER_NITI, WINTER_NITI } from '../../src/data/niti.js';

function mapNitiRows(schedule, season) {
  return schedule.map((item, order) => ({
    name: item.name,
    nameOdia: item.odia,
    time: item.time,
    note: item.note || '',
    season,
    order,
  }));
}

export function isTimingDataCorrupt(rows = []) {
  if (!rows.length) return false;
  const unnamed = rows.filter((row) => !String(row.name ?? '').trim()).length;
  const summer = rows.filter((row) => row.season === 'summer').length;
  const winter = rows.filter((row) => row.season === 'winter').length;
  return unnamed > 0 || summer > SUMMER_NITI.length + 2 || winter > WINTER_NITI.length + 2;
}

export async function repairCanonicalTimings() {
  await Timing.deleteMany({});
  await Timing.insertMany([
    ...mapNitiRows(SUMMER_NITI, 'summer'),
    ...mapNitiRows(WINTER_NITI, 'winter'),
  ]);
  return {
    summer: SUMMER_NITI.length,
    winter: WINTER_NITI.length,
  };
}
