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

export function sanitizeIndianMobileInput(raw) {
  let digits = extractIndianMobileDigits(raw);
  if (!digits) return '';

  if (!/^[5-9]/.test(digits)) {
    const match = digits.match(/[5-9]\d{0,9}/);
    digits = match ? match[0] : '';
  }

  return digits;
}

export function isValidIndianMobile(value) {
  return INDIAN_MOBILE_RE.test(sanitizeIndianMobileInput(value));
}

export function looksLikeEmail(value) {
  return String(value ?? '').includes('@');
}
