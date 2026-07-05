import { useState } from 'react';
import { apiPost, endpoints } from '../../api/client';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/liveDarshan.module.css';

export default function NotifyBand() {
  const { t } = useTranslation();
  const [notify, setNotify] = useState('');
  const [notified, setNotified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function handleNotify(e) {
    e.preventDefault();
    if (!notify.trim()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await apiPost(endpoints.liveNotify, { contact: notify });
      setNotified(true);
      setNotify('');
    } catch (err) {
      setSubmitError(err.message ?? t('forms.notifyError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.notifySection}>
      <div className={styles.notifyInner}>
        <div className={styles.notifyLeft}>
          <h2 className={styles.notifyH2}>{t('live.notifyTitle')}</h2>
          <p className={styles.notifyBody}>{t('live.notifyBody')}</p>
        </div>
        {notified ? (
          <div className={styles.notifyConfirm}>{t('live.notifySuccess')}</div>
        ) : (
          <form className={styles.notifyForm} onSubmit={handleNotify} noValidate>
            <input
              type="text"
              className={styles.notifyInput}
              placeholder={t('live.notifyPlaceholder')}
              value={notify}
              onChange={(e) => setNotify(e.target.value)}
              aria-label={t('live.notifyAria')}
            />
            <button type="submit" className={styles.notifyBtn} disabled={submitting}>
              {submitting ? t('forms.subscribing') : t('common.notifyMe')}
            </button>
            {submitError && <div className={styles.notifyConfirm}>{submitError}</div>}
          </form>
        )}
      </div>
    </section>
  );
}
