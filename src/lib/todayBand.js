import panjikaEvents from '../data/panjika2026.js';
import {
  SUMMER_NITI,
  WINTER_NITI,
  getNitiSeason,
  TEMPLE_OPEN_HOURS,
} from '../data/niti.js';
import { getIstDate, getIstParts } from './ist.js';

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date) {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatFestivalDate(event) {
  return `${event.day} ${String(event.month).toUpperCase()} ${event.date.slice(0, 4)}`;
}

export function getUpcomingFestivals(count = 3, now = new Date()) {
  const todayKey = toDateKey(getIstDate(now));

  return panjikaEvents
    .filter((event) => event.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count)
    .map((event) => ({
      id: `${event.date}-${event.name}`,
      name: event.name,
      date: formatFestivalDate(event),
      desc: event.descriptionLong || event.description || '',
    }));
}

function parseTime12h(value) {
  const match = String(value).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function shortenFestivalName(name) {
  return name.split(' in Shreemandira')[0].split(' in Shree Mandira')[0].trim();
}

export function getTodayDisplayDate(now = new Date()) {
  return formatDisplayDate(getIstDate(now));
}

export function getTodayBandInfo(now = new Date()) {
  const todayKey = toDateKey(getIstDate(now));
  const todayEvent = panjikaEvents.find((event) => event.date === todayKey);

  if (todayEvent) {
    const title = todayEvent.odia?.trim() || shortenFestivalName(todayEvent.name);
    return {
      title,
      note: shortenFestivalName(todayEvent.name),
    };
  }

  const upcoming =
    panjikaEvents
      .filter((event) => event.date >= todayKey && event.featured)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ??
    panjikaEvents
      .filter((event) => event.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))[0];

  if (upcoming) {
    const title = upcoming.featured && upcoming.odia?.trim()
      ? upcoming.odia.trim()
      : shortenFestivalName(upcoming.name);

    return {
      title: 'Daily darshan & niti',
      note: `Next · ${formatFestivalDate(upcoming)} · ${title}`,
    };
  }

  const season = getNitiSeason(now);
  const hours = TEMPLE_OPEN_HOURS[season];

  return {
    title: 'Daily darshan & niti',
    note: `Opens ${hours.opensLabel} · Mangla Aarti ${hours.manglaAarti}`,
  };
}

export function getNextRitualInfo(now = new Date()) {
  const mins = getIstParts(now).minutesSinceMidnight;
  const schedule = getNitiSeason(now) === 'summer' ? SUMMER_NITI : WINTER_NITI;

  for (const item of schedule) {
    const itemMins = parseTime12h(item.time);
    if (itemMins != null && itemMins > mins) {
      return {
        name: item.name,
        time: item.time,
        when: `Today · ${item.time}`,
      };
    }
  }

  const first = schedule[0];
  return {
    name: first.name,
    time: first.time,
    when: `Tomorrow · ${first.time}`,
  };
}
