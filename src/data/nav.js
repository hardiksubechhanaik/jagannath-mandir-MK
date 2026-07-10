import { getAdminAppUrl as resolveAdminAppUrl } from '../lib/authSession.js';

export const NAV = [
  { label: 'Home', to: '/' },
  {
    label: 'Visit',
    items: [
      { label: 'Plan Your Visit', to: '/visit' },
      { label: 'Darshan & Timings', to: '/visit#timings' },
      { label: 'The Deities', to: '/deities' },
      { label: 'Live Darshan', to: '/live-darshan' },
    ],
  },
  {
    label: 'Events',
    items: [
      { label: 'Festivals & Events', to: '/festivals' },
      { label: 'Rath Tracking', to: '/rath-tracker' },
      { label: 'Rath Wall', to: '/rath-yatra-wall' },
      { label: 'Temple Journal (Blog)', to: '/blog' },
    ],
  },
  {
    label: 'About',
    items: [
      { label: 'About the Mandir', to: '/about' },
      { label: 'Gallery', to: '/gallery' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
];

export const LOGIN_PATH = '/login';

/** @deprecated Use LOGIN_PATH — admin sign-in happens on the main site */
export const ADMIN_LOGIN_URL = LOGIN_PATH;

export function getAdminAppUrl() {
  return resolveAdminAppUrl();
}

export function splitRoute(to) {
  const hashIndex = to.indexOf('#');
  if (hashIndex === -1) {
    return { path: to, hash: '' };
  }
  return {
    path: to.slice(0, hashIndex),
    hash: to.slice(hashIndex),
  };
}

export function isNavItemActive(pathname, locationHash, to) {
  const { path, hash } = splitRoute(to);
  if (hash) {
    return pathname === path && locationHash === hash;
  }
  if (path === '/') {
    return pathname === '/';
  }
  return pathname === path;
}

export function isNavGroupActive(pathname, locationHash, items) {
  return items.some((item) => isNavItemActive(pathname, locationHash, item.to));
}

/** @deprecated Use NAV — kept for any legacy imports */
export const NAV_LINKS = [
  { key: 'home', path: '/', label: 'Home' },
  { key: 'visit', path: '/visit', label: 'Visit' },
  { key: 'deities', path: '/deities', label: 'The Deities' },
  { key: 'festivals', path: '/festivals', label: 'Festivals' },
  { key: 'blog', path: '/blog', label: 'Blog' },
  { key: 'prasad', path: '/prasad', label: 'Prasad' },
  { key: 'live-darshan', path: '/live-darshan', label: 'Live Darshan' },
  { key: 'about', path: '/about', label: 'About' },
  { key: 'contact', path: '/contact', label: 'Contact' },
];
