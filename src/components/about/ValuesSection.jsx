import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/about.module.css';

export default function ValuesSection() {
  const { t } = useTranslation();
  const values = t('about.values', { object: true });

  return (
    <section className={styles.valuesSection}>
      <div className={styles.valuesSectionInner}>
        <div className={styles.valuesHeader}>
          <div className={styles.eyebrow}>{t('about.valuesEyebrow')}</div>
          <h2 className={styles.sectionH2} style={{ margin: 0 }}>
            {t('about.valuesTitle')}
          </h2>
        </div>
        <div className={styles.valuesGrid}>
          {values.map((v) => (
            <div className={styles.valueCard} key={v.title}>
              <div className={styles.valueOdia}>{v.odia}</div>
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueDesc}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
