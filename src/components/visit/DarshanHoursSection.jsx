import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/visit.module.css';

export default function DarshanHoursSection() {
  const { t } = useTranslation();
  const items = t('visit.hours', { object: true });

  return (
    <section id="timings" className={styles.hoursSection}>
      <div className={styles.hoursGrid}>
        <div className={styles.hoursText}>
          <div className={styles.eyebrow}>{t('visit.hoursEyebrow')}</div>
          <h2 className={styles.sectionH2}>{t('visit.hoursTitle')}</h2>
          <p className={styles.bodyText}>{t('visit.hoursBody')}</p>
          <Link to="/#timings" className={styles.btnOutlineMaroon}>
            {t('visit.hoursCta')}
          </Link>
        </div>
        <div className={styles.hoursCard}>
          {items.map((h, i) => (
            <div className={styles.hoursRow} key={h.name} style={i === 0 ? { borderTop: 'none' } : {}}>
              <div>
                <div className={styles.hoursName}>{h.name}</div>
                <div className={styles.hoursOdia}>{h.odia}</div>
              </div>
              <div className={styles.hoursTime}>{h.time}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
