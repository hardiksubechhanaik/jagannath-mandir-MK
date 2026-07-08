const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  const email = String(value ?? '').trim();
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function clampText(value, maxLen) {
  return String(value ?? '').trim().slice(0, maxLen);
}

/** Indian mobile: 10 digits, first digit 5–9. */
export const INDIAN_MOBILE_RE = /^[5-9]\d{9}$/;

export function extractIndianMobileDigits(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '');

  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

export function sanitizeIndianMobileDigits(raw) {
  let digits = extractIndianMobileDigits(raw);
  if (!digits) return '';

  if (!/^[5-9]/.test(digits)) {
    const match = digits.match(/[5-9]\d{0,9}/);
    digits = match ? match[0] : '';
  }

  return digits;
}

export function isValidIndianMobile(value) {
  return INDIAN_MOBILE_RE.test(sanitizeIndianMobileDigits(value));
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
