const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse YYYY-MM-DD as a calendar date in IST (no timezone drift). */
export function parseIsoDateKey(isoDate) {
  const match = ISO_DATE_RE.exec(String(isoDate ?? '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/** Display an ISO date key in Indian format (DD/MM/YYYY). */
export function formatIndianDateKey(isoDate) {
  const parts = parseIsoDateKey(isoDate);
  if (!parts) return String(isoDate ?? '').trim();
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export function formatIndianDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  if (startDate === endDate) return formatIndianDateKey(startDate);
  return `${formatIndianDateKey(startDate)} – ${formatIndianDateKey(endDate)}`;
}

/** Normalize free-text ritual times to Indian 12-hour style (e.g. 5:30 AM). */
export function formatIndianRitualTime(timeStr) {
  const raw = String(timeStr ?? '').trim();
  if (!raw) return raw;

  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)$/i);
  if (!match) return raw;

  const hour = Number(match[1]);
  const minute = match[2] !== undefined ? Number(match[2]) : 0;
  const meridiem = match[3].replace(/\./g, '').toUpperCase();
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return raw;

  return `${hour}:${String(minute).padStart(2, '0')} ${meridiem}`;
}
