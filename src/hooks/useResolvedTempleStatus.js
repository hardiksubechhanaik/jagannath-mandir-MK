import useTempleStatusCopy from './useTempleStatusCopy';

/**
 * Merges live schedule-based status with API overrides from an active special timetable.
 */
export default function useResolvedTempleStatus(apiStatus) {
  const live = useTempleStatusCopy();

  if (!apiStatus?.specialStatusActive) {
    return live;
  }

  const isOpen = Boolean(apiStatus.isOpen);

  return {
    isOpen,
    statusDot: apiStatus.statusDot || (isOpen ? '#1F8A5B' : '#C28A1E'),
    statusGlow: apiStatus.statusGlow || (isOpen ? 'rgba(31,138,91,0.25)' : 'rgba(194,138,30,0.25)'),
    statusText: apiStatus.statusText || live.statusText,
    nextText: apiStatus.nextText || live.nextText,
    statusHead: apiStatus.statusHead || live.statusHead,
    statusSub: apiStatus.statusSub || live.statusSub,
  };
}
