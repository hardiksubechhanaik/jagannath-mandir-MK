import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';

export default function PageShell({ active, className, children, ribbon, ribbonExtra }) {
  return (
    <div className={className}>
      <SiteHeader ribbon={ribbon} ribbonExtra={ribbonExtra} />
      {children}
      <SiteFooter />
    </div>
  );
}
