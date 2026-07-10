import { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import PrasadDatePicker from '../components/prasad/PrasadDatePicker';
import IndianMobileInput from '../components/IndianMobileInput';
import { isValidIndianMobile } from '../lib/indianMobile';
import { apiGet, endpoints } from '../api/client';
import {
  WHATSAPP_NUMBER,
  PRICING,
  formatPrice,
  getRatesForMethod,
  getUnitPrice,
  isWeekend,
  parsePreferredDate,
} from '../data/prasad';
import { formatPrasadDateLabel, isPrasadDateBookable } from '../lib/prasadBookingDates';
import useIstClock from '../hooks/useIstClock';
import mahaprasadMealImg from '../assets/prasad/mahaprasad-meal.png';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/prasadBooking.module.css';

function formatTotal(amount) {
  return formatPrice(amount);
}

function getLocalizedPriceLabel(method, dateStr, t, pricing) {
  const rates = getRatesForMethod(method, pricing);
  const unit = getUnitPrice(method, dateStr, pricing);
  if (unit != null) {
    const dayType = isWeekend(parsePreferredDate(dateStr)) ? t('prasad.weekend') : t('prasad.weekday');
    return `${formatPrice(unit)} (${dayType})`;
  }
  return t('prasad.priceWeekdayWeekend', {
    weekday: formatPrice(rates.weekday),
    weekend: formatPrice(rates.weekend),
  });
}

function buildWhatsAppMessage({ name, phone, qty, method, date, notes, total, priceLabel, t }) {
  const tmpl = t('prasad.whatsappTemplate', { object: true });
  const lines = [
    tmpl.header,
    '',
    `${tmpl.name} ${name.trim()}`,
    `${tmpl.phone} ${phone.trim()}`,
    `${tmpl.prasad} ${t('prasad.mahaprasad')} (${priceLabel})`,
    `${tmpl.quantity} ${t('prasad.summaryPersons', { count: qty })}`,
    `${tmpl.collection} ${method.label}`,
    `${tmpl.date} ${date.trim() || tmpl.notSpecified}`,
    `${tmpl.offering} ${formatTotal(total)}`,
  ];

  if (notes.trim()) {
    lines.push(`${tmpl.notes} ${notes.trim()}`);
  }

  lines.push('', tmpl.footer);
  return lines.join('\n');
}

export default function PrasadBooking() {
  const { t, locale } = useTranslation();
  const now = useIstClock();
  const methods = t('prasad.methods', { object: true });
  const steps = t('prasad.steps', { object: true });
  const [pricing, setPricing] = useState(PRICING);

  useEffect(() => {
    apiGet(endpoints.prasad)
      .then((data) => {
        if (data?.pricing) setPricing(data.pricing);
      })
      .catch(() => {});
  }, []);

  const [method, setMethod] = useState('pickup');
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [dateError, setDateError] = useState(false);

  const dateLabel = useMemo(
    () => (date ? formatPrasadDateLabel(date, locale) : ''),
    [date, locale],
  );

  const selectedMethod = useMemo(
    () => methods.find((m) => m.id === method) ?? methods[0],
    [method, methods],
  );

  const unitPrice = useMemo(() => getUnitPrice(method, date, pricing), [method, date, pricing]);
  const priceLabel = useMemo(() => getLocalizedPriceLabel(method, date, t, pricing), [method, date, t, pricing]);
  const total = unitPrice != null ? unitPrice * qty : null;

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError(true);
      setPhoneError(false);
      setDateError(false);
      return;
    }

    if (!isValidIndianMobile(phone)) {
      setError(false);
      setPhoneError(true);
      setDateError(false);
      return;
    }

    if (!date || !isPrasadDateBookable(date, now)) {
      setError(false);
      setPhoneError(false);
      setDateError(true);
      return;
    }

    setError(false);
    setPhoneError(false);
    setDateError(false);

    const resolvedUnit =
      unitPrice ?? getRatesForMethod(method, pricing).weekday;
    const resolvedTotal = resolvedUnit * qty;

    const message = buildWhatsAppMessage({
      name,
      phone,
      qty,
      method: selectedMethod,
      date: dateLabel,
      notes,
      total: resolvedTotal,
      priceLabel,
      t,
    });

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  return (
    <PageShell active="prasad" className={styles.page}>
      <section className={styles.hero} aria-labelledby="prasad-hero-title">
        <div className="templeHeroBg" aria-hidden="true" />
        <div className="templeHeroOverlay" aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>{t('prasad.heroEyebrow')}</p>
          <h1 id="prasad-hero-title" className={styles.heroTitle}>
            {t('prasad.heroTitle')}
          </h1>
          <p className={styles.heroOdia}>{t('prasad.heroOdia')}</p>
        </div>
      </section>

      <section className={styles.stepsSection} aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="visually-hidden">
          {t('prasad.howItWorks')}
        </h2>
        <div className={styles.stepsGrid}>
          {steps.map((step) => (
            <article key={step.n} className={styles.stepCard}>
              <div className={styles.stepNum} aria-hidden="true">
                {step.n}
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.bookingSection} aria-labelledby="booking-heading">
        <div className={styles.bookingGrid}>
          <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
            <p className={styles.formEyebrow}>{t('prasad.formEyebrow')}</p>
            <h2 id="booking-heading" className={styles.formTitle}>
              {t('prasad.formTitle')}
            </h2>
            <p className={styles.formHelper}>{t('prasad.formHelper')}</p>

            <div className={styles.prasadSingle} aria-label={t('prasad.mahaprasad')}>
              <div>
                <div className={styles.prasadName}>{t('prasad.mahaprasad')}</div>
                <div className={styles.prasadOdia}>{t('prasad.mahaprasadOdia')}</div>
                <p className={styles.prasadRateNote}>
                  {method === 'pickup' ? t('prasad.pickupNote') : t('prasad.bazarNote')}
                </p>
              </div>
              <div className={styles.prasadPrice}>{priceLabel}</div>
            </div>

            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldLabel}>{t('prasad.collection')}</legend>
              <div className={styles.methodRow} role="radiogroup" aria-label={t('prasad.collectionAria')}>
                {methods.map((item) => {
                  const selected = item.id === method;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`${styles.methodBtn} ${selected ? styles.methodBtnSelected : ''}`}
                      onClick={() => setMethod(item.id)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className={styles.fieldRow}>
              <div>
                <label htmlFor="prasad-name" className={`${styles.fieldLabel} ${styles.fieldLabelTight}`}>
                  {t('prasad.fullNameRequired')}
                </label>
                <input
                  id="prasad-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(false);
                  }}
                  placeholder={t('prasad.namePlaceholder')}
                  className={styles.input}
                />
              </div>
              <div>
                <label htmlFor="prasad-phone" className={`${styles.fieldLabel} ${styles.fieldLabelTight}`}>
                  {t('prasad.phoneRequired')}
                </label>
                <IndianMobileInput
                  id="prasad-phone"
                  name="phone"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError(false);
                    setPhoneError(false);
                  }}
                  placeholder={t('forms.phoneShort')}
                  className={styles.input}
                  hasError={phoneError}
                />
                {phoneError ? (
                  <p className={styles.errorLine} role="alert">{t('forms.mobileInvalid')}</p>
                ) : null}
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.qtyField}>
                <span className={`${styles.fieldLabel} ${styles.fieldLabelTight}`} id="qty-label">
                  {t('prasad.quantity')}
                </span>
                <div className={styles.stepper} aria-labelledby="qty-label">
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    aria-label={t('prasad.decreaseQty')}
                    onClick={() => setQty((value) => Math.max(value - 1, 1))}
                  >
                    −
                  </button>
                  <div className={styles.stepperValue} aria-live="polite" aria-atomic="true">
                    {qty}
                  </div>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    aria-label={t('prasad.increaseQty')}
                    onClick={() => setQty((value) => Math.min(value + 1, 100))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.dateFieldBlock}>
              <span className={`${styles.fieldLabel} ${styles.fieldLabelTight}`} id="prasad-date-label">
                {t('prasad.preferredDate')}
              </span>
              <PrasadDatePicker
                id="prasad-date"
                value={date}
                onChange={(nextDate) => {
                  setDate(nextDate);
                  setDateError(false);
                }}
                describedById="date-hint"
              />
              <p id="date-hint" className={styles.fieldHint}>
                {t('prasad.dateHint')}
              </p>
              {dateError ? (
                <p className={styles.errorLine} role="alert">
                  {t('prasad.dateRequired')}
                </p>
              ) : null}
            </div>

            <label htmlFor="prasad-notes" className={`${styles.fieldLabel} ${styles.fieldLabelTight}`}>
              {t('prasad.notesOptional')}
            </label>
            <textarea
              id="prasad-notes"
              name="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('prasad.notesPlaceholder')}
              className={styles.textarea}
            />

            {error && (
              <p className={styles.errorLine} role="alert">
                {t('forms.prasadError')}
              </p>
            )}

            <button type="submit" className={styles.submitBtn}>
              <span className={styles.submitGlyph} aria-hidden="true">
                ✆
              </span>
              {t('prasad.submit')}
            </button>
            <p className={styles.submitCaption}>{t('prasad.submitCaption')}</p>
          </form>

          <aside className={styles.summaryRail} aria-label={t('prasad.summaryEyebrow')}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryEyebrow}>{t('prasad.summaryEyebrow')}</p>
              <dl className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryLabel}>{t('prasad.summaryPrasad')}</dt>
                  <dd className={styles.summaryValue}>{t('prasad.mahaprasad')}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryLabel}>{t('prasad.summaryRate')}</dt>
                  <dd className={styles.summaryValue}>{priceLabel}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryLabel}>{t('prasad.summaryQuantity')}</dt>
                  <dd className={styles.summaryValue}>{t('prasad.summaryPersons', { count: qty })}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryLabel}>{t('prasad.summaryCollection')}</dt>
                  <dd className={styles.summaryValue}>{selectedMethod.label}</dd>
                </div>
                {date.trim() && parsePreferredDate(date) && (
                  <div className={styles.summaryRow}>
                    <dt className={styles.summaryLabel}>{t('prasad.summaryDate')}</dt>
                    <dd className={styles.summaryValue}>{dateLabel}</dd>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.summaryRowLast}`}>
                  <dt className={styles.summaryLabel}>{t('prasad.summaryTotal')}</dt>
                  <dd className={styles.summaryTotal}>
                    {total != null ? formatTotal(total) : t('prasad.selectDate')}
                  </dd>
                </div>
              </dl>
            </div>

            <div className={styles.reassureCard}>
              <div className={styles.reassureHead}>
                <span className={styles.reassureIcon} aria-hidden="true">
                  ✆
                </span>
                <p className={styles.reassureTitle}>{t('prasad.whatsappTitle')}</p>
              </div>
              <p className={styles.reassureText}>{t('prasad.whatsappBody')}</p>
            </div>

            <div className={styles.noteCard}>
              <p className={styles.noteOdia}>{t('prasad.mahaprasadOdia')}</p>
              <p className={styles.noteText}>{t('prasad.noteText')}</p>
            </div>
          </aside>
        </div>

        <figure className={styles.prasadShowcaseFigure} aria-label={t('prasad.showcaseAria')}>
          <img
            src={mahaprasadMealImg}
            alt={t('prasad.showcaseAlt')}
            className={styles.prasadShowcaseImg}
          />
          <figcaption className={styles.prasadShowcaseCaption}>
            {t('prasad.showcaseCaption')}
          </figcaption>
        </figure>
      </section>
    </PageShell>
  );
}
