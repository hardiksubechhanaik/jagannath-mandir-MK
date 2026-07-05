const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  const email = String(value ?? '').trim();
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function clampText(value, maxLen) {
  return String(value ?? '').trim().slice(0, maxLen);
}

export function parseDonationAmount(raw) {
  const digits = String(raw ?? '').replace(/[^\d]/g, '');
  if (!digits) return null;
  const amount = Number.parseInt(digits, 10);
  if (!Number.isFinite(amount) || amount < 1 || amount > 10_000_000) return null;
  return amount;
}

/** Allow relative paths or https links only (blocks javascript:, data:, etc.). */
export function sanitizeLinkUrl(raw) {
  const url = String(raw ?? '').trim();
  if (!url) return '';
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return '';
}
