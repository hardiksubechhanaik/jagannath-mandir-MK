import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/visit.module.css';

export default function DarshanGuidelinesSection() {
  const { t } = useTranslation();
  const doItems = t('visit.dos', { object: true });
  const dontItems = t('visit.donts', { object: true });

  return (
    <section className={styles.guidelinesSection}>
      <div className={styles.guidelinesInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>{t('visit.guidelinesEyebrow')}</div>
          <h2 className={styles.sectionH2Centered}>{t('visit.guidelinesTitle')}</h2>
        </div>
        <div className={styles.guidelinesGrid}>
          <div className={styles.doCard}>
            <div className={styles.doLabel}>{t('visit.pleaseDo')}</div>
            <ul className={styles.guideList}>
              {doItems.map((item) => (
                <li className={styles.doItem} key={item}>
                  <span className={styles.doCheck}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.dontCard}>
            <div className={styles.dontLabel}>{t('visit.pleaseAvoid')}</div>
            <ul className={styles.guideList}>
              {dontItems.map((item) => (
                <li className={styles.dontItem} key={item}>
                  <span className={styles.dontCross}>✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
