/** Scroll the viewport to the top (works across browsers / overflow setups). */
export function scrollToTop() {
  const scrollingElement = document.scrollingElement;
  if (scrollingElement) {
    scrollingElement.scrollTop = 0;
  }

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const root = document.getElementById('root');
  if (root) {
    root.scrollTop = 0;
  }
}

/** Call once on app boot so the browser does not restore old scroll positions. */
export function disableAutomaticScrollRestoration() {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
}

/** Force scroll-to-top after SPA navigations (capture-phase link clicks + history). */
export function setupScrollOnNavigate() {
  disableAutomaticScrollRestoration();

  function scheduleScrollToTop() {
    scrollToTop();
    window.requestAnimationFrame(scrollToTop);
    window.setTimeout(scrollToTop, 0);
    window.setTimeout(scrollToTop, 50);
    window.setTimeout(scrollToTop, 150);
    window.setTimeout(scrollToTop, 300);
  }

  function shouldScrollForUrl(url) {
    if (url.origin !== window.location.origin) return false;
    if (url.hash) return false;
    const next = `${url.pathname}${url.search}`;
    const current = `${window.location.pathname}${window.location.search}`;
    return next !== current;
  }

  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      if (shouldScrollForUrl(url)) {
        scheduleScrollToTop();
      }
    },
    true,
  );

  window.addEventListener('popstate', () => {
    if (!window.location.hash) {
      scheduleScrollToTop();
    }
  });
}
