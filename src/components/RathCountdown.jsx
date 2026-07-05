import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LiveIndicator from './LiveIndicator';
import styles from './RathCountdown.module.css';

const RATH_DATE = new Date('2026-07-16T00:00:00+05:30').getTime();

const TIMER_UNITS = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

function getCountdown(now) {
  const diff = Math.max(0, RATH_DATE - now);
  return {
    diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function RathCountdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => getCountdown(now), [now]);
  const isLive = countdown.diff === 0;

  const values = {
    days: pad(countdown.days),
    hours: pad(countdown.hours),
    minutes: pad(countdown.minutes),
    seconds: pad(countdown.seconds),
  };

  return (
    <section className={styles.section} aria-labelledby="rath-countdown-heading">
      <div className={styles.glowRed} aria-hidden="true" />
      <div className={styles.glowGold} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.odia}>ରଥଯାତ୍ରା ୨୦୨୬</p>

        <h2 id="rath-countdown-heading" className={styles.heading}>
          {isLive ? 'Ratha Yatra is here!' : 'Countdown to Ratha Yatra'}
        </h2>

        <p className={styles.subtext}>
          {isLive ? (
            <>The chariots are rolling — join us at the Mandir or follow live.</>
          ) : (
            <>
              The chariots roll on <strong>16 July 2026</strong> — join us at the Mandir or follow live.
            </>
          )}
        </p>

        <div className={styles.timerRow} role="timer" aria-live="polite" aria-atomic="true">
          {TIMER_UNITS.map(({ key, label }) => (
            <article key={key} className={styles.tile} aria-label={`${values[key]} ${label}`}>
              <p className={styles.tileValue}>{values[key]}</p>
              <p className={styles.tileLabel}>{label}</p>
            </article>
          ))}
        </div>

        <div className={styles.actions}>
          <Link to="/rath-tracking" className={styles.btnPrimary}>
            <LiveIndicator />
            Track the Rath live
          </Link>
          <Link to="/festivals" className={styles.btnOutline}>
            Festival details →
          </Link>
        </div>
      </div>
    </section>
  );
}
