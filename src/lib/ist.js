export function getIstParts(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    })
      .formatToParts(now)
      .map(({ type, value }) => [type, value]),
  );

  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute,
    minutesSinceMidnight: hour * 60 + minute,
  };
}

export function getIstDate(now = new Date()) {
  const { year, month, day, hour, minute } = getIstParts(now);
  return new Date(year, month - 1, day, hour, minute);
}
