import { useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/home.module.css';

export default function NitiTimingsSection() {
  const { t } = useTranslation();
  const niti = useMemo(
    () => ({
      summer: t('niti.summer', { object: true }),
      winter: t('niti.winter', { object: true }),
    }),
    [t],
  );

  const [season, setSeason] = useState(() => {
    const month = new Date().getMonth() + 1;
    return month >= 3 && month <= 9 ? 'summer' : 'winter';
  });

  const items = season === 'summer' ? niti.summer : niti.winter;

  return (
    <section id="timings" className={styles.timingsSection}>
      <div className={styles.timingsHeader}>
        <div className={styles.eyebrow}>{t('home.nitiEyebrow')}</div>
        <h2 className={styles.sectionH2}>{t('home.nitiTitle')}</h2>
        <div className={styles.seasonToggle}>
          <div
            className={`${styles.seasonBtn} ${season === 'summer' ? styles.seasonActive : ''}`}
            onClick={() => setSeason('summer')}
          >
            {t('home.summer')}
          </div>
          <div
            className={`${styles.seasonBtn} ${season === 'winter' ? styles.seasonActive : ''}`}
            onClick={() => setSeason('winter')}
          >
            {t('home.winter')}
          </div>
        </div>
      </div>

      <div className={styles.nitiGrid}>
        {items.map((n) => (
          <div className={styles.nitiCard} key={`${n.time}-${n.name}`}>
            <div className={styles.nitiTime}>{n.time}</div>
            <div className={styles.nitiName}>{n.name}</div>
            <div className={styles.nitiOdia}>{n.odia}</div>
            <div className={styles.nitiNote}>{n.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
