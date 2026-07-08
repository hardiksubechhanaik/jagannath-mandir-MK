import { getTodayKeyIst } from './festivalDates.js';
import { getIstParts } from './ist.js';

export const PRASAD_BOOKING_CUTOFF_HOUR = 8;
export const PRASAD_BOOKING_CUTOFF_MINUTE = 30;
export const PRASAD_BOOKING_MAX_DAYS_AHEAD = 90;

export function addDaysToIsoKey(isoKey, days) {
  const [y, m, d] = isoKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** True until 8:30 AM IST — today remains bookable during this window. */
export function isBeforeTodayBookingCutoff(now = new Date()) {
  const { hour, minute } = getIstParts(now);
  if (hour < PRASAD_BOOKING_CUTOFF_HOUR) return true;
  if (hour === PRASAD_BOOKING_CUTOFF_HOUR && minute < PRASAD_BOOKING_CUTOFF_MINUTE) return true;
  return false;
}

export function getTomorrowDateKey(now = new Date()) {
  return addDaysToIsoKey(getTodayKeyIst(now), 1);
}

/** Earliest selectable date: today before 8:30 AM IST, otherwise tomorrow. */
export function getEarliestBookableDateKey(now = new Date()) {
  const today = getTodayKeyIst(now);
  return isBeforeTodayBookingCutoff(now) ? today : getTomorrowDateKey(now);
}

export function getLatestBookableDateKey(now = new Date()) {
  return addDaysToIsoKey(getTodayKeyIst(now), PRASAD_BOOKING_MAX_DAYS_AHEAD);
}

export function isPrasadDateBookable(isoKey, now = new Date()) {
  if (!isoKey || !/^\d{4}-\d{2}-\d{2}$/.test(isoKey)) return false;

  const today = getTodayKeyIst(now);
  if (isoKey < today) return false;
  if (isoKey > getLatestBookableDateKey(now)) return false;
  if (isoKey === today) return isBeforeTodayBookingCutoff(now);

  return true;
}

export function isoKeyToDate(isoKey) {
  const [y, m, d] = isoKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isoKeyToParts(isoKey) {
  const [year, month, day] = isoKey.split('-').map(Number);
  return { year, month, day };
}

export function formatPrasadDateLabel(isoKey, locale) {
  if (!isoKey) return '';
  const localeTag = locale === 'hi' ? 'hi-IN' : locale === 'or' ? 'or-IN' : 'en-IN';
  return isoKeyToDate(isoKey).toLocaleDateString(localeTag, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getCalendarMonthKeys(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const keys = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    keys.push(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    );
  }
  return keys;
}

/** 0 = Sunday … 6 = Saturday for the first of the month (local calendar grid). */
export function getFirstWeekdayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

export function compareMonth(year, month, compareYear, compareMonth) {
  if (year === compareYear) return month - compareMonth;
  return year - compareMonth;
}
