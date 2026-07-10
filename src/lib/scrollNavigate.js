import { flushSync } from 'react-dom';
import { scrollToTop } from './scrollToTop';

/** Repeated scroll-to-top to beat layout shifts and browser restoration. */
export function forceScrollToTop() {
  scrollToTop();
  window.requestAnimationFrame(scrollToTop);
  window.setTimeout(scrollToTop, 0);
  window.setTimeout(scrollToTop, 50);
  window.setTimeout(scrollToTop, 150);
  window.setTimeout(scrollToTop, 300);
}

function isModifiedClick(event) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function resolvePath(to) {
  if (typeof to === 'string') return to;
  if (to && typeof to === 'object' && typeof to.pathname === 'string') {
    return `${to.pathname}${to.search ?? ''}${to.hash ?? ''}`;
  }
  return '/';
}

/**
 * Navigate via React Router and force the viewport to the top.
 * Returns true when navigation was handled here (caller should not rely on <Link> default).
 */
export function scrollNavigate(navigate, to, event) {
  if (event && isModifiedClick(event)) return false;

  const target = resolvePath(to);
  if (target.includes('#')) return false;

  const nextUrl = new URL(target, window.location.origin);
  const next = `${nextUrl.pathname}${nextUrl.search}`;
  const current = `${window.location.pathname}${window.location.search}`;
  if (next === current) {
    if (event) {
      event.preventDefault();
      forceScrollToTop();
    }
    return true;
  }

  if (event) {
    event.preventDefault();
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.blur();
    }
  }
  forceScrollToTop();
  flushSync(() => {
    navigate(next);
  });
  forceScrollToTop();
  return true;
}
