import {
  getNitiSeason,
  isTempleOpenBySchedule,
  TEMPLE_OPEN_HOURS,
} from '../../src/data/niti.js';
import { getNextRitualInfo } from '../../src/lib/todayBand.js';
import { glowFromHex, normalizeHexColor } from './colorUtils.js';

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

function applySpecialStatusOverrides(copy, activeSpecial, isOpen) {
  if (!activeSpecial || activeSpecial.templeStatusMode === 'auto') {
    return copy;
  }

  const next = { ...copy };
  if (activeSpecial.templeStatusHead?.trim()) {
    next.statusHead = activeSpecial.templeStatusHead.trim();
  } else {
    next.statusHead = isOpen ? 'Open Now' : 'Currently Closed';
  }

  if (activeSpecial.templeStatusSub?.trim()) {
    next.statusSub = activeSpecial.templeStatusSub.trim();
  } else if (activeSpecial.note?.trim()) {
    next.statusSub = activeSpecial.note.trim();
  }

  if (activeSpecial.templeStatusRibbon?.trim()) {
    next.statusText = activeSpecial.templeStatusRibbon.trim();
  } else if (activeSpecial.templeStatusHead?.trim()) {
    next.statusText = activeSpecial.templeStatusHead.trim();
  } else {
    next.statusText = isOpen ? 'Open now — darshan in progress' : 'Closed — temple at rest';
  }

  const accent = normalizeHexColor(activeSpecial.accentColor);
  if (accent) {
    next.statusDot = accent;
    next.statusGlow = glowFromHex(accent) || next.statusGlow;
  }

  return next;
}

export function getTempleStatus(settingsStatus, activeSpecial = null, now = new Date()) {
  const scheduleOpen = isTempleOpenBySchedule(now);
  let isOpen = settingsStatus === 'closed' ? false : scheduleOpen;

  const mode = activeSpecial?.templeStatusMode ?? 'auto';
  if (mode === 'open') isOpen = true;
  if (mode === 'closed') isOpen = false;

  const copy = applySpecialStatusOverrides(
    getTempleStatusCopy(isOpen, now),
    activeSpecial,
    isOpen,
  );

  return {
    isOpen,
    ...copy,
    specialStatusMode: mode,
    specialStatusActive: Boolean(activeSpecial && mode !== 'auto'),
  };
}

export { isTempleOpenBySchedule };
