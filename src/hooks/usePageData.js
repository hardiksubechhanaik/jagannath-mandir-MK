import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from '../api/client';
import { getPageFallback } from '../api/pageFallbacks';

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

function readCache(endpoint) {
  return cache.get(endpoint) ?? null;
}

function writeCache(endpoint, data) {
  cache.set(endpoint, { data, fetchedAt: Date.now() });
}

function isFresh(entry) {
  return entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

/** Warm the in-memory cache ahead of navigation (nav hover / idle prefetch). */
export function prefetchPageData(endpoint) {
  if (!endpoint) return Promise.resolve(null);

  const cached = readCache(endpoint);
  if (isFresh(cached)) return Promise.resolve(cached.data);
  if (cached?.inFlight) return cached.inFlight;

  const promise = apiGet(endpoint)
    .then((data) => {
      writeCache(endpoint, data);
      return data;
    })
    .catch(() => null)
    .finally(() => {
      const entry = readCache(endpoint);
      if (entry?.inFlight === promise) {
        delete entry.inFlight;
      }
    });

  cache.set(endpoint, { ...(cached ?? {}), inFlight: promise });
  return promise;
}

/** Refetch when the user returns to this tab or restores the page from cache. */
export function useRefetchOnFocus(fetchFn, enabled = true) {
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  useEffect(() => {
    if (!enabled) return undefined;

    function refreshIfVisible() {
      if (document.visibilityState === 'visible') {
        fetchRef.current();
      }
    }

    function onPageShow(event) {
      if (event.persisted) {
        fetchRef.current();
      }
    }

    window.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('focus', refreshIfVisible);
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [enabled]);
}

function getInitialState(endpoint) {
  const cached = readCache(endpoint);
  const fallback = getPageFallback(endpoint);
  const data = cached?.data ?? fallback;
  return {
    data,
    loading: !data,
    hasLoaded: Boolean(data),
  };
}

export default function usePageData(endpoint, { refetchOnFocus = true } = {}) {
  const initial = getInitialState(endpoint);
  const [data, setData] = useState(initial.data);
  const [loading, setLoading] = useState(initial.loading);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(initial.hasLoaded);

  const fetchData = useCallback((options = {}) => {
    const background = options.background ?? hasLoadedRef.current;

    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    return apiGet(endpoint)
      .then((result) => {
        writeCache(endpoint, result);
        hasLoadedRef.current = true;
        setData(result);
        return result;
      })
      .catch((err) => {
        if (!background) setError(err);
        throw err;
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [endpoint]);

  useEffect(() => {
    const cached = readCache(endpoint);
    const fallback = getPageFallback(endpoint);
    const immediate = cached?.data ?? fallback;

    hasLoadedRef.current = Boolean(immediate);
    setData(immediate);
    setError(null);

    if (immediate) {
      setLoading(false);
      setRefreshing(true);
    } else {
      setLoading(true);
      setRefreshing(false);
    }

    let cancelled = false;

    if (isFresh(cached)) {
      setRefreshing(false);
      return undefined;
    }

    apiGet(endpoint)
      .then((result) => {
        if (!cancelled) {
          writeCache(endpoint, result);
          hasLoadedRef.current = true;
          setData(result);
        }
      })
      .catch((err) => {
        if (!cancelled && !immediate) setError(err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  useRefetchOnFocus(
    useCallback(() => {
      if (hasLoadedRef.current) {
        fetchData({ background: true }).catch(() => {});
      }
    }, [fetchData]),
    refetchOnFocus,
  );

  return {
    data,
    loading,
    error,
    refreshing,
    refetch: () => fetchData({ background: false }),
  };
}
