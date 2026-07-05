import { getNitiSeason, isTempleOpenBySchedule, TEMPLE_OPEN_HOURS } from '../data/niti';
import { getNextRitualInfo } from '../lib/todayBand';
import { useTranslation } from '../i18n/useTranslation';
import useIstClock from './useIstClock';

/** Keep "7:00 PM" on one line in tight ribbon/card layouts */
function compactTime(time) {
  return time.replace(/\s+(AM|PM)\b/gi, '\u00A0$1');
}

export function useTempleStatusCopy() {
  const now = useIstClock();
  const isOpen = isTempleOpenBySchedule(now);
  const { t } = useTranslation();
  const hours = TEMPLE_OPEN_HOURS[getNitiSeason(now)];
  const nextRitual = getNextRitualInfo(now);
  const ritualTime = compactTime(nextRitual.time);
  const opensLabel = compactTime(hours.opensLabel);
  const manglaAarti = compactTime(hours.manglaAarti);

  return {
    isOpen,
    statusDot: isOpen ? '#1F8A5B' : '#C28A1E',
    statusGlow: isOpen ? 'rgba(31,138,91,0.25)' : 'rgba(194,138,30,0.25)',
    statusText: isOpen ? t('status.openNow') : t('status.closedRest'),
    nextText: isOpen
      ? t('status.nextRitualLine', { name: nextRitual.name, time: ritualTime })
      : t('status.opensLine', { opens: opensLabel, aarti: manglaAarti }),
    statusHead: isOpen ? t('status.openNowCard') : t('status.closedCard'),
    statusSub: isOpen
      ? t('status.openSub', { name: nextRitual.name, time: ritualTime })
      : t('status.closedSub', { opens: opensLabel, aarti: manglaAarti }),
  };
}

export default useTempleStatusCopy;
