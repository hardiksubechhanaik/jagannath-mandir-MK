import { PRICING } from '../../src/data/prasad.js';

export const DEFAULT_PRASAD_PRICING = {
  pickup: { ...PRICING.pickup },
  'ananda-bazar': { ...PRICING['ananda-bazar'] },
};

function clampPrice(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) return fallback;
  return Math.min(Math.round(num), 100000);
}

export function normalizePrasadPricing(input) {
  const base = DEFAULT_PRASAD_PRICING;
  const source = input && typeof input === 'object' ? input : {};

  return {
    pickup: {
      weekday: clampPrice(source.pickup?.weekday, base.pickup.weekday),
      weekend: clampPrice(source.pickup?.weekend, base.pickup.weekend),
    },
    'ananda-bazar': {
      weekday: clampPrice(source['ananda-bazar']?.weekday, base['ananda-bazar'].weekday),
      weekend: clampPrice(source['ananda-bazar']?.weekend, base['ananda-bazar'].weekend),
    },
  };
}
