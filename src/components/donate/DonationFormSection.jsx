import { useState } from 'react';
import { adminPost, endpoints } from '../../api/client';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/donate.module.css';

const EMPTY_DONOR = { name: '', email: '', mobile: '', pan: '' };

export default function DonationFormSection({ paymentsEnabled = false }) {
  const { t } = useTranslation();
  const amounts = t('donate.amounts', { object: true });
  const trust = t('donate.trust', { object: true });

  const [mode, setMode] = useState('once');
  const [amount, setAmount] = useState('2,100');
  const [custom, setCustom] = useState('');
  const [donor, setDonor] = useState(EMPTY_DONOR);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const activeAmt = custom.trim() || amount;
  const btnLabel = t('donate.proceedDonate', {
    amount: activeAmt,
    suffix: mode === 'monthly' ? t('donate.proceedSuffixMonthly') : '',
  });

  function handleDonorChange(e) {
    setDonor((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  function validate() {
    const e = {};
    if (!donor.name.trim()) e.name = t('forms.fullNameRequired');
    if (!donor.email.trim()) e.email = t('forms.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donor.email)) e.email = t('forms.emailInvalid');
    if (!donor.mobile.trim()) e.mobile = t('forms.mobileRequired');
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!paymentsEnabled) return;

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = { mode, amount: activeAmt, donor };
    setSubmitting(true);
    setSubmitError('');

    try {
      await adminPost(endpoints.donation, payload);
      setSubmitted(true);
      setDonor(EMPTY_DONOR);
      setErrors({});
      setCustom('');
    } catch (err) {
      setSubmitError(err.message ?? t('forms.donateError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="give" className={styles.giveSection}>
      <div className={styles.giveInner}>
        <div className={styles.giveGrid}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{t('donate.formTitle')}</h2>
            <p className={styles.formSub}>{t('donate.formSub')}</p>

            {!paymentsEnabled ? (
              <div className={styles.paymentsOff}>
                <div className={styles.paymentsOffIcon} aria-hidden="true">◷</div>
                <h3 className={styles.paymentsOffTitle}>{t('donate.paymentsOffTitle')}</h3>
                <p className={styles.paymentsOffText}>{t('donate.paymentsOffText')}</p>
              </div>
            ) : submitted ? (
              <div className={styles.successMsg}>
                <div className={styles.successIcon}>✓</div>
                <div className={styles.successText}>{t('donate.donateSuccess')}</div>
                <button className={styles.successReset} onClick={() => setSubmitted(false)} type="button">
                  {t('donate.makeAnother')}
                </button>
              </div>
            ) : (
              <>
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn} ${mode === 'once' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('once')}
                type="button"
              >
                {t('donate.oneTimeGift')}
              </button>
              <button
                className={`${styles.modeBtn} ${mode === 'monthly' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('monthly')}
                type="button"
              >
                {t('donate.monthlySeva')}
              </button>
            </div>

            <div className={styles.amountGrid}>
              {amounts.map((a) => (
                <button
                  key={a.amt}
                  type="button"
                  className={`${styles.amountTile} ${amount === a.amt && !custom ? styles.amountTileActive : ''}`}
                  onClick={() => { setAmount(a.amt); setCustom(''); }}
                >
                  <div className={styles.amountVal}>₹{a.amt}</div>
                  <div className={styles.amountNote}>{a.note}</div>
                </button>
              ))}
            </div>

            <input
              type="text"
              className={styles.customInput}
              placeholder={t('forms.customAmount')}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              aria-label={t('forms.customAmountAria')}
            />

              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.donorLabel}>{t('donate.donorDetails')}</div>
                <div className={styles.donorGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="dn-name">{t('forms.fullName')} *</label>
                    <input
                      id="dn-name" name="name" type="text"
                      placeholder={t('forms.namePlaceholder')}
                      value={donor.name} onChange={handleDonorChange}
                      className={`${styles.fieldInput} ${errors.name ? styles.fieldError : ''}`}
                      autoComplete="name"
                    />
                    {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="dn-email">{t('forms.email')} *</label>
                    <input
                      id="dn-email" name="email" type="email"
                      placeholder={t('forms.emailPlaceholder')}
                      value={donor.email} onChange={handleDonorChange}
                      className={`${styles.fieldInput} ${errors.email ? styles.fieldError : ''}`}
                      autoComplete="email"
                    />
                    {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="dn-mobile">{t('forms.mobile')} *</label>
                    <input
                      id="dn-mobile" name="mobile" type="tel"
                      placeholder={t('forms.phonePlaceholder')}
                      value={donor.mobile} onChange={handleDonorChange}
                      className={`${styles.fieldInput} ${errors.mobile ? styles.fieldError : ''}`}
                      autoComplete="tel"
                    />
                    {errors.mobile && <span className={styles.errMsg}>{errors.mobile}</span>}
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="dn-pan">{t('forms.pan')}</label>
                    <input
                      id="dn-pan" name="pan" type="text"
                      placeholder={t('forms.panPlaceholder')}
                      value={donor.pan} onChange={handleDonorChange}
                      className={styles.fieldInput}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <button type="submit" className={styles.proceedBtn} disabled={submitting}>
                  {submitting ? t('forms.processing') : btnLabel}
                </button>
                {submitError && <span className={styles.errMsg}>{submitError}</span>}
                <div className={styles.secureNote}>{t('donate.secureNote')}</div>
              </form>
              </>
            )}
          </div>

          <div className={styles.trustCol}>
            <div className={styles.trustCard}>
              <div className={styles.trustHead}>
                <div className={styles.trustMedallion}>✓</div>
                <div className={styles.trustHeadTitle}>{t('donate.trustTitle')}</div>
              </div>
              <ul className={styles.trustList}>
                {trust.map((item) => (
                  <li className={styles.trustItem} key={item}>
                    <span className={styles.trustBullet}>✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.sevaCard}>
              <h3 className={styles.sevaTitle}>{t('donate.sevaTitle')}</h3>
              <p className={styles.sevaDesc}>{t('donate.sevaDesc')}</p>
              <span className={styles.sevaLink}>{t('donate.sevaLink')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
