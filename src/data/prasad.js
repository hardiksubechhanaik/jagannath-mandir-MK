import { WHATSAPP_NUMBER } from './site.js';

export { WHATSAPP_NUMBER };

export const MAHAPRASAD = {
  name: 'Mahaprasad',
  odia: 'ମହାପ୍ରସାଦ',
};

export const METHODS = [
  { id: 'pickup', label: 'Temple pickup' },
  { id: 'ananda-bazar', label: 'At temple Ananda Bazar' },
];

/** Per person / pack rates by collection method (₹). */
export const PRICING = {
  pickup: { weekday: 200, weekend: 120 },
  'ananda-bazar': { weekday: 150, weekend: 100 },
};

export const STEPS = [
  {
    n: '1',
    title: 'Choose collection',
    desc: 'Temple pickup or Ananda Bazar, and your preferred date.',
  },
  {
    n: '2',
    title: 'Share details',
    desc: 'Your name, phone, quantity and any special request.',
  },
  {
    n: '3',
    title: 'Confirm on WhatsApp',
    desc: 'We open WhatsApp with your booking so our sevaks can confirm.',
  },
];

export function parsePreferredDate(dateStr) {
  if (!dateStr?.trim()) return null;
  const parsed = new Date(dateStr.trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isWeekend(date) {
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getRatesForMethod(methodId) {
  return PRICING[methodId] ?? PRICING.pickup;
}

export function getUnitPrice(methodId, dateStr) {
  const rates = getRatesForMethod(methodId);
  const parsed = parsePreferredDate(dateStr);
  if (!parsed) return null;
  return isWeekend(parsed) ? rates.weekend : rates.weekday;
}

export function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getPriceLabel(methodId, dateStr) {
  const rates = getRatesForMethod(methodId);
  const unit = getUnitPrice(methodId, dateStr);
  if (unit != null) {
    const dayType = isWeekend(parsePreferredDate(dateStr)) ? 'Sat–Sun' : 'Weekday';
    return `${formatPrice(unit)} (${dayType})`;
  }
  return `${formatPrice(rates.weekday)} weekdays · ${formatPrice(rates.weekend)} Sat–Sun`;
}
