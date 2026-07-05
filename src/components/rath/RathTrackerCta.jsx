import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/rathTrackerCta.module.css';

export default function RathTrackerCta() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-labelledby="rath-tracker-cta">
      <div className={styles.inner}>
        <div>
          <div className={styles.eyebrow}>{t('rathTracker.ctaEyebrow')}</div>
          <h2 id="rath-tracker-cta" className={styles.title}>
            {t('rathTracker.ctaTitle')}
          </h2>
          <p className={styles.body}>{t('rathTracker.ctaBody')}</p>
        </div>
        <Link to="/rath-tracker" className={styles.btn}>
          {t('rathTracker.ctaBtn')}
        </Link>
      </div>
    </section>
  );
}
