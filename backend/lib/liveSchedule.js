function parseTimeToMinutes(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function getIstMinutes() {
  const ist = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
  );
  return ist.getHours() * 60 + ist.getMinutes();
}

export function enrichSchedule(schedule) {
  const now = getIstMinutes();

  return schedule.map((item, index) => {
    const start = parseTimeToMinutes(item.time);
    const next = schedule[index + 1];
    const end = next ? parseTimeToMinutes(next.time) : 24 * 60;

    let status = 'upcoming';
    if (now >= end) status = 'ended';
    else if (now >= start) status = 'live';

    return { ...item, status };
  });
}
