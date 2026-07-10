import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { forceScrollToTop } from '../../lib/scrollNavigate';
import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';

export default function PageShell({ active, className, children, ribbon, ribbonExtra }) {
  const topRef = useRef(null);
  const { pathname, hash, search, key } = useLocation();

  useLayoutEffect(() => {
    if (hash) return undefined;

    forceScrollToTop();
    topRef.current?.focus({ preventScroll: true });
    return undefined;
  }, [pathname, hash, search, key]);

  return (
    <div className={className}>
      <div ref={topRef} tabIndex={-1} className="visually-hidden" aria-hidden="true" />
      <SiteHeader ribbon={ribbon} ribbonExtra={ribbonExtra} />
      {children}
      <SiteFooter />
    </div>
  );
}
