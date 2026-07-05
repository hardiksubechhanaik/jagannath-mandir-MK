import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from '../api/client';

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

export default function usePageData(endpoint, { refetchOnFocus = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);

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
    hasLoadedRef.current = false;
    let cancelled = false;

    setLoading(true);
    setError(null);

    apiGet(endpoint)
      .then((result) => {
        if (!cancelled) {
          hasLoadedRef.current = true;
          setData(result);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
