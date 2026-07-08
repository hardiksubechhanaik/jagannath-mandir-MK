import { useEffect, useState } from 'react';
import styles from './MandirLoader.module.css';

const STORAGE_KEY = 'mandir_loader_seen';
const DISPLAY_MS = 2000;
const FADE_MS = 420;

function hasSeenLoaderThisSession() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markLoaderSeenThisSession() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** True when the visitor arrived from outside this site (web link, search, or direct URL). */
function isExternalWebEntry() {
  const nav = performance.getEntriesByType('navigation')[0];
  if (nav?.type === 'reload' || nav?.type === 'back_forward') {
    return false;
  }

  const referrer = document.referrer;
  if (!referrer) return true;

  try {
    return new URL(referrer).origin !== window.location.origin;
  } catch {
    return true;
  }
}

function shouldShowLoader() {
  if (hasSeenLoaderThisSession()) return false;
  return isExternalWebEntry();
}

export default function MandirLoader() {
  const [phase, setPhase] = useState(() => (shouldShowLoader() ? 'visible' : 'done'));

  useEffect(() => {
    if (phase !== 'visible') return undefined;

    document.body.style.overflow = 'hidden';

    const fadeTimer = window.setTimeout(() => {
      setPhase('closing');
    }, DISPLAY_MS);

    const doneTimer = window.setTimeout(() => {
      markLoaderSeenThisSession();
      setPhase('done');
      document.body.style.overflow = '';
    }, DISPLAY_MS + FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = '';
    };
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      className={`${styles.overlay} ${phase === 'closing' ? styles.overlayClosing : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading temple website"
    >
      <img
        src="/images/loader-mandir-logo.png"
        alt="Shree Jagannath Mandir"
        className={`${styles.logo} ${styles.mandirLogo}`}
      />
      <img
        src="/images/loader-yatra-logo.png"
        alt="Ratha Yatra"
        className={`${styles.logo} ${styles.yatraLogo}`}
      />

      <div className={styles.loading}>
        <p>&quot;Awakening the Eternal Embrace...&quot;</p>
      </div>

      <div className={styles.eyes} aria-hidden="true">
        <div className={styles.eye}>
          <div className={styles.eyeWhite}>
            <div className={styles.pupil} />
          </div>
        </div>
        <div className={styles.eye}>
          <div className={styles.eyeWhite}>
            <div className={styles.pupil} />
          </div>
        </div>
      </div>

      <div className={styles.text}>
        <div className={styles.odiatext}>
          <h1>|| ଜଗନ୍ନାଥ ସ୍ୱାମୀ ନୟନପଥଗାମୀ ଭବତୁ ମେ ||</h1>
          <div className={styles.meaning}>
            <h2>“Jagannath Swami Nayana Patha Gami Bhaba Tume”</h2>
          </div>
        </div>
        <div className={styles.quote}>
          <p>O Lord of the Universe (Jagannath), may You be the destination of my eyes</p>
        </div>
      </div>

      <p className={styles.footer}>
        © 2026 Shree Jagannath Mandir Trust Maruti Kunj, All rights reserved
      </p>
    </div>
  );
}
