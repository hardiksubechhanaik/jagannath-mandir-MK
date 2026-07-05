import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/liveDarshan.module.css';

export default function StatusBadge({ status }) {
  const { t } = useTranslation();

  if (status === 'live') {
    return (
      <span className={styles.badgeLive}>
        <span className={`${styles.liveDot} ${styles.liveDotSm}`} />
        {t('common.live')}
      </span>
    );
  }
  if (status === 'ended') {
    return <span className={styles.badgeEnded}>{t('common.ended')}</span>;
  }
  return <span className={styles.badgeUpcoming}>{t('common.upcoming')}</span>;
}
