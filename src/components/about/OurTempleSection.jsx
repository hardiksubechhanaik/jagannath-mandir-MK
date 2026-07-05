import { ABOUT_IMAGES } from '../../data/about';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/about.module.css';

export default function OurTempleSection({ images = ABOUT_IMAGES }) {
  const { t } = useTranslation();

  return (
    <section className={styles.ourTemple}>
      <div className={styles.twoCol}>
        <div className={styles.textCol}>
          <div className={styles.eyebrow}>{t('about.ourTempleEyebrow')}</div>
          <h2 className={styles.sectionH2}>{t('about.ourTempleTitle')}</h2>
          <p className={styles.bodyText}>{t('about.ourTempleBody1')}</p>
          <p className={styles.bodyText}>{t('about.ourTempleBody2')}</p>
        </div>

        <div className={styles.photoPlaceholder}>
          <img
            src={images.innerSanctum.src}
            alt={t('about.innerSanctumAlt')}
            className={styles.sectionPhoto}
            style={{ objectPosition: images.innerSanctum.focus }}
          />
        </div>
      </div>
    </section>
  );
}
