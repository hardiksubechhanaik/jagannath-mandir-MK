import { isRathYatraSeason } from '../lib/rathSeason.js';

export function getNav(t) {
  return [
    { label: t('nav.home'), to: '/' },
    {
      label: t('nav.visit'),
      items: [
        { label: t('nav.planYourVisit'), to: '/visit' },
        { label: t('nav.darshanTimings'), to: '/visit#timings' },
        { label: t('nav.theDeities'), to: '/deities' },
        { label: t('nav.liveDarshan'), to: '/live-darshan' },
        { label: t('nav.devotionalMusic'), to: '/devotional-music' },
      ],
    },
    {
      label: t('nav.events'),
      items: [
        { label: t('nav.festivalsEvents'), to: '/festivals' },
        { label: t('nav.rathTracking'), to: '/rath-tracker' },
        { label: t('nav.rathWall'), to: '/rath-yatra-wall' },
        { label: t('nav.templeJournal'), to: '/blog' },
      ],
    },
    {
      label: t('nav.about'),
      items: [
        { label: t('nav.aboutMandir'), to: '/about' },
        { label: t('nav.gallery'), to: '/gallery' },
        { label: t('nav.contactUs'), to: '/contact' },
      ],
    },
  ];
}

export function getFooterLinks(t) {
  const links = [
    { path: '/visit', label: t('nav.visit') },
    { path: '/deities', label: t('nav.theDeities') },
    { path: '/live-darshan', label: t('nav.liveDarshan') },
    { path: '/devotional-music', label: t('nav.devotionalMusic') },
    { path: '/festivals', label: t('nav.festivals') },
    { path: '/donate', label: t('nav.donate') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  if (isRathYatraSeason()) {
    links.splice(4, 0, { path: '/rath-tracker', label: t('nav.rathTracking') });
  }

  return links;
}
