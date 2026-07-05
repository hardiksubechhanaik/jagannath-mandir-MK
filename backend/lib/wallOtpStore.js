import crypto from 'node:crypto';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_REQUESTS_PER_HOUR = 5;

/** @type {Map<string, { otp: string, expiresAt: number }>} */
const otpByPhone = new Map();

/** @type {Map<string, { count: number, windowStart: number, lastSentAt: number }>} */
const rateByPhone = new Map();

export function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return null;
}

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

export function createOtpForPhone(phone) {
  const now = Date.now();
  const rate = rateByPhone.get(phone) ?? { count: 0, windowStart: now, lastSentAt: 0 };

  if (now - rate.windowStart > 60 * 60 * 1000) {
    rate.count = 0;
    rate.windowStart = now;
  }

  if (rate.count >= MAX_OTP_REQUESTS_PER_HOUR) {
    return { ok: false, error: 'Too many OTP requests. Try again later.' };
  }

  if (now - rate.lastSentAt < OTP_COOLDOWN_MS) {
    return { ok: false, error: 'Please wait a minute before requesting another OTP.' };
  }

  const otp = generateOtp();
  otpByPhone.set(phone, { otp, expiresAt: now + OTP_TTL_MS });
  rate.count += 1;
  rate.lastSentAt = now;
  rateByPhone.set(phone, rate);

  return { ok: true, otp };
}

export function verifyOtp(phone, code) {
  const entry = otpByPhone.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpByPhone.delete(phone);
    return false;
  }
  if (entry.otp !== String(code).trim()) return false;
  otpByPhone.delete(phone);
  return true;
}

export function clearOtp(phone) {
  otpByPhone.delete(phone);
}
