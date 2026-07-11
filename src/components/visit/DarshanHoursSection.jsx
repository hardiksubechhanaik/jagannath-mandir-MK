import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/visit.module.css';

function resolveActiveSchedule(niti, t) {
  if (niti?.mode === 'special' && niti?.special) {
    return {
      kind: 'special',
      label: t('visit.scheduleSpecial'),
      detail: niti.special.title || '',
    };
  }

  const season = niti?.activeSeason === 'winter' ? 'winter' : 'summer';
  return {
    kind: season,
    label: season === 'winter' ? t('visit.scheduleWinter') : t('visit.scheduleSummer'),
    detail: season === 'winter' ? t('home.winter') : t('home.summer'),
  };
}

export default function DarshanHoursSection({ hours, niti }) {
  const { t } = useTranslation();
  const fallbackItems = t('visit.hours', { object: true });
  const items = hours?.length ? hours : fallbackItems;
  const schedule = useMemo(() => resolveActiveSchedule(niti, t), [niti, t]);

  return (
    <section id="timings" className={styles.hoursSection}>
      <div className={styles.hoursGrid}>
        <div className={styles.hoursText}>
          <div className={styles.eyebrow}>{t('visit.hoursEyebrow')}</div>
          <h2 className={styles.sectionH2}>{t('visit.hoursTitle')}</h2>
          <p className={styles.bodyText}>{t('visit.hoursBody')}</p>
          <Link to="/#timings" className={styles.btnOutlineMaroon}>
            {t('visit.hoursCta')}
          </Link>
        </div>
        <div className={styles.hoursCard}>
          <div
            className={`${styles.hoursScheduleBanner} ${
              schedule.kind === 'special' ? styles.hoursScheduleBannerSpecial : ''
            }`.trim()}
          >
            <div className={styles.hoursScheduleEyebrow}>{t('visit.scheduleFollowing')}</div>
            <div className={styles.hoursScheduleTitle}>{schedule.label}</div>
            {schedule.detail ? (
              <div className={styles.hoursScheduleDetail}>{schedule.detail}</div>
            ) : null}
          </div>
          {items.map((h, i) => (
            <div className={styles.hoursRow} key={`${h.name}-${h.time}`} style={i === 0 ? { borderTop: 'none' } : {}}>
              <div>
                <div className={styles.hoursName}>{h.name}</div>
                <div className={styles.hoursOdia}>{h.odia}</div>
              </div>
              <div className={styles.hoursTime}>{h.time}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
