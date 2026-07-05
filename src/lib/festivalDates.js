const MONTH_NUM = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/** Shree Mandira Panjika 2026–27 spans Jun 2026 – Apr 2027. */
export function panjikaYearForMonth(monthStr) {
  const month = parseMonth(monthStr);
  if (!month) return 2026;
  if (month >= 6) return 2026;
  if (month <= 4) return 2027;
  return 2026;
}

export function parseMonth(monthStr) {
  if (!monthStr) return 0;
  const key = String(monthStr).trim().toLowerCase().slice(0, 3);
  return MONTH_NUM[key] || 0;
}

export function buildFestivalIsoDate(day, month, year) {
  const dayNum = parseInt(String(day ?? '').trim(), 10);
  const monthNum = parseMonth(month);
  const yearNum = year ?? panjikaYearForMonth(month);
  if (!dayNum || !monthNum) return '';
  return `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
}

export function normalizeFestivalDate(festival) {
  const existing = festival?.date;
  if (existing && /^\d{4}-\d{2}-\d{2}$/.test(String(existing))) {
    return existing;
  }
  return buildFestivalIsoDate(festival?.day, festival?.month);
}

export function getTodayKeyIst(now = new Date()) {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function weekdayFromIsoDate(isoDate) {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
}

export function sortFestivalsByDate(festivals) {
  return [...festivals].sort((a, b) =>
    normalizeFestivalDate(a).localeCompare(normalizeFestivalDate(b)),
  );
}

export function filterUpcomingFestivals(festivals, now = new Date()) {
  const todayKey = getTodayKeyIst(now);
  return festivals.filter((f) => normalizeFestivalDate(f) >= todayKey);
}

export function enrichFestival(festival) {
  const date = normalizeFestivalDate(festival);
  return {
    ...festival,
    date,
    weekday: festival.weekday || weekdayFromIsoDate(date),
  };
}
