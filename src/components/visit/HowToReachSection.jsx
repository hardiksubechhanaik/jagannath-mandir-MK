import FindUsCard from '../FindUsCard';
import ReachModeIcon from './ReachModeIcon';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/visit.module.css';

function ReachCardBody({ item }) {
  if (Array.isArray(item.steps) && item.steps.length > 0) {
    return (
      <ol className={styles.reachSteps}>
        {item.steps.map((step, index) => (
          <li key={step} className={styles.reachStep}>
            <span className={styles.reachStepNum}>{index + 1}</span>
            <span className={styles.reachStepText}>{step}</span>
          </li>
        ))}
      </ol>
    );
  }

  return <p className={styles.reachDesc}>{item.desc}</p>;
}

export default function HowToReachSection() {
  const { t } = useTranslation();
  const items = t('visit.reach', { object: true });

  return (
    <section className={styles.reachSection}>
      <div className={styles.reachInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>{t('visit.reachEyebrow')}</div>
          <h2 className={styles.sectionH2Centered}>{t('visit.reachTitle')}</h2>
        </div>

        <div className={styles.reachGrid}>
          {items.map((r) => (
            <div className={styles.reachCard} key={r.id || r.mode}>
              <div className={styles.reachModeRow}>
                <ReachModeIcon id={r.id} />
                <h3 className={styles.reachMode}>{r.mode}</h3>
              </div>
              <ReachCardBody item={r} />
            </div>
          ))}
        </div>

        <FindUsCard />
      </div>
    </section>
  );
}
