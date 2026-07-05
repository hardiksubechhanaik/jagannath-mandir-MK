export function formatDateLabel(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function statusToFrontend(status) {
  if (status === 'success') return 'Success';
  if (status === 'failed') return 'Failed';
  return 'Pending';
}

export function statusToBackend(status) {
  if (status === 'Success') return 'success';
  if (status === 'Failed') return 'failed';
  return 'pending';
}

export function parseAmount(amountStr) {
  const num = Number(String(amountStr).replace(/[^\d.]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

export function formatAmountShort(total) {
  if (total >= 1000) return `₹${(total / 1000).toFixed(1)}K`;
  return `₹${total}`;
}
