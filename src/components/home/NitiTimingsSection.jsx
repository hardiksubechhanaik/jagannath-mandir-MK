import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { formatIndianDateRange } from '../../lib/indianDates.js';
import styles from '../../styles/home.module.css';

function buildFallbackNiti(t) {
  return {
    summer: t('niti.summer', { object: true }),
    winter: t('niti.winter', { object: true }),
  };
}

export default function NitiTimingsSection({ schedule }) {
  const { t } = useTranslation();
  const fallback = useMemo(() => buildFallbackNiti(t), [t]);

  const resolved = useMemo(() => {
    if (!schedule) {
      return {
        mode: 'seasonal',
        activeSeason: new Date().getMonth() + 1 >= 3 && new Date().getMonth() + 1 <= 9 ? 'summer' : 'winter',
        summer: fallback.summer,
        winter: fallback.winter,
        special: null,
      };
    }

    return {
      mode: schedule.mode === 'special' && schedule.special ? 'special' : 'seasonal',
      activeSeason: schedule.activeSeason === 'winter' ? 'winter' : 'summer',
      summer: schedule.summer?.length ? schedule.summer : fallback.summer,
      winter: schedule.winter?.length ? schedule.winter : fallback.winter,
      special: schedule.special ?? null,
    };
  }, [schedule, fallback]);

  const [season, setSeason] = useState(resolved.activeSeason);

  useEffect(() => {
    if (resolved.mode !== 'special') {
      setSeason(resolved.activeSeason);
    }
  }, [resolved.mode, resolved.activeSeason]);

  const isSpecial = resolved.mode === 'special' && resolved.special?.items?.length;
  const items = isSpecial
    ? resolved.special.items
    : (season === 'summer' ? resolved.summer : resolved.winter);

  const specialBanner = isSpecial ? (
    <div
      className={styles.specialScheduleBanner}
      style={resolved.special.accentColor ? {
        '--special-accent': resolved.special.accentColor,
        '--special-accent-soft': `${resolved.special.accentColor}22`,
      } : undefined}
    >
      <div className={styles.specialScheduleEyebrow}>Special schedule</div>
      <div className={styles.specialScheduleTitle}>
        {resolved.special.title}
        {resolved.special.titleOdia ? (
          <span className={styles.specialScheduleOdia}> · {resolved.special.titleOdia}</span>
        ) : null}
      </div>
      <div className={styles.specialScheduleDates}>
        {resolved.special.dateRangeDisplay
          || formatIndianDateRange(resolved.special.startDate, resolved.special.endDate)}
      </div>
      {resolved.special.note ? (
        <p className={styles.specialScheduleNote}>{resolved.special.note}</p>
      ) : (
        <p className={styles.specialScheduleNote}>
          The mandir is following a special timetable during this period.
        </p>
      )}
    </div>
  ) : null;

  return (
    <section id="timings" className={styles.timingsSection}>
      <div className={styles.timingsHeader}>
        <div className={styles.eyebrow}>{t('home.nitiEyebrow')}</div>
        <h2 className={styles.sectionH2}>{t('home.nitiTitle')}</h2>
        {!isSpecial ? (
          <div className={styles.seasonToggle}>
            <div
              className={`${styles.seasonBtn} ${season === 'summer' ? styles.seasonActive : ''}`}
              onClick={() => setSeason('summer')}
            >
              {t('home.summer')}
            </div>
            <div
              className={`${styles.seasonBtn} ${season === 'winter' ? styles.seasonActive : ''}`}
              onClick={() => setSeason('winter')}
            >
              {t('home.winter')}
            </div>
          </div>
        ) : null}
      </div>

      {specialBanner}

      <div className={styles.nitiGrid}>
        {items.map((n, index) => (
          <div className={styles.nitiCard} key={`${n.name}-${n.time}-${index}`}>
            <div className={styles.nitiTime}>{n.time}</div>
            <div className={styles.nitiName}>{n.name}</div>
            <div className={styles.nitiOdia}>{n.odia}</div>
            <div className={styles.nitiNote}>{n.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
