import { useMemo } from 'react';
import {
  getNextRitualInfo,
  getTodayBandInfo,
  getTodayDisplayDate,
} from '../../lib/todayBand';
import useIstClock from '../../hooks/useIstClock';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/home.module.css';

function scrollToTimings() {
  const el = document.getElementById('timings');
  if (el) {
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth',
    });
  }
}

export default function TodayBand() {
  const { t } = useTranslation();
  const now = useIstClock();

  const todayInfo = useMemo(() => getTodayBandInfo(now), [now]);
  const nextRitual = useMemo(() => getNextRitualInfo(now), [now]);

  return (
    <section className={styles.todayBand}>
      <div className={styles.todayInner}>
        <div className={styles.todayCol} style={{ borderRight: '1px solid rgba(231,195,106,0.22)' }}>
          <div className={styles.todayLabel}>
            {t('home.today', { date: getTodayDisplayDate() })}
          </div>
          <div className={styles.todayVal}>{todayInfo.title}</div>
          <div className={styles.todayNote}>{todayInfo.note}</div>
        </div>
        <div className={styles.todayCol} style={{ borderRight: '1px solid rgba(231,195,106,0.22)' }}>
          <div className={styles.todayLabel}>{t('home.nextRitual')}</div>
          <div className={styles.todayVal}>{nextRitual.name}</div>
          <div className={styles.todayNote}>{nextRitual.when}</div>
        </div>
        <div className={styles.todayCol}>
          <button type="button" className={styles.todayBtn} onClick={scrollToTimings}>
            {t('home.seeSchedule')}
          </button>
        </div>
      </div>
    </section>
  );
}
