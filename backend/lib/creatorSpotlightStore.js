import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Creator from '../models/Creator.js';

const OFFICIAL_TIER = 'official';
const DIGITAL_TIER = 'digital';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_DATA_FILE = path.join(__dirname, '../.data/creator-spotlight.json');

const DEFAULT_CREATORS = [
  { name: 'Devotee Reels', instagramHandle: '@devotee_reels', photoUrl: '' },
  { name: 'Mandir Moments', instagramHandle: '@mandir_moments', photoUrl: '' },
  { name: 'Bhakti Vlogs', instagramHandle: '@bhakti_vlogs', photoUrl: '' },
];

let migrationDone = false;

function legacyPartnerType(tier) {
  if (tier === OFFICIAL_TIER) return 'Official Creator Partner';
  if (tier === DIGITAL_TIER) return 'Digital Partner';
  return 'Partner';
}

function toPublic(doc) {
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const tier = plain.tier === OFFICIAL_TIER ? OFFICIAL_TIER : DIGITAL_TIER;
  const highlighted = plain.highlighted === true
    || (plain.highlighted !== false && plain.tier === OFFICIAL_TIER && plain.partnerType == null);

  return {
    id: plain._id?.toString() ?? plain.id,
    name: plain.name,
    instagramHandle: plain.instagramHandle,
    photoUrl: plain.photoUrl ?? '',
    order: plain.order ?? 0,
    partnerType: String(plain.partnerType ?? '').trim() || legacyPartnerType(plain.tier),
    details: plain.details ?? '',
    highlighted,
    tier,
    createdAt: plain.createdAt instanceof Date ? plain.createdAt.toISOString() : plain.createdAt,
    updatedAt: plain.updatedAt instanceof Date ? plain.updatedAt.toISOString() : plain.updatedAt,
  };
}

async function importLegacyFile() {
  if (!fs.existsSync(LEGACY_DATA_FILE)) return false;

  try {
    const rows = JSON.parse(fs.readFileSync(LEGACY_DATA_FILE, 'utf8'));
    if (!Array.isArray(rows) || rows.length === 0) return false;

    await Creator.insertMany(
      rows.map((row, index) => ({
        name: row.name,
        instagramHandle: row.instagramHandle,
        photoUrl: row.photoUrl ?? '',
        order: row.order ?? index,
        partnerType: row.partnerType ?? legacyPartnerType(row.tier),
        details: row.details ?? '',
        highlighted: row.highlighted ?? row.tier === OFFICIAL_TIER,
        tier: row.tier,
      })),
    );
    return true;
  } catch {
    return false;
  }
}

async function seedDevDefaults() {
  await Creator.insertMany(
    DEFAULT_CREATORS.map((entry, index) => ({
      name: entry.name,
      instagramHandle: entry.instagramHandle,
      photoUrl: entry.photoUrl,
      order: index,
      partnerType: 'Digital Partner',
      highlighted: false,
    })),
  );
}

async function ensureMigrated() {
  if (migrationDone) return;
  migrationDone = true;

  const count = await Creator.countDocuments();
  if (count > 0) return;

  if (await importLegacyFile()) return;

  if (process.env.NODE_ENV !== 'production') {
    await seedDevDefaults();
  }
}

function sortCreators(rows) {
  return rows.sort((a, b) => {
    const highlightDiff = Number(b.highlighted) - Number(a.highlighted);
    if (highlightDiff !== 0) return highlightDiff;
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return String(a.createdAt).localeCompare(String(b.createdAt));
  });
}

export async function listCreators() {
  await ensureMigrated();
  const rows = await Creator.find().sort({ order: 1, createdAt: 1 });
  return sortCreators(rows.map(toPublic));
}

export async function getCreator(id) {
  await ensureMigrated();
  const doc = await Creator.findById(id);
  return doc ? toPublic(doc) : null;
}

export async function createCreator({
  name,
  instagramHandle,
  photoUrl = '',
  partnerType = 'Partner',
  details = '',
  highlighted = false,
}) {
  await ensureMigrated();
  const order = await Creator.countDocuments();
  const doc = await Creator.create({
    name,
    instagramHandle,
    photoUrl,
    order,
    partnerType: String(partnerType).trim() || 'Partner',
    details: String(details).trim(),
    highlighted: Boolean(highlighted),
  });
  return toPublic(doc);
}

export async function updateCreator(id, patch) {
  await ensureMigrated();
  const doc = await Creator.findByIdAndUpdate(
    id,
    { $set: patch },
    { new: true, runValidators: true },
  );
  return doc ? toPublic(doc) : null;
}

export async function deleteCreator(id) {
  await ensureMigrated();
  const doc = await Creator.findByIdAndDelete(id);
  return doc ? toPublic(doc) : null;
}
