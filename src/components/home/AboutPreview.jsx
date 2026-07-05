import { Link } from 'react-router-dom';
import { TEMPLE_IMAGES } from '../../data/home';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/home.module.css';

export default function AboutPreview({ templeImages = TEMPLE_IMAGES }) {
  const { t } = useTranslation();

  return (
    <section className={styles.about}>
      <div className={styles.aboutGrid}>
        <div className={styles.aboutImgPlaceholder}>
          <img
            src={templeImages.shikhara}
            alt={t('home.aboutImgAlt')}
            className={styles.aboutImg}
          />
        </div>
        <div className={styles.aboutText}>
          <div className={styles.eyebrow}>{t('home.aboutEyebrow')}</div>
          <h2 className={styles.sectionH2}>{t('home.aboutTitle')}</h2>
          <p className={styles.bodyText}>{t('home.aboutBody1')}</p>
          <p className={styles.bodyText} style={{ marginBottom: 28 }}>{t('home.aboutBody2')}</p>
          <Link to="/about" className={styles.btnPrimaryDark}>{t('home.aboutCta')}</Link>
        </div>
      </div>
    </section>
  );
}
