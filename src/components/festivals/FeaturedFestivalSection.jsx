import { Link } from 'react-router-dom';
import festivalsFallback from '../../data/festivals';
import { resolveMediaUrl } from '../../api/client';
import LiveIndicator from '../LiveIndicator';
import { addFestivalToCalendar } from '../../lib/addToCalendar';
import { filterUpcomingFestivals, sortFestivalsByDate } from '../../lib/festivalDates';
import { isRathYatraSeason } from '../../lib/rathSeason';
import { useTranslation } from '../../i18n/useTranslation';
import { translateWeekday } from '../../i18n/weekdays';
import styles from '../../styles/festivals.module.css';

export default function FeaturedFestivalSection({ festivals = festivalsFallback }) {
  const { t } = useTranslation();
  const upcoming = filterUpcomingFestivals(sortFestivalsByDate(festivals));
  const featured = upcoming.find((f) => f.featured) || upcoming[0];
  if (!featured) return null;

  const monthLabel = `${featured.month} ${featured.date?.slice(0, 4) || '2026'}`;
  const isRathaYatra =
    featured.date === '2026-07-16' || /ratha yatra/i.test(featured.name ?? '');

  const eventDescription =
    featured.descriptionLong || featured.description || t('festivals.rathaDescLong');
  const featuredImage = featured.image ? resolveMediaUrl(featured.image) : '';

  function handleAddToCalendar() {
    addFestivalToCalendar(featured, { description: eventDescription });
  }

  return (
    <section className={styles.featuredSection}>
      <div className={styles.featuredCard}>
        <div className={styles.featuredImg}>
          {featuredImage ? (
            <img
              src={featuredImage}
              alt={featured.name}
              className={styles.featuredPhoto}
            />
          ) : (
            <span className={styles.phLabelDark}>{t('festivals.featuredImageLabel')}</span>
          )}
        </div>
        <div className={styles.featuredBody}>
          <div className={styles.featuredEyebrow}>
            {t('festivals.featuredEyebrow', {
              day: featured.day,
              month: monthLabel,
              weekday: translateWeekday(featured.weekday, t),
            })}
          </div>
          {featured.odia && <div className={styles.featuredOdia}>{featured.odia}</div>}
          <h2 className={styles.featuredH2}>{featured.name}</h2>
          <p className={styles.featuredDesc}>{eventDescription}</p>
          <div className={styles.featuredBtns}>
            {isRathaYatra && isRathYatraSeason() ? (
              <Link to="/rath-tracker" className={styles.btnGold}>
                <LiveIndicator />
                {t('festivals.trackLiveRath')}
              </Link>
            ) : (
              <button type="button" className={styles.btnGold}>{t('festivals.featuredDetails')}</button>
            )}
            <button
              type="button"
              className={styles.btnOutlineGold}
              onClick={handleAddToCalendar}
            >
              {t('festivals.addToCalendar')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
