import asyncHandler from 'express-async-handler';
import DevotionalMusic, { CATEGORIES } from '../models/DevotionalMusic.js';
import { buildYoutubeLinks } from '../lib/youtubeUrl.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';

export function mapDevotionalMusicDoc(doc) {
  const links = buildYoutubeLinks(doc.videoId || doc.youtubeUrl);
  return {
    id: doc._id.toString(),
    title: doc.title,
    artist: doc.artist || '',
    category: doc.category || 'Bhajan',
    youtubeUrl: links?.youtubeUrl || doc.youtubeUrl,
    videoId: links?.videoId || doc.videoId,
    embedUrl: links?.embedUrl || '',
    thumbnail: links?.thumbnail || '',
    description: doc.description || '',
    featured: Boolean(doc.featured),
    published: doc.published !== false,
    order: doc.order ?? 0,
  };
}

async function listAll() {
  const rows = await DevotionalMusic.find().sort({ order: 1, featured: -1, createdAt: -1 });
  return rows.map(mapDevotionalMusicDoc);
}

export async function normalizeFeaturedTracks() {
  const featured = await DevotionalMusic.find({ featured: true })
    .sort({ updatedAt: -1, createdAt: -1 });
  if (featured.length <= 1) return;

  const [, ...rest] = featured;
  await DevotionalMusic.updateMany(
    { _id: { $in: rest.map((doc) => doc._id) } },
    { $set: { featured: false } },
  );
  scheduleDevSnapshot();
}

async function setExclusiveFeatured(trackId) {
  await DevotionalMusic.updateMany(
    { _id: { $ne: trackId }, featured: true },
    { $set: { featured: false } },
  );
}

function parsePayload(body = {}) {
  const title = String(body.title ?? '').trim();
  const artist = String(body.artist ?? '').trim();
  const category = CATEGORIES.includes(body.category) ? body.category : 'Bhajan';
  const youtubeUrl = String(body.youtubeUrl ?? body.url ?? '').trim();
  const description = String(body.description ?? '').trim();
  const featured = Boolean(body.featured);
  const published = featured ? true : body.published !== false;
  const order = Number.isFinite(Number(body.order)) ? Number(body.order) : 0;

  const links = buildYoutubeLinks(youtubeUrl);
  if (!links) {
    return { error: 'Enter a valid YouTube or YouTube Music link' };
  }

  if (!title) {
    return { error: 'Title is required' };
  }

  return {
    data: {
      title,
      artist,
      category,
      youtubeUrl: links.youtubeUrl,
      videoId: links.videoId,
      description,
      featured,
      published,
      order,
    },
  };
}

export const listDevotionalMusic = asyncHandler(async (_req, res) => {
  await normalizeFeaturedTracks();
  res.json(await listAll());
});

export const createDevotionalMusic = asyncHandler(async (req, res) => {
  const parsed = parsePayload(req.body);
  if (parsed.error) {
    res.status(400);
    throw new Error(parsed.error);
  }

  const doc = await DevotionalMusic.create(parsed.data);
  if (parsed.data.featured) {
    await setExclusiveFeatured(doc._id);
  }

  scheduleDevSnapshot();
  res.status(201).json(await listAll());
});

export const updateDevotionalMusic = asyncHandler(async (req, res) => {
  const existing = await DevotionalMusic.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Music item not found');
  }

  const parsed = parsePayload({ ...existing.toObject(), ...req.body });
  if (parsed.error) {
    res.status(400);
    throw new Error(parsed.error);
  }

  const doc = await DevotionalMusic.findByIdAndUpdate(req.params.id, parsed.data, {
    new: true,
    runValidators: true,
  });

  if (parsed.data.featured) {
    await setExclusiveFeatured(doc._id);
  }

  scheduleDevSnapshot();
  res.json(await listAll());
});

export const deleteDevotionalMusic = asyncHandler(async (req, res) => {
  const doc = await DevotionalMusic.findByIdAndDelete(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Music item not found');
  }

  scheduleDevSnapshot();
  res.json(await listAll());
});
