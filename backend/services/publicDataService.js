import GalleryItem from '../models/GalleryItem.js';
import BlogPost from '../models/BlogPost.js';
import Festival from '../models/Festival.js';
import DevotionalMusic from '../models/DevotionalMusic.js';
import Setting from '../models/Setting.js';
import { resolvePublicNiti } from '../lib/timetableResolver.js';
import {
  DEITY_IMAGES,
  TEMPLE_IMAGES,
  DONATION_AMOUNTS,
} from '../../src/data/home.js';
import { ABOUT_IMAGES, ABOUT_VALUES } from '../../src/data/about.js';
import {
  GLANCE,
  REACH,
  DOS,
  DONTS,
  FACILITIES,
} from '../../src/data/visit.js';
import { TRINITY, TRINITY_ORDER, PARIVAR, PARIVAR_ALL_ORDER } from '../../src/data/deities.js';
import staticFestivals, { PANJIKA_META } from '../../src/data/festivals.js';
import {
  CAMERAS,
  SCHEDULE,
} from '../../src/data/liveDarshan.js';
import {
  PURPOSES,
  AMOUNTS,
  TRUST,
  BANK,
} from '../../src/data/donate.js';
import { NARASIMHA_IMAGE } from '../../src/data/contact.js';
import { DEITY_MANTRA } from '../../src/data/niti.js';
import { getUpcomingFestivals } from '../../src/lib/todayBand.js';
import {
  enrichFestival,
  filterUpcomingFestivals,
  sortFestivalsByDate,
} from '../../src/lib/festivalDates.js';
import { getTempleStatus } from '../lib/templeStatus.js';
import { buildYoutubeLinks } from '../lib/youtubeUrl.js';
import { normalizeFeaturedTracks } from '../controllers/devotionalMusicController.js';
import { enrichSchedule } from '../lib/liveSchedule.js';
import { normalizePrasadPricing } from '../lib/prasadPricing.js';
import { getYoutubeChannelStats, getYoutubeRecentVideos } from './youtubeService.js';

const API_ORIGIN = process.env.API_ORIGIN || `http://localhost:${process.env.PORT || 5001}`;

function absUrl(url) {
  if (!url) return url;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

async function getSettingsDoc() {
  let doc = await Setting.findOne();
  if (!doc) doc = await Setting.create({});
  return doc;
}

async function getTimingsGrouped() {
  const resolved = await resolvePublicNiti();
  return {
    mode: resolved.mode,
    activeSeason: resolved.activeSeason,
    summer: resolved.summer,
    winter: resolved.winter,
    special: resolved.special,
  };
}

function toPublicGalleryItem(doc, index = 0) {
  const ratios = ['4 / 5', '3 / 2', '3 / 2', '4 / 5'];
  const spans = ['span 2', 'span 1', 'span 1', 'span 2'];
  return {
    id: doc._id?.toString() || doc.id || String(index),
    label: doc.caption || doc.label,
    category: String(doc.category || 'General').trim() || 'General',
    image: absUrl(doc.imageUrl || doc.url || doc.image),
    alt: doc.alt || doc.caption || doc.label,
    ratio: doc.ratio || ratios[index % ratios.length],
    span: doc.span || spans[index % spans.length],
    focus: doc.focus || '50% 30%',
  };
}

async function getGalleryItems() {
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  return items.map(toPublicGalleryItem);
}

function toPublicFestival(doc, index = 0) {
  return enrichFestival({
    day: String(doc.day),
    month: doc.month,
    name: doc.name,
    odia: doc.odia || '',
    date: doc.date || '',
    weekday: doc.weekday || '',
    featured: doc.featured ?? index === 0,
    image: doc.image || '',
    description: doc.desc || doc.description || '',
    descriptionLong: doc.descriptionLong || doc.desc || doc.description || '',
  });
}

async function getFestivalsList() {
  const items = await Festival.find();
  if (!items.length || items.length < staticFestivals.length) {
    return filterUpcomingFestivals(sortFestivalsByDate(staticFestivals));
  }
  return filterUpcomingFestivals(sortFestivalsByDate(items.map(toPublicFestival)));
}

function buildContactInfo(settings) {
  return [
    { icon: '⊙', title: 'Address', body: settings.address },
    { icon: '✆', title: 'Call Us', body: settings.phone },
    { icon: '✉', title: 'Email', body: settings.email },
    { icon: '◷', title: 'Office Hours', body: `${settings.morning}\n${settings.evening}` },
    { icon: '◈', title: 'Help Desk', body: `${settings.phone}\nMon–Sun · 6 AM–10 PM` },
  ];
}

function buildVisitHours(nitiSummer) {
  return nitiSummer.map((t) => ({
    name: t.name,
    odia: t.odia,
    time: t.time,
  }));
}

export async function getPublicHome() {
  const [settings, niti] = await Promise.all([
    getSettingsDoc(),
    getTimingsGrouped(),
  ]);

  const activeSpecial = niti.mode === 'special' ? niti.special : null;

  const welcomePopup = {
    enabled: settings.welcomePopupEnabled !== false,
    eyebrow: settings.welcomePopupEyebrow || '',
    heading: settings.welcomePopupHeading || '',
    subline: settings.welcomePopupSubline || '',
    images: Array.isArray(settings.welcomePopupImages)
      ? settings.welcomePopupImages
          .filter((item) => item?.url)
          .map((item) => ({
            url: item.url,
            alt: item.alt || '',
            linkUrl: item.linkUrl || '',
            caption: item.caption || '',
          }))
      : [],
  };

  return {
    deityImages: DEITY_IMAGES,
    templeImages: TEMPLE_IMAGES,
    festivalPreview: getUpcomingFestivals(3),
    donationAmounts: DONATION_AMOUNTS,
    niti,
    templeStatus: getTempleStatus(settings.status, activeSpecial),
    welcomePopup,
    blogs: await BlogPost.find().sort({ createdAt: -1 }).limit(3).then((rows) =>
      rows.map((b) => ({ id: b._id.toString(), title: b.title, date: b.dateLabel, body: b.body })),
    ),
  };
}

export async function getPublicAbout() {
  const gallery = await getGalleryItems();
  return {
    images: ABOUT_IMAGES,
    values: ABOUT_VALUES,
    gallery,
  };
}

export async function getPublicVisit() {
  const niti = await getTimingsGrouped();
  const hoursSource = niti.mode === 'special' && niti.special?.items?.length
    ? niti.special.items
    : niti[niti.activeSeason] ?? niti.summer;
  return {
    glance: GLANCE,
    hours: buildVisitHours(hoursSource),
    reach: REACH,
    dos: DOS,
    donts: DONTS,
    facilities: FACILITIES,
    niti,
  };
}

export async function getPublicDeities() {
  const trinity = [...TRINITY].sort(
    (a, b) => TRINITY_ORDER.indexOf(a.name) - TRINITY_ORDER.indexOf(b.name),
  );
  const parivar = [...PARIVAR].sort(
    (a, b) => PARIVAR_ALL_ORDER.indexOf(a.name) - PARIVAR_ALL_ORDER.indexOf(b.name),
  );

  return {
    trinity,
    parivar,
    mantra: DEITY_MANTRA,
  };
}

export async function getPublicFestivals() {
  const festivals = await getFestivalsList();
  return {
    festivals,
    panjika: {
      title: PANJIKA_META.title,
      source: PANJIKA_META.source,
      period: PANJIKA_META.period,
    },
  };
}

export async function getPublicLiveDarshan() {
  const [settings, niti, youtubeStats, recordings] = await Promise.all([
    getSettingsDoc(),
    getTimingsGrouped(),
    getYoutubeChannelStats(),
    getYoutubeRecentVideos(3),
  ]);
  const activeSpecial = niti.mode === 'special' ? niti.special : null;
  return {
    cameras: CAMERAS,
    schedule: enrichSchedule(SCHEDULE),
    recordings,
    templeStatus: getTempleStatus(settings.status, activeSpecial),
    youtubeStats,
  };
}

export async function getPublicYoutubeStats() {
  return getYoutubeChannelStats();
}

export async function getPublicDonate() {
  const settings = await getSettingsDoc();
  return {
    purposes: PURPOSES,
    amounts: AMOUNTS,
    trust: TRUST,
    bank: BANK,
    paymentsEnabled: Boolean(settings.paymentsEnabled),
  };
}

export async function getPublicPrasad() {
  const settings = await getSettingsDoc();
  return {
    pricing: normalizePrasadPricing(settings.prasadPricing),
  };
}

export async function getPublicContact() {
  const settings = await getSettingsDoc();
  return {
    info: buildContactInfo(settings),
    narasimhaImage: NARASIMHA_IMAGE,
  };
}

export async function getPublicGallery() {
  const items = await getGalleryItems();
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return { items, categories };
}

export async function getPublicTempleStatus() {
  const [settings, niti] = await Promise.all([
    getSettingsDoc(),
    getTimingsGrouped(),
  ]);
  const activeSpecial = niti.mode === 'special' ? niti.special : null;
  return getTempleStatus(settings.status, activeSpecial);
}

export async function getPublicBlogs() {
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  return posts.map((b) => ({
    id: b._id.toString(),
    title: b.title,
    category: b.category || 'Temple Life',
    date: b.dateLabel,
    excerpt: b.body,
    body: b.body,
    image: b.imageUrl || null,
  }));
}

export async function getPublicDevotionalMusic() {
  await normalizeFeaturedTracks();
  const rows = await DevotionalMusic.find({ published: true })
    .sort({ order: 1, featured: -1, createdAt: -1 });

  const items = rows.map((row) => {
    const links = buildYoutubeLinks(row.videoId || row.youtubeUrl);
    return {
      id: row._id.toString(),
      title: row.title,
      artist: row.artist || '',
      category: row.category || 'Bhajan',
      youtubeUrl: links?.youtubeUrl || row.youtubeUrl,
      videoId: links?.videoId || row.videoId,
      embedUrl: links?.embedUrl || '',
      thumbnail: links?.thumbnail || '',
      description: row.description || '',
      featured: Boolean(row.featured),
    };
  });

  const categories = [...new Set(items.map((item) => item.category))];

  return { items, categories };
}

export async function getPublicNiti(season) {
  const niti = await getTimingsGrouped();
  if (niti.mode === 'special' && niti.special) {
    return {
      mode: 'special',
      special: niti.special,
      summer: niti.summer,
      winter: niti.winter,
    };
  }
  if (season === 'summer') return { mode: 'seasonal', season: 'summer', items: niti.summer };
  if (season === 'winter') return { mode: 'seasonal', season: 'winter', items: niti.winter };
  return niti;
}
