import { useState } from 'react';
import { apiPost, endpoints } from '../../api/client';
import { isValidIndianMobile, looksLikeEmail, sanitizeIndianMobileInput } from '../../lib/indianMobile';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/liveDarshan.module.css';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
}

export default function NotifyBand() {
  const { t } = useTranslation();
  const [notify, setNotify] = useState('');
  const [notified, setNotified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function handleContactChange(event) {
    const { value } = event.target;
    if (looksLikeEmail(value) || /[a-zA-Z]/.test(value)) {
      setNotify(value);
      return;
    }
    setNotify(sanitizeIndianMobileInput(value));
    if (submitError) setSubmitError('');
  }

  async function handleNotify(e) {
    e.preventDefault();
    const contact = notify.trim();
    if (!contact) return;

    if (looksLikeEmail(contact)) {
      if (!isValidEmail(contact)) {
        setSubmitError(t('forms.emailInvalid'));
        return;
      }
    } else if (!isValidIndianMobile(contact)) {
      setSubmitError(t('forms.mobileInvalid'));
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await apiPost(endpoints.liveNotify, { contact });
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
              onChange={handleContactChange}
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
