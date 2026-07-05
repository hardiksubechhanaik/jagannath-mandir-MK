import { ABOUT_IMAGES } from '../../data/about';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/about.module.css';

export default function TraditionSection({ images = ABOUT_IMAGES }) {
  const { t } = useTranslation();

  return (
    <section className={styles.traditionSection}>
      <div className={styles.twoColReverse}>
        <div className={`${styles.photoPlaceholder} ${styles.photoTint}`}>
          <img
            src={images.shikhara.src}
            alt={t('about.shikharaAlt')}
            className={styles.sectionPhoto}
            style={{ objectPosition: images.shikhara.focus }}
          />
        </div>

        <div className={styles.textCol}>
          <div className={styles.eyebrow}>{t('about.traditionEyebrow')}</div>
          <h2 className={styles.sectionH2}>{t('about.traditionTitle')}</h2>
          <p className={styles.bodyText}>{t('about.traditionBody1')}</p>
          <p className={styles.bodyText}>{t('about.traditionBody2')}</p>
        </div>
      </div>
    </section>
  );
}
