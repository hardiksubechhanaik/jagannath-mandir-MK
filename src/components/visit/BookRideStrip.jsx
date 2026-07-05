import { RIDE_PROVIDERS, getRideHref } from '../../data/rideLinks';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/visit.module.css';

export default function BookRideStrip() {
  const { t } = useTranslation();

  return (
    <div className={styles.bookRide}>
      <div className={styles.bookRideHeader}>
        <div className={styles.bookRideEyebrow}>{t('visit.bookRideEyebrow')}</div>
        <h3 className={styles.bookRideTitle}>{t('visit.bookRideTitle')}</h3>
        <p className={styles.bookRideNote}>{t('visit.bookRideNote')}</p>
      </div>

      <div className={styles.rideGrid}>
        {RIDE_PROVIDERS.map((provider) => (
          <a
            key={provider.id}
            href={getRideHref(provider)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.rideBtn} ${styles[`rideBtn_${provider.style}`]}`}
          >
            <span className={styles.rideBtnLabel}>{provider.label}</span>
            <span className={styles.rideBtnAction}>{t('visit.bookRideCta')}</span>
            <span className={styles.rideBtnHint}>{provider.hint}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
