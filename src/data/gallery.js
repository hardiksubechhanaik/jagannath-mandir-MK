import { apiGet, endpoints, resolveMediaUrl } from '../api/client';

const RATIO_CYCLE = ['4/5', '3/2'];

/** Demo seed — used only when the API is unreachable (offline dev). */
export const SEED_PHOTOS = [
  { label: 'Jagannath trinity — adorned', category: 'Darshan', ratio: '4/5' },
  { label: 'Mangala Arati', category: 'Daily Niti', ratio: '3/2' },
  { label: 'Ratha Yatra — chariots', category: 'Festival', ratio: '3/2' },
  { label: 'Shikhara by night', category: 'Mandir', ratio: '4/5' },
  { label: 'Bhoga offering', category: 'Seva', ratio: '3/2' },
  { label: 'Evening aarti', category: 'Daily Niti', ratio: '3/2' },
  { label: 'Festival decoration', category: 'Festival', ratio: '4/5' },
  { label: 'Annadan seva', category: 'Seva', ratio: '3/2' },
  { label: 'Sudarshan Chakra', category: 'Darshan', ratio: '4/5' },
  { label: 'Devotees in queue', category: 'Mandir', ratio: '3/2' },
  { label: 'Kartik Purnima lamps', category: 'Festival', ratio: '4/5' },
  { label: 'Temple entrance', category: 'Mandir', ratio: '3/2' },
];

function normalizeRatio(ratio, index) {
  if (!ratio) return RATIO_CYCLE[index % RATIO_CYCLE.length];
  return String(ratio).replace(/\s/g, '');
}

function normalizeCategory(value) {
  return String(value ?? '').trim() || 'General';
}

function mapPhoto(row, index) {
  const label = row.label ?? row.caption ?? 'Untitled';
  return {
    id: row.id ?? String(index),
    label,
    category: normalizeCategory(row.category),
    ratio: normalizeRatio(row.ratio, index),
    image: row.image ? resolveMediaUrl(row.image) : null,
    alt: row.alt ?? label,
  };
}

function mapSeed(row, index) {
  return {
    id: `seed-${index}`,
    label: row.label,
    category: row.category,
    ratio: normalizeRatio(row.ratio, index),
    image: null,
    alt: row.label,
  };
}

/** Loads gallery photos from the admin-backed API. */
export async function loadGalleryPageData() {
  try {
    const data = await apiGet(endpoints.gallery);
    const rows = Array.isArray(data?.items) ? data.items : [];
    const photos = rows.map(mapPhoto);
    return {
      photos,
      categories: getFilterCategories(photos, data?.categories),
    };
  } catch {
    const photos = SEED_PHOTOS.map(mapSeed);
    return {
      photos,
      categories: getFilterCategories(photos),
    };
  }
}

/** @deprecated Use loadGalleryPageData() */
export async function getGalleryPhotos() {
  const data = await loadGalleryPageData();
  return data.photos;
}

export function getFilterCategories(photos, apiCategories = []) {
  const fromPhotos = photos.map((p) => normalizeCategory(p.category));
  const fromApi = Array.isArray(apiCategories) ? apiCategories.map(normalizeCategory) : [];
  const categories = [...new Set([...fromPhotos, ...fromApi])]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return ['all', ...categories];
}

/** @deprecated About-page preview grid — use getGalleryPhotos() instead. */
export const GALLERY_ITEMS = [];
