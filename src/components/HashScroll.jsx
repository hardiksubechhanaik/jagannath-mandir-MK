import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HASH_SCROLL_OFFSET, scrollToHash } from '../lib/scrollToHash';
import { forceScrollToTop } from '../lib/scrollNavigate';

/** Scroll to top on route change; scroll to hash target when URL has a #fragment. */
export default function HashScroll() {
  const { pathname, hash, search, key } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      let cancelled = false;
      let attempts = 0;

      function tryScroll() {
        if (cancelled) return;
        if (scrollToHash(hash, { offset: HASH_SCROLL_OFFSET, behavior: 'auto' })) return;
        attempts += 1;
        if (attempts < 40) {
          window.setTimeout(tryScroll, 50);
        }
      }

      tryScroll();
      return () => {
        cancelled = true;
      };
    }

    forceScrollToTop();
    return undefined;
  }, [pathname, hash, search, key]);

  return null;
}
