import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { getUpcomingFestivals } from '../../lib/todayBand';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/home.module.css';

export default function FestivalPreviewSection() {
  const { t } = useTranslation();
  const festivals = useMemo(() => getUpcomingFestivals(3), []);

  return (
    <section className={styles.festivalsSection}>
      <div className={styles.festivalsHeader}>
        <div>
          <div className={styles.eyebrow}>{t('home.festivalsEyebrow')}</div>
          <h2 className={styles.sectionH2} style={{ margin: 0 }}>{t('home.festivalsTitle')}</h2>
        </div>
        <Link to="/festivals" className={styles.btnOutlineMaroon}>{t('home.festivalsCta')}</Link>
      </div>
      <div className={styles.festivalsGrid}>
        {festivals.map((f) => (
          <div className={styles.festivalCard} key={f.id}>
            <div className={styles.festivalBody}>
              <div className={styles.festivalDate}>{f.date}</div>
              <div className={styles.festivalName}>{f.name}</div>
              {f.desc ? <div className={styles.festivalDesc}>{f.desc}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
