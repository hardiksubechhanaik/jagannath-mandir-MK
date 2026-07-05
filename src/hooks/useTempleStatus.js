import { isTempleOpenBySchedule } from '../data/niti';
import useIstClock from './useIstClock';

export default function useTempleStatus() {
  const now = useIstClock();
  return isTempleOpenBySchedule(now);
}

export { useTempleStatusCopy } from './useTempleStatusCopy';
