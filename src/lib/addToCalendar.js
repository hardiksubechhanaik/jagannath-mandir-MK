import { MANDIR_RIDE_ADDRESS, MANDIR_RIDE_LABEL } from '../data/mandirLocation';

const DEFAULT_LOCATION = `${MANDIR_RIDE_LABEL}, ${MANDIR_RIDE_ADDRESS}`;

function icsEscape(text) {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatIcsDate(isoDate) {
  return isoDate.replace(/-/g, '');
}

function addDaysIso(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function sanitizeFilename(name) {
  return String(name)
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'event';
}

function buildIcsContent({ title, description, location, date, url }) {
  const uid = `${date}-${sanitizeFilename(title).toLowerCase()}@sjmmk.org`;
  const dtstamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  const dtstart = formatIcsDate(date);
  const dtend = formatIcsDate(addDaysIso(date, 1));

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shree Jagannath Mandir Maruti Kunj//Festivals//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${icsEscape(title)}`,
  ];

  if (description) lines.push(`DESCRIPTION:${icsEscape(description)}`);
  if (location) lines.push(`LOCATION:${icsEscape(location)}`);
  if (url) lines.push(`URL:${url}`);

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

/** Download an all-day event as .ics (opens in Apple Calendar, Google Calendar, Outlook, etc.). */
export function downloadCalendarEvent({ title, description, location, date, url }) {
  if (!title || !date) return;

  const ics = buildIcsContent({
    title,
    description,
    location: location || DEFAULT_LOCATION,
    date,
    url,
  });

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${sanitizeFilename(title)}.ics`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export function addFestivalToCalendar(festival, { description, location, url } = {}) {
  downloadCalendarEvent({
    title: festival.name,
    description: description ?? festival.descriptionLong ?? festival.description ?? '',
    location,
    date: festival.date,
    url: url ?? (typeof window !== 'undefined' ? `${window.location.origin}/festivals` : ''),
  });
}
