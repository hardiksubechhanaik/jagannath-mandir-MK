import { useEffect, useState } from 'react';

export default function useIstClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId;

    function syncNow() {
      setNow(new Date());
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        syncNow();
      }
    }

    const msToNextMinute = 60000 - (Date.now() % 60000);
    const timeoutId = setTimeout(() => {
      syncNow();
      intervalId = setInterval(syncNow, 60000);
    }, msToNextMinute);

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return now;
}
