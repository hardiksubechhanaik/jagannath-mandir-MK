import { useEffect, useState } from 'react';
import { apiGet, endpoints } from '../api/client';

const POLL_MS = 60_000;

export default function useYoutubeStats(initialStats) {
  const [stats, setStats] = useState(initialStats ?? null);

  useEffect(() => {
    setStats(initialStats ?? null);
  }, [initialStats]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const next = await apiGet(endpoints.liveDarshanYoutubeStats);
        if (!cancelled) setStats(next);
      } catch {
        // Keep last known stats on poll failure.
      }
    }

    const id = window.setInterval(refresh, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return stats;
}
