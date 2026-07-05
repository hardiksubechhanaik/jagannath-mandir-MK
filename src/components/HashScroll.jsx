import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HASH_SCROLL_OFFSET, scrollToHash } from '../lib/scrollToHash';

/** After route/hash changes, scroll once the target element exists (handles async page data). */
export default function HashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;

    let cancelled = false;
    let attempts = 0;

    function tryScroll() {
      if (cancelled) return;
      if (scrollToHash(hash, { offset: HASH_SCROLL_OFFSET })) return;
      attempts += 1;
      if (attempts < 40) {
        window.setTimeout(tryScroll, 50);
      }
    }

    tryScroll();
    return () => {
      cancelled = true;
    };
  }, [pathname, hash]);

  return null;
}
