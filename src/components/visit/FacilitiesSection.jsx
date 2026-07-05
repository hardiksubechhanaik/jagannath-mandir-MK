import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/visit.module.css';

export default function FacilitiesSection() {
  const { t } = useTranslation();
  const items = t('visit.facilities', { object: true });

  return (
    <section className={styles.facilitiesSection}>
      <div className={styles.facilitiesInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>{t('visit.facilitiesEyebrow')}</div>
          <h2 className={styles.sectionH2Centered}>{t('visit.facilitiesTitle')}</h2>
        </div>
        <div className={styles.facilitiesGrid}>
          {items.map((f) => (
            <div className={styles.facilityCard} key={f.title}>
              <div className={styles.facilityIcon}>{f.glyph}</div>
              <div>
                <div className={styles.facilityTitle}>{f.title}</div>
                <div className={styles.facilityDesc}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
