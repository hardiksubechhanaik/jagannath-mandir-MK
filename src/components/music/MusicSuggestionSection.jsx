import { useState } from 'react';
import { adminPost, endpoints } from '../../api/client';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/devotionalMusic.module.css';

const EMPTY_FORM = {
  title: '',
  youtubeUrl: '',
  suggesterName: '',
};

export default function MusicSuggestionSection() {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function validate(data) {
    const next = {};
    if (!data.title.trim()) next.title = t('music.suggestNameRequired');
    if (!data.youtubeUrl.trim()) next.youtubeUrl = t('music.suggestLinkRequired');
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await adminPost(endpoints.devotionalMusicSuggestion, {
        title: form.title.trim(),
        youtubeUrl: form.youtubeUrl.trim(),
        suggesterName: form.suggesterName.trim(),
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err) {
      setSubmitError(err.message || t('music.suggestError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.suggestSection}>
      <div className={styles.suggestCard}>
        <div className={styles.sectionHead}>
          <div className={styles.eyebrow}>{t('music.suggestEyebrow')}</div>
          <h2 className={styles.sectionTitle}>{t('music.suggestTitle')}</h2>
          <p className={styles.suggestSub}>{t('music.suggestSubtitle')}</p>
        </div>

        {submitted ? (
          <div className={styles.suggestSuccess} role="status">
            {t('music.suggestSuccess')}
          </div>
        ) : (
          <form className={styles.suggestForm} onSubmit={handleSubmit} noValidate>
            <label className={styles.suggestLabel} htmlFor="suggest-title">
              {t('music.suggestNameLabel')}
            </label>
            <input
              id="suggest-title"
              className={styles.suggestInput}
              value={form.title}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder={t('music.suggestNamePlaceholder')}
            />
            {errors.title ? <p className={styles.suggestError}>{errors.title}</p> : null}

            <label className={styles.suggestLabel} htmlFor="suggest-url">
              {t('music.suggestLinkLabel')}
            </label>
            <input
              id="suggest-url"
              className={styles.suggestInput}
              value={form.youtubeUrl}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, youtubeUrl: e.target.value }));
                if (errors.youtubeUrl) setErrors((prev) => ({ ...prev, youtubeUrl: '' }));
              }}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {errors.youtubeUrl ? <p className={styles.suggestError}>{errors.youtubeUrl}</p> : null}

            <label className={styles.suggestLabel} htmlFor="suggest-name">
              {t('music.suggestYourNameLabel')}
            </label>
            <input
              id="suggest-name"
              className={styles.suggestInput}
              value={form.suggesterName}
              onChange={(e) => setForm((prev) => ({ ...prev, suggesterName: e.target.value }))}
              placeholder={t('music.suggestYourNamePlaceholder')}
            />

            {submitError ? <p className={styles.suggestError} role="alert">{submitError}</p> : null}

            <button type="submit" className={styles.suggestBtn} disabled={submitting}>
              {submitting ? t('forms.sending') : t('music.suggestSubmit')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
