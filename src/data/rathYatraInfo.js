/**
 * Ratha Yatra procession details — Maruti Kunj loop.
 */
const TRACK_KM = 2.2;
const EXPECTED_HOURS = 3.5;

export const RATH_YATRA_INFO = {
  dateLabel: '16 July 2026',
  startTime: '9:00 AM',
  timezone: 'IST',
  area: 'Maruti Kunj, Bhondsi, Gurugram',
  /** Official procession loop length (km) — used for ETA & progress bar. */
  trackLengthKm: TRACK_KM,
  /** Target full-loop duration at procession pace. */
  expectedDurationHours: EXPECTED_HOURS,
  /** Pace for 2.2 km in ~3.5 hr (~0.63 km/h). */
  processionSpeedKmh: TRACK_KM / EXPECTED_HOURS,
};
