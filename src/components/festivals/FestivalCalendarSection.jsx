import festivalsFallback, { PANJIKA_META } from '../../data/festivals';
import { filterUpcomingFestivals, sortFestivalsByDate } from '../../lib/festivalDates';
import { useTranslation } from '../../i18n/useTranslation';
import { translateWeekday } from '../../i18n/weekdays';
import styles from '../../styles/festivals.module.css';

export default function FestivalCalendarSection({ festivals = festivalsFallback, panjika = PANJIKA_META }) {
  const { t } = useTranslation();
  const upcomingFestivals = filterUpcomingFestivals(sortFestivalsByDate(festivals));
  const meta = {
    title: panjika.title || t('festivals.meta.title'),
    source: panjika.source || t('festivals.meta.source'),
    period: panjika.period || t('festivals.meta.period'),
  };

  return (
    <section className={styles.calendarSection} aria-labelledby="festival-calendar-title">
      <div className={styles.calendarHeader}>
        <div>
          <div className={styles.eyebrow}>{meta.title}</div>
          <h2 id="festival-calendar-title" className={styles.calendarH2}>
            {t('festivals.calendarTitle')}
          </h2>
          <p className={styles.panjikaNote}>
            {t('festivals.panjikaNote', { source: meta.source, period: meta.period })}
          </p>
          <div className={styles.panjikaActions}>
            <a
              className={styles.panjikaDownload}
              href="/Shree-Mandira-Panjika-2026-27.pdf"
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('festivals.downloadPdf')}
            </a>
          </div>
        </div>
        <div className={styles.eventCount}>{t('festivals.eventsCount', { count: upcomingFestivals.length })}</div>
      </div>

      <div className={styles.calendarList}>
        {upcomingFestivals.map((f) => (
          <article className={styles.calendarRow} key={f.date + f.name}>
            <div className={styles.dateChip}>
              <div className={styles.dateDay}>{f.day}</div>
              <div className={styles.dateMonth}>{f.month}</div>
            </div>

            <div className={styles.rowBody}>
              {f.weekday && (
                <div className={styles.rowWeekday}>{translateWeekday(f.weekday, t)}</div>
              )}
              {f.odia && <div className={styles.rowOdia}>{f.odia}</div>}
              <h3 className={styles.rowName}>{f.name}</h3>
              <p className={styles.rowDesc}>{f.description || t('festivals.defaultDescription')}</p>
            </div>

            <time className={styles.rowDateIso} dateTime={f.date}>
              {f.date}
            </time>
          </article>
        ))}
      </div>
    </section>
  );
}
