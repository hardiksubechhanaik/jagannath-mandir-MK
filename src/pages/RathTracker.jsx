import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import RathMap from '../components/rath/RathMap';
import RathRouteStats from '../components/rath/RathRouteStats';
import WeatherWidget from '../components/WeatherWidget';
import { apiGet, endpoints } from '../api/client';
import {
  RATH_POLL_MS,
  googleMapsDirectionsUrl,
  isRathLocationLive,
  secondsSinceUpdate,
} from '../lib/rathTracker';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/rathTracker.module.css';

const RATH_RIBBON = {
  statusDot: '#D62828',
  statusGlow: 'rgba(214,40,40,0.25)',
  statusText: 'Ratha Yatra live · follow the Rath on map',
  nextText: '16 JULY 2026 · ରଥଯାତ୍ରା',
};

export default function RathTracker() {
  const { t } = useTranslation();
  const [location, setLocation] = useState({ lat: null, lng: null, updatedAt: null });
  const [fetchError, setFetchError] = useState('');
  const [tick, setTick] = useState(0);

  const fetchLocation = useCallback(async () => {
    try {
      const data = await apiGet(endpoints.rathLocation);
      setLocation(data);
      setFetchError('');
    } catch (err) {
      setFetchError(err.message ?? t('rathTracker.fetchError'));
    }
  }, [t]);

  useEffect(() => {
    fetchLocation();
    const pollTimer = setInterval(fetchLocation, RATH_POLL_MS);
    return () => clearInterval(pollTimer);
  }, [fetchLocation]);

  useEffect(() => {
    const tickTimer = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(tickTimer);
  }, []);

  const live = isRathLocationLive(location.updatedAt);
  const secondsAgo = secondsSinceUpdate(location.updatedAt);
  const canNavigate = live && location.lat != null && location.lng != null;

  return (
    <PageShell className={styles.page} ribbon={RATH_RIBBON}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>{t('rathTracker.heroEyebrow')}</div>
          <div className={styles.heroOdia}>{t('rathTracker.heroOdia')}</div>
          <h1 className={styles.heroTitle}>{t('rathTracker.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>{t('rathTracker.heroSubtitle')}</p>

          <div className={styles.statusRow}>
            <span
              className={`${styles.statusBadge} ${live ? styles.statusLive : styles.statusInactive}`}
            >
              {live ? (
                <span className={styles.statusDotPulse} aria-hidden="true" />
              ) : null}
              {live ? t('rathTracker.statusLive') : t('rathTracker.statusInactive')}
            </span>
            <span className={styles.updatedText} key={tick}>
              {live && secondsAgo != null
                ? t('rathTracker.lastUpdated', { seconds: secondsAgo })
                : t('rathTracker.awaitingVolunteer')}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.mapSection}>
        <div className={styles.mapWrap}>
          <RathMap
            lat={location.lat}
            lng={location.lng}
            live={live}
            popupText={t('rathTracker.markerPopup')}
            refocusLabel={t('rathTracker.refocusRoute')}
          />
        </div>

        <RathRouteStats lat={location.lat} lng={location.lng} live={live} />

        <div className={styles.actions}>
          {canNavigate ? (
            <a
              href={googleMapsDirectionsUrl(location.lat, location.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navigateBtn}
            >
              {t('rathTracker.navigate')}
            </a>
          ) : (
            <button type="button" className={styles.navigateBtn} disabled>
              {t('rathTracker.navigateDisabled')}
            </button>
          )}
          <Link to="/live-darshan" className={styles.secondaryBtn}>
            {t('rathTracker.watchLive')}
          </Link>
        </div>

        {fetchError ? <p className={styles.errorText}>{fetchError}</p> : null}

        <div className={styles.weatherWrap}>
          <WeatherWidget />
        </div>
      </section>
    </PageShell>
  );
}
