import {
  MANDIR_COORDS,
  MANDIR_GOOGLE_MAPS,
  MANDIR_RIDE_ADDRESS,
  MANDIR_RIDE_LABEL,
} from './mandirLocation.js';

/** High-precision coords so apps pin Maruti Kunj, not another Jagannath Mandir. */
const DROP = {
  lat: MANDIR_COORDS.lat,
  lng: MANDIR_COORDS.lng,
  latStr: MANDIR_COORDS.lat.toFixed(8),
  lngStr: MANDIR_COORDS.lng.toFixed(8),
  label: MANDIR_RIDE_LABEL,
  address: MANDIR_RIDE_ADDRESS,
};

function encodeJsonLocation({ addressLine1, addressLine2 }) {
  return encodeURIComponent(
    JSON.stringify({
      latitude: DROP.lat,
      longitude: DROP.lng,
      addressLine1,
      addressLine2,
    }),
  );
}

function buildUberNativeParams() {
  const params = new URLSearchParams();
  params.set('action', 'setPickup');
  params.set('pickup', 'my_location');
  params.set('dropoff[latitude]', DROP.latStr);
  params.set('dropoff[longitude]', DROP.lngStr);
  params.set('dropoff[nickname]', DROP.label);
  params.set('dropoff[formatted_address]', DROP.address);
  return params;
}

function buildUberWebUrl() {
  const drop = encodeJsonLocation({
    addressLine1: DROP.label,
    addressLine2: DROP.address,
  });
  return `https://m.uber.com/looking?drop[0]=${drop}`;
}

function buildOlaParams() {
  const params = new URLSearchParams();
  params.set('drop_lat', DROP.latStr);
  params.set('drop_lng', DROP.lngStr);
  // Full unique label — short "Shree Jagannath Mandir" geocodes to the wrong temple.
  params.set('drop_name', DROP.address);
  params.set('drop_address', DROP.address);
  params.set('address', DROP.address);
  params.set('dsw', 'yes');
  params.set('landing_page', 'bk');
  return params;
}

function buildRapidoSeoUrl() {
  const from = 'Gurugram, Haryana, India';
  const to = `${DROP.label}, ${DROP.address}, India`;
  return `https://m.rapido.bike/unup-home/seo/${encodeURIComponent(from)}/${encodeURIComponent(to)}?version=v3`;
}

function buildRapidoNativeParams() {
  const params = new URLSearchParams();
  params.set('dropLat', DROP.latStr);
  params.set('dropLng', DROP.lngStr);
  params.set('dropAddress', DROP.address);
  params.set('dropName', DROP.label);
  return params;
}

/** Deep links / web booking URLs with mandir as drop-off. */
export const RIDE_PROVIDERS = [
  {
    id: 'uber',
    label: 'Uber',
    hint: 'Best on phone · Uber app',
    style: 'uber',
    getUrl: () => buildUberWebUrl(),
    appUrl: () => `https://m.uber.com/ul/?${buildUberNativeParams().toString()}`,
    nativeUrl: () => `uber://?${buildUberNativeParams().toString()}`,
  },
  {
    id: 'ola',
    label: 'Ola',
    hint: 'Best on phone · Ola app',
    style: 'ola',
    getUrl: () => `https://book.olacabs.com/?${buildOlaParams().toString()}`,
    appUrl: () =>
      `https://olawebcdn.com/assets/ola-universal-link.html?${buildOlaParams().toString()}`,
    nativeUrl: () => `olacabs://app/launch?${buildOlaParams().toString()}`,
    androidUrl: () => {
      const query = buildOlaParams().toString();
      const fallback = encodeURIComponent(`https://book.olacabs.com/?${query}`);
      return `intent://app/launch?${query}#Intent;scheme=olacabs;package=com.olacabs.customer;S.browser_fallback_url=${fallback};end`;
    },
  },
  {
    id: 'rapido',
    label: 'Rapido',
    hint: 'Best on phone · Rapido app',
    style: 'rapido',
    getUrl: () => buildRapidoSeoUrl(),
    appUrl: () => `rapido://home?${buildRapidoNativeParams().toString()}`,
    androidUrl: () => {
      const query = buildRapidoNativeParams().toString();
      const fallback = encodeURIComponent(buildRapidoSeoUrl());
      return `intent://home?${query}#Intent;scheme=rapido;package=com.rapido.passenger;S.browser_fallback_url=${fallback};end`;
    },
  },
];

export const MANDIR_MAPS_RIDE_URL = MANDIR_GOOGLE_MAPS;

export function getRideBookingUrl(provider) {
  return provider.getUrl();
}

/** Prefer native app links on phones so drop-off coordinates are honoured. */
export function getRideHref(provider) {
  if (!isMobileDevice()) return provider.getUrl();

  if (isAndroid() && provider.androidUrl) {
    return provider.androidUrl();
  }

  if (provider.nativeUrl) {
    return provider.nativeUrl();
  }

  if (provider.appUrl) {
    return provider.appUrl();
  }

  return provider.getUrl();
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}
