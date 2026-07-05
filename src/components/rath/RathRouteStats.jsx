import { useMemo } from 'react';
import trackerMarkerImg from '../../assets/rath/tracker-marker.png';
import { RATH_ROUTE_WAYPOINTS } from '../../data/rathRoutePath.js';
import { RATH_YATRA_INFO } from '../../data/rathYatraInfo.js';
import {
  formatDistanceKm,
  formatDurationMinutes,
  getTrackProgressStats,
} from '../../lib/rathTracker.js';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/rathTracker.module.css';

const { trackLengthKm, processionSpeedKmh } = RATH_YATRA_INFO;

function StatTile({ label, value, note }) {
  return (
    <article className={styles.statTile}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {note ? <p className={styles.statNote}>{note}</p> : null}
    </article>
  );
}

export default function RathRouteStats({ lat, lng, live }) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const hasPosition = lat != null && lng != null;
    const useLive = live && hasPosition;

    const track = useLive
      ? getTrackProgressStats(
          RATH_ROUTE_WAYPOINTS,
          lat,
          lng,
          trackLengthKm,
          processionSpeedKmh,
        )
      : getTrackProgressStats(
          RATH_ROUTE_WAYPOINTS,
          null,
          null,
          trackLengthKm,
          processionSpeedKmh,
        );

    const fullDuration = formatDurationMinutes(track.totalMins) ?? '—';

    let etaValue = fullDuration;
    let etaNote = t('rathTracker.statsEtaScheduledNote', {
      time: RATH_YATRA_INFO.startTime,
      tz: RATH_YATRA_INFO.timezone,
    });

    if (useLive) {
      const formatted = formatDurationMinutes(track.remainingMins);
      etaValue = formatted ?? t('rathTracker.statsEtaSoon');
      etaNote = t('rathTracker.statsEtaLiveNote', {
        distance: formatDistanceKm(track.remainingKm),
      });
    }

    const progressPct = Math.round(track.fraction * 100);

    return {
      etaValue,
      etaNote,
      progressPct,
      traveledKm: track.traveledKm,
      remainingKm: track.remainingKm,
      useLive,
    };
  }, [lat, lng, live, t]);

  const progressNote = stats.useLive
    ? t('rathTracker.progressLive', {
        traveled: formatDistanceKm(stats.traveledKm),
        total: formatDistanceKm(trackLengthKm),
        remaining: formatDistanceKm(stats.remainingKm),
      })
    : t('rathTracker.progressAwaitingGps');

  return (
    <div className={styles.statsBlock}>
      <div className={styles.statsGrid} aria-label={t('rathTracker.statsAria')}>
        <StatTile
          label={t('rathTracker.statsStartLabel')}
          value={`${RATH_YATRA_INFO.startTime} ${RATH_YATRA_INFO.timezone}`}
          note={RATH_YATRA_INFO.dateLabel}
        />
        <StatTile
          label={t('rathTracker.statsRouteLabel')}
          value={formatDistanceKm(trackLengthKm)}
          note={t('rathTracker.statsRouteNote')}
        />
        <StatTile
          label={t('rathTracker.statsAreaLabel')}
          value={RATH_YATRA_INFO.area}
          note={t('rathTracker.statsAreaNote')}
        />
        <StatTile
          label={t('rathTracker.statsEtaLabel')}
          value={stats.etaValue}
          note={stats.etaNote}
        />
      </div>

      <div
        className={styles.progressSection}
        aria-label={t('rathTracker.progressAria')}
      >
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>{t('rathTracker.progressLabel')}</span>
          <span className={styles.progressPct}>
            {stats.useLive ? `${stats.progressPct}%` : '—'}
          </span>
        </div>
        <div className={styles.progressTrackWrap}>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.useLive ? stats.progressPct : 0}
            aria-label={t('rathTracker.progressLabel')}
          >
            <div
              className={`${styles.progressFill} ${stats.useLive ? styles.progressFillLive : ''}`}
              style={{ width: stats.useLive ? `${stats.progressPct}%` : '0%' }}
            />
            <div
              className={styles.progressRath}
              style={{
                left: stats.useLive
                  ? `clamp(14px, ${stats.progressPct}%, calc(100% - 14px))`
                  : '14px',
              }}
              aria-hidden="true"
            >
              <img src={trackerMarkerImg} alt="" />
            </div>
          </div>
        </div>
        <p className={styles.progressNote}>{progressNote}</p>
      </div>
    </div>
  );
}
