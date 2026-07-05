import {
  getNitiSeason,
  isTempleOpenBySchedule,
  TEMPLE_OPEN_HOURS,
} from '../../src/data/niti.js';
import { getNextRitualInfo } from '../../src/lib/todayBand.js';

export function getTempleStatusCopy(isOpen, now = new Date()) {
  const hours = TEMPLE_OPEN_HOURS[getNitiSeason(now)];
  const nextRitual = getNextRitualInfo(now);

  return {
    statusDot: isOpen ? '#1F8A5B' : '#C28A1E',
    statusGlow: isOpen ? 'rgba(31,138,91,0.25)' : 'rgba(194,138,30,0.25)',
    statusText: isOpen ? 'Open now — darshan in progress' : 'Closed — temple at rest',
    nextText: isOpen
      ? `NEXT · ${nextRitual.name} ${nextRitual.time}`
      : `OPENS ${hours.opensLabel} · MANGLA AARTI ${hours.manglaAarti}`,
    statusHead: isOpen ? 'Open Now' : 'Currently Closed',
    statusSub: isOpen
      ? `Temple darshan is open. Next ritual: ${nextRitual.name} at ${nextRitual.time}.`
      : `The deities are at rest. Doors open at ${hours.opensLabel} with Mangla Aarti at ${hours.manglaAarti}.`,
  };
}

export function getTempleStatus(settingsStatus) {
  const now = new Date();
  const scheduleOpen = isTempleOpenBySchedule(now);
  const isOpen = settingsStatus === 'closed' ? false : scheduleOpen;
  return { isOpen, ...getTempleStatusCopy(isOpen, now) };
}

export { isTempleOpenBySchedule };
