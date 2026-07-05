import { useTranslation } from '../../i18n/useTranslation';
import { GLANCE_ICONS } from './GlanceIcons';
import styles from '../../styles/visit.module.css';

export default function AtAGlanceSection() {
  const { t } = useTranslation();
  const items = t('visit.glance', { object: true });

  return (
    <section className={styles.glanceSection}>
      <div className={styles.glanceGrid}>
        {items.map((g, index) => {
          const Icon = GLANCE_ICONS[index];
          return (
            <div className={styles.glanceCard} key={g.label}>
              {Icon ? (
                <div className={styles.glanceIconWrap}>
                  <Icon className={styles.glanceIcon} />
                </div>
              ) : null}
              <div className={styles.glanceLabel}>{g.label}</div>
              <div className={styles.glanceValue}>{g.value}</div>
              <div className={styles.glanceNote}>{g.note}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
