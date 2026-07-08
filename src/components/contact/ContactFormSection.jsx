import { useState } from 'react';
import { adminPost, endpoints } from '../../api/client';
import FindUsCard from '../FindUsCard';
import IndianMobileInput from '../IndianMobileInput';
import { isValidIndianMobile } from '../../lib/indianMobile';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/contact.module.css';

const EMPTY_FORM = { name: '', email: '', mobile: '', message: '' };

export default function ContactFormSection() {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function validate(data) {
    const e = {};
    if (!data.name.trim()) e.name = t('forms.fullNameRequired');
    if (!data.email.trim()) e.email = t('forms.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = t('forms.emailInvalidLong');
    if (!data.message.trim()) e.message = t('forms.messageRequired');
    if (data.mobile.trim() && !isValidIndianMobile(data.mobile)) {
      e.mobile = t('forms.mobileInvalid');
    }
    return e;
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError('');

    try {
      await adminPost(endpoints.contactMessage, form);
      setSubmitted(true);
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err) {
      setSubmitError(err.message ?? t('forms.contactError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.formMapSection}>
      <div className={styles.formMapGrid}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{t('contact.formTitle')}</h2>
          <p className={styles.formSubtitle}>{t('contact.formSubtitle')}</p>

          {submitted ? (
            <div className={styles.successMsg}>
              <div className={styles.successIcon}>✓</div>
              <div className={styles.successText}>{t('forms.contactSuccess')}</div>
              <button className={styles.successReset} onClick={() => setSubmitted(false)}>
                {t('forms.sendAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="name">{t('forms.fullName')} *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('forms.namePlaceholder')}
                    value={form.name}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    autoComplete="name"
                  />
                  {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="email">{t('forms.email')} *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('forms.emailPlaceholder')}
                    value={form.email}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    autoComplete="email"
                  />
                  {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="mobile">{t('forms.mobile')}</label>
                <IndianMobileInput
                  id="mobile"
                  name="mobile"
                  placeholder={t('forms.phonePlaceholder')}
                  value={form.mobile}
                  onChange={handleChange}
                  className={styles.input}
                  hasError={Boolean(errors.mobile)}
                  errorClassName={styles.inputError}
                />
                {errors.mobile && <span className={styles.errMsg}>{errors.mobile}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="message">{t('forms.message')} *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder={t('forms.messagePlaceholder')}
                  value={form.message}
                  onChange={handleChange}
                  className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                />
                {errors.message && <span className={styles.errMsg}>{errors.message}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? t('forms.sending') : t('forms.sendMessage')}
              </button>
              {submitError && <span className={styles.errMsg}>{submitError}</span>}
            </form>
          )}
        </div>

        <FindUsCard heading={t('forms.findUs')} address={t('site.address')} />
      </div>
    </section>
  );
}
