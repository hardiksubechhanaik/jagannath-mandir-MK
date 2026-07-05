import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/pageLoading.module.css';

export default function PageLoading() {
  const { t } = useTranslation();

  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-label={t('common.loadingPage')}>
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.text}>{t('common.loading')}</p>
    </div>
  );
}

export function PageError({ message, onRetry }) {
  const { t } = useTranslation();

  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.errorText}>{message ?? t('common.pageError')}</p>
      {onRetry && (
        <button type="button" className={styles.retryBtn} onClick={onRetry}>
          {t('common.tryAgain')}
        </button>
      )}
    </div>
  );
}
