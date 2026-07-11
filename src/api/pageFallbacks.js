import { ABOUT_IMAGES } from '../data/about.js';
import { NARASIMHA_IMAGE } from '../data/contact.js';
import {
  PARIVAR,
  PARIVAR_ALL_ORDER,
  TRINITY,
  TRINITY_ORDER,
} from '../data/deities.js';
import { AMOUNTS, BANK, PURPOSES, TRUST } from '../data/donate.js';
import staticFestivals, { PANJIKA_META } from '../data/festivals.js';
import { SEED_PHOTOS } from '../data/gallery.js';
import {
  DEITY_IMAGES,
  DONATION_AMOUNTS,
  FESTIVAL_PREVIEW,
  TEMPLE_IMAGES,
} from '../data/home.js';
import { CAMERAS, RECORDINGS, SCHEDULE } from '../data/liveDarshan.js';
import { DEITY_MANTRA, SUMMER_NITI, WINTER_NITI } from '../data/niti.js';
import {
  DOS,
  DONTS,
  FACILITIES,
  GLANCE,
  REACH,
} from '../data/visit.js';
import { filterUpcomingFestivals, sortFestivalsByDate } from '../lib/festivalDates.js';
import { getTempleStatus } from '../lib/templeStatus.js';
import { endpoints } from './client.js';

function mapNitiRows(rows) {
  return rows.map(({ time, name, odia, note }) => ({
    time,
    name,
    odia,
    note: note || '',
  }));
}

function buildVisitHours(nitiSummer) {
  return nitiSummer.map((t) => ({
    name: t.name,
    odia: t.odia,
    time: t.time,
  }));
}

function buildAboutGallery() {
  const ratios = ['4 / 5', '3 / 2', '3 / 2', '4 / 5'];
  const spans = ['span 2', 'span 1', 'span 1', 'span 2'];

  return SEED_PHOTOS.slice(0, 4).map((item, index) => ({
    id: `seed-${index}`,
    label: item.label,
    image: null,
    alt: item.label,
    ratio: ratios[index % ratios.length],
    span: spans[index % spans.length],
    focus: '50% 30%',
  }));
}

function buildDeitiesPayload() {
  const trinity = [...TRINITY].sort(
    (a, b) => TRINITY_ORDER.indexOf(a.name) - TRINITY_ORDER.indexOf(b.name),
  );
  const parivar = [...PARIVAR].sort(
    (a, b) => PARIVAR_ALL_ORDER.indexOf(a.name) - PARIVAR_ALL_ORDER.indexOf(b.name),
  );

  return { trinity, parivar, mantra: DEITY_MANTRA };
}

const FALLBACKS = {
  [endpoints.home]: {
    deityImages: DEITY_IMAGES,
    templeImages: TEMPLE_IMAGES,
    festivalPreview: FESTIVAL_PREVIEW,
    donationAmounts: DONATION_AMOUNTS,
    niti: {
      summer: mapNitiRows(SUMMER_NITI),
      winter: mapNitiRows(WINTER_NITI),
    },
    templeStatus: getTempleStatus(),
    welcomePopup: { enabled: false, eyebrow: '', heading: '', subline: '', images: [] },
    blogs: [],
  },
  [endpoints.about]: {
    images: ABOUT_IMAGES,
    values: [],
    gallery: buildAboutGallery(),
  },
  [endpoints.visit]: {
    glance: GLANCE,
    hours: buildVisitHours(SUMMER_NITI),
    reach: REACH,
    dos: DOS,
    donts: DONTS,
    facilities: FACILITIES,
  },
  [endpoints.deities]: buildDeitiesPayload(),
  [endpoints.festivals]: {
    festivals: filterUpcomingFestivals(sortFestivalsByDate(staticFestivals)),
    panjika: {
      title: PANJIKA_META.title,
      source: PANJIKA_META.source,
      period: PANJIKA_META.period,
    },
  },
  [endpoints.liveDarshan]: {
    cameras: CAMERAS,
    schedule: SCHEDULE,
    recordings: RECORDINGS,
    templeStatus: getTempleStatus(),
    youtubeStats: {
      configured: false,
      source: 'none',
      subscribers: null,
      watching: null,
      isLive: false,
      updatedAt: new Date().toISOString(),
    },
  },
  [endpoints.donate]: {
    purposes: PURPOSES,
    amounts: AMOUNTS,
    trust: TRUST,
    bank: BANK,
    paymentsEnabled: false,
  },
  [endpoints.contact]: {
    info: [],
    narasimhaImage: NARASIMHA_IMAGE,
  },
  [endpoints.devotionalMusic]: {
    items: [],
    categories: [],
  },
};

/** Static page payloads used for instant first paint before the API responds. */
export function getPageFallback(endpoint) {
  return FALLBACKS[endpoint] ?? null;
}
