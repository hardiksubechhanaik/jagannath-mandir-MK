const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDateKey(isoDate) {
  const match = ISO_DATE_RE.exec(String(isoDate ?? '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

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
