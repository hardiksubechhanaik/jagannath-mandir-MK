import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../.data/creator-spotlight.json');

const DEFAULT_CREATORS = [
  { name: 'Devotee Reels', instagramHandle: '@devotee_reels', photoUrl: '' },
  { name: 'Mandir Moments', instagramHandle: '@mandir_moments', photoUrl: '' },
  { name: 'Bhakti Vlogs', instagramHandle: '@bhakti_vlogs', photoUrl: '' },
];

const creators = new Map();

function persist() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const rows = [...creators.values()].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
}

function seedDefaults() {
  DEFAULT_CREATORS.forEach((entry, index) => {
    const id = `cr-seed-${index + 1}`;
    creators.set(id, {
      id,
      name: entry.name,
      instagramHandle: entry.instagramHandle,
      photoUrl: entry.photoUrl,
      order: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
  persist();
}

function restore() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      seedDefaults();
      return;
    }
    const rows = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!Array.isArray(rows) || rows.length === 0) {
      seedDefaults();
      return;
    }
    rows.forEach((entry) => {
      if (entry?.id) creators.set(entry.id, entry);
    });
  } catch {
    creators.clear();
    seedDefaults();
  }
}

restore();

export function listCreators() {
  return [...creators.values()].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

export function getCreator(id) {
  return creators.get(id) ?? null;
}

export function createCreator({ name, instagramHandle, photoUrl = '' }) {
  const id = `cr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const order = creators.size;
  const entry = {
    id,
    name,
    instagramHandle,
    photoUrl,
    order,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  creators.set(id, entry);
  persist();
  return entry;
}

export function updateCreator(id, patch) {
  const entry = creators.get(id);
  if (!entry) return null;
  const next = {
    ...entry,
    ...patch,
    id: entry.id,
    updatedAt: new Date().toISOString(),
  };
  creators.set(id, next);
  persist();
  return next;
}

export function deleteCreator(id) {
  const entry = creators.get(id);
  if (!entry) return null;
  creators.delete(id);
  persist();
  return entry;
}
