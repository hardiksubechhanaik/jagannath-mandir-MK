import { useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import {
  getGpsState,
  startGpsSharing,
  stopGpsSharing,
  subscribeGps,
} from '../../lib/rathGpsTracker';
import { getVolunteerSession } from '../../lib/rathWallSession';
import styles from '../../styles/rathAdmin.module.css';

export default function RathGpsPanel() {
  const { sharing, coords, geoError, sendError, lastSent } = useSyncExternalStore(
    subscribeGps,
    getGpsState,
  );

  const hasSession = Boolean(getVolunteerSession());

  if (!hasSession) {
    return (
      <div className={styles.card}>
        <p className={styles.error}>Volunteer session missing. Sign out and sign in again.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.statusLine}>
        <span className={`${styles.statusPill} ${sharing ? styles.statusOn : styles.statusOff}`}>
          {sharing ? 'Sharing Live ✅' : 'Stopped ❌'}
        </span>
        <Link to="/rath-tracker" className={styles.linkBtn}>
          View public map →
        </Link>
      </div>

      <div className={styles.coords}>
        <div>
          <span className={styles.coordLabel}>Latitude</span>
          <span className={styles.coordVal}>
            {coords.lat != null ? coords.lat.toFixed(6) : '—'}
          </span>
        </div>
        <div>
          <span className={styles.coordLabel}>Longitude</span>
          <span className={styles.coordVal}>
            {coords.lng != null ? coords.lng.toFixed(6) : '—'}
          </span>
        </div>
      </div>

      {lastSent ? (
        <p className={styles.meta}>
          Last sent{' '}
          {lastSent.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })}
        </p>
      ) : null}

      {geoError ? <p className={styles.error}>{geoError}</p> : null}
      {sendError ? <p className={styles.error}>{sendError}</p> : null}

      {!sharing ? (
        <button type="button" className={styles.primaryBtn} onClick={startGpsSharing}>
          START SHARING LOCATION
        </button>
      ) : (
        <button type="button" className={styles.stopBtn} onClick={stopGpsSharing}>
          STOP SHARING
        </button>
      )}

      <p className={styles.hint}>
        Location keeps sharing while you use other volunteer tabs. Stop manually or tap Sign out to end.
        Position is sent every 10 seconds.
      </p>
    </div>
  );
}
