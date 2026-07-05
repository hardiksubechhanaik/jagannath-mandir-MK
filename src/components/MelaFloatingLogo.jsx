import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import styles from './MelaFloatingLogo.module.css';

const LOGO_SRC = '/mela-floating-logo.png';

/** Staff tools, auth, and mela entry (incl. loader) — no public floater. */
const HIDDEN_ON = new Set([
  '/rath-playground',
  '/login',
  '/rath-admin',
  '/volunteer',
  '/rath-wall-volunteer',
  '/picture-board-volunteer',
]);

/** Pages with a fixed control or long forms in the bottom-right — lift the floater. */
const LIFT_ON = new Set(['/rath-yatra-wall', '/prasad']);

function shouldHideFloater(pathname) {
  if (HIDDEN_ON.has(pathname)) return true;
  if (pathname.startsWith('/admin')) return true;
  return false;
}

export default function MelaFloatingLogo() {
  const { pathname } = useLocation();

  if (shouldHideFloater(pathname)) return null;

  const fabClass = LIFT_ON.has(pathname)
    ? `${styles.fab} ${styles.fabLifted}`
    : styles.fab;

  return createPortal(
    <Link
      to="/rath-playground"
      className={fabClass}
      aria-label="Enter the Ratha Yatra Mela Ground"
      title="Enter the Mela Ground"
    >
      <span className={styles.glow} aria-hidden="true" />
      <img
        src={LOGO_SRC}
        alt=""
        className={styles.logo}
        width={105}
        height={105}
        loading="lazy"
        decoding="async"
      />
      <span className={styles.label}>Rath Yatra Mela</span>
    </Link>,
    document.body,
  );
}
