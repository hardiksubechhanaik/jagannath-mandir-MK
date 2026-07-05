export function translateWeekday(weekday, t) {
  if (!weekday) return '';
  const slug = weekday.toLowerCase();
  return t(`common.weekdays.${slug}`, { defaultValue: weekday });
}
