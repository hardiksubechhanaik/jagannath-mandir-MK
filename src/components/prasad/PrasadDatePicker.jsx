import { useEffect, useMemo, useState } from 'react';
import useIstClock from '../../hooks/useIstClock';
import {
  compareMonth,
  formatPrasadDateLabel,
  getCalendarMonthKeys,
  getEarliestBookableDateKey,
  getFirstWeekdayOfMonth,
  getLatestBookableDateKey,
  isPrasadDateBookable,
  isoKeyToParts,
} from '../../lib/prasadBookingDates';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/prasadBooking.module.css';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function monthFromIso(isoKey) {
  const { year, month } = isoKeyToParts(isoKey);
  return { year, month };
}

export default function PrasadDatePicker({ id, value, onChange, describedById }) {
  const { t, locale } = useTranslation();
  const now = useIstClock();
  const earliest = getEarliestBookableDateKey(now);
  const latest = getLatestBookableDateKey(now);
  const initialView = monthFromIso(value || earliest);
  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);

  const earliestParts = isoKeyToParts(earliest);
  const latestParts = isoKeyToParts(latest);

  useEffect(() => {
    if (value && !isPrasadDateBookable(value, now)) {
      onChange('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only clear when IST clock invalidates selection
  }, [now, value]);

  useEffect(() => {
    const target = value || earliest;
    const { year, month } = isoKeyToParts(target);
    setViewYear(year);
    setViewMonth(month);
  }, [value, earliest]);

  const monthLabel = useMemo(() => {
    const localeTag = locale === 'hi' ? 'hi-IN' : locale === 'or' ? 'or-IN' : 'en-IN';
    return new Date(viewYear, viewMonth - 1, 1).toLocaleDateString(localeTag, {
      month: 'long',
      year: 'numeric',
    });
  }, [viewYear, viewMonth, locale]);

  const monthKeys = useMemo(
    () => getCalendarMonthKeys(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const leadingBlanks = getFirstWeekdayOfMonth(viewYear, viewMonth);
  const canGoPrev =
    compareMonth(viewYear, viewMonth, earliestParts.year, earliestParts.month) > 0;
  const canGoNext =
    compareMonth(viewYear, viewMonth, latestParts.year, latestParts.month) < 0;

  function goPrevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (!canGoNext) return;
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className={styles.datePicker} id={id}>
      <div className={styles.datePickerSelected} aria-live="polite">
        {value ? formatPrasadDateLabel(value, locale) : t('prasad.datePickerPlaceholder')}
      </div>

      <div className={styles.datePickerShell}>
        <div className={styles.datePickerHeader}>
          <button
            type="button"
            className={styles.datePickerNav}
            onClick={goPrevMonth}
            disabled={!canGoPrev}
            aria-label={t('prasad.datePickerPrevMonth')}
          >
            ‹
          </button>
          <div className={styles.datePickerMonth} aria-live="polite">
            {monthLabel}
          </div>
          <button
            type="button"
            className={styles.datePickerNav}
            onClick={goNextMonth}
            disabled={!canGoNext}
            aria-label={t('prasad.datePickerNextMonth')}
          >
            ›
          </button>
        </div>

        <div className={styles.datePickerWeekdays} aria-hidden="true">
          {WEEKDAY_KEYS.map((key) => (
            <span key={key} className={styles.datePickerWeekday}>
              {t(`prasad.weekdays.${key}`)}
            </span>
          ))}
        </div>

        <div
          className={styles.datePickerGrid}
          role="grid"
          aria-label={t('prasad.preferredDate')}
          aria-describedby={describedById}
        >
          {Array.from({ length: leadingBlanks }, (_, index) => (
            <span key={`blank-${index}`} className={styles.datePickerBlank} aria-hidden="true" />
          ))}
          {monthKeys.map((isoKey) => {
            const day = Number(isoKey.slice(-2));
            const bookable = isPrasadDateBookable(isoKey, now);
            const selected = value === isoKey;
            return (
              <button
                key={isoKey}
                type="button"
                role="gridcell"
                className={`${styles.datePickerDay} ${selected ? styles.datePickerDaySelected : ''} ${!bookable ? styles.datePickerDayDisabled : ''}`}
                disabled={!bookable}
                aria-pressed={selected}
                aria-label={formatPrasadDateLabel(isoKey, locale)}
                onClick={() => onChange(isoKey)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
