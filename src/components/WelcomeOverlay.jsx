import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../api/client';
import TempleLogo from './TempleLogo';
import styles from './WelcomeOverlay.module.css';

const STORAGE_KEY = 'mandir_welcomed';
const ENTRANCE_DELAY_MS = 350;
const EXIT_DURATION_MS = 420;

function hasWelcomedThisSession() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markWelcomedThisSession() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* private browsing — ignore */
  }
}

function PopupImage({ image }) {
  const src = resolveMediaUrl(image.url);
  if (!src) return null;

  const alt = image.alt || image.caption || 'Mandir announcement';
  const img = (
    <img
      src={src}
      alt={alt}
      className={styles.posterImage}
      loading="eager"
    />
  );

  if (image.linkUrl) {
    const safeLink = image.linkUrl.startsWith('/')
      ? image.linkUrl
      : (() => {
        try {
          const parsed = new URL(image.linkUrl);
          if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.toString();
        } catch {
          return null;
        }
        return null;
      })();
    if (safeLink) {
      const external = safeLink.startsWith('http');
      return (
        <a
          href={safeLink}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={styles.posterLink}
          aria-label={alt}
        >
          {img}
        </a>
      );
    }
  }

  return <div className={styles.posterLink}>{img}</div>;
}

export default function WelcomeOverlay({
  status = 'Open now — darshan in progress',
  config,
}) {
  const enabled = config?.enabled === true;
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const backdropRef = useRef(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const enterButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const exitTimerRef = useRef(null);

  const images = Array.isArray(config?.images) ? config.images : [];
  const showPromo = Boolean(
    config?.eyebrow || config?.heading || config?.subline || images.length,
  );

  const dismiss = useCallback(() => {
    if (closing) return;
    markWelcomedThisSession();
    setClosing(true);
    exitTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, EXIT_DURATION_MS);
  }, [closing]);

  useEffect(() => {
    if (!enabled || hasWelcomedThisSession()) return undefined;

    const entranceTimer = window.setTimeout(() => {
      setVisible(true);
    }, ENTRANCE_DELAY_MS);

    return () => window.clearTimeout(entranceTimer);
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || closing) return undefined;

    previousFocusRef.current = document.activeElement;
    const focusTimer = window.requestAnimationFrame(() => {
      enterButtonRef.current?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const items = Array.from(focusable);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [visible, closing, dismiss]);

  function handleBackdropClick(event) {
    if (event.target === backdropRef.current) {
      dismiss();
    }
  }

  if (!enabled || !visible) return null;

  return (
    <div
      ref={backdropRef}
      className={`${styles.backdrop} ${closing ? styles.backdropClosing : styles.backdropOpen}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Shree Jagannath Mandir"
        className={`${styles.card} ${closing ? styles.cardClosing : styles.cardOpen}`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeBtn}
          aria-label="Close welcome message"
          onClick={dismiss}
        >
          ✕
        </button>

        <div className={styles.logoWrap}>
          <TempleLogo
            className={styles.logoImage}
            size={88}
            alt="Shree Jagannath Mandir"
          />
        </div>

        <p className={styles.odiaGreeting}>ଜୟ ଜଗନ୍ନାଥ</p>

        <h2 className={styles.heading}>
          Welcome to
          <br />
          Shree Jagannath Mandir
        </h2>

        <p className={styles.bodyCopy}>
          May the Lord&apos;s darshan bring you peace. Take a moment to arrive before you explore.
        </p>

        <div className={styles.statusPill}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span className={styles.statusText}>{status}</span>
        </div>

        {showPromo ? (
          <section className={styles.promoSection} aria-labelledby="welcome-promo-heading">
            {config.eyebrow ? <p className={styles.promoEyebrow}>{config.eyebrow}</p> : null}
            {config.heading ? (
              <h3 id="welcome-promo-heading" className={styles.promoHeading}>
                {config.heading}
              </h3>
            ) : null}
            {config.subline ? <p className={styles.promoSubline}>{config.subline}</p> : null}

            {images.length ? (
              <div className={styles.posterStack}>
                {images.map((image, index) => (
                  <div key={`${image.url}-${index}`}>
                    {image.caption ? (
                      <p className={styles.posterCaption}>{image.caption}</p>
                    ) : null}
                    <PopupImage image={image} />
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <button
          ref={enterButtonRef}
          type="button"
          className={styles.enterBtn}
          onClick={dismiss}
        >
          Enter the Mandir ✦
        </button>
      </div>
    </div>
  );
}
