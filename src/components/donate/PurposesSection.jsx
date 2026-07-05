import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/donate.module.css';

export default function PurposesSection() {
  const { t } = useTranslation();
  const purposes = t('donate.purposes', { object: true });

  return (
    <section className={styles.purposesSection}>
      <div className={styles.purposesInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>{t('donate.purposesEyebrow')}</div>
          <h2 className={styles.sectionH2}>{t('donate.purposesTitle')}</h2>
        </div>
        <div className={styles.purposesGrid}>
          {purposes.map((p) => (
            <div className={styles.purposeCard} key={p.title}>
              <div className={styles.purposeOdia}>{p.odia}</div>
              <h3 className={styles.purposeTitle}>{p.title}</h3>
              <p className={styles.purposeDesc}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
