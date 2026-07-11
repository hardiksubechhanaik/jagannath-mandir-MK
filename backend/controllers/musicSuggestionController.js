import asyncHandler from 'express-async-handler';
import MusicSuggestion from '../models/MusicSuggestion.js';
import DevotionalMusic from '../models/DevotionalMusic.js';
import { buildYoutubeLinks } from '../lib/youtubeUrl.js';
import { clampText } from '../lib/validators.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';
import { relativeTime } from '../utils/format.js';
import { mapDevotionalMusicDoc } from './devotionalMusicController.js';

function toClient(doc) {
  const links = buildYoutubeLinks(doc.videoId || doc.youtubeUrl);
  return {
    id: doc._id.toString(),
    title: doc.title,
    youtubeUrl: links?.youtubeUrl || doc.youtubeUrl,
    videoId: links?.videoId || doc.videoId,
    thumbnail: links?.thumbnail || '',
    suggesterName: doc.suggesterName || '',
    status: doc.status || 'pending',
    time: relativeTime(doc.createdAt),
  };
}

async function listAll() {
  const rows = await MusicSuggestion.find().sort({ createdAt: -1 });
  return rows.map(toClient);
}

function parseSuggestionBody(body = {}) {
  const title = clampText(body.title, 160);
  const youtubeUrl = clampText(body.youtubeUrl ?? body.url, 500);
  const suggesterName = clampText(body.suggesterName ?? body.name, 120);
  const links = buildYoutubeLinks(youtubeUrl);

  if (!title) return { error: 'Song name is required' };
  if (!links) return { error: 'Enter a valid YouTube or YouTube Music link' };

  return {
    data: {
      title,
      youtubeUrl: links.youtubeUrl,
      videoId: links.videoId,
      suggesterName,
    },
  };
}

export const listMusicSuggestions = asyncHandler(async (_req, res) => {
  res.json(await listAll());
});

export const createMusicSuggestion = asyncHandler(async (req, res) => {
  const parsed = parseSuggestionBody(req.body);
  if (parsed.error) {
    res.status(400);
    throw new Error(parsed.error);
  }

  const duplicate = await DevotionalMusic.findOne({ videoId: parsed.data.videoId });
  if (duplicate) {
    res.status(409);
    throw new Error('This track is already in the devotional music library');
  }

  const pending = await MusicSuggestion.findOne({
    videoId: parsed.data.videoId,
    status: 'pending',
  });
  if (pending) {
    res.status(409);
    throw new Error('This song has already been suggested and is awaiting review');
  }

  const doc = await MusicSuggestion.create(parsed.data);
  res.status(201).json({ ok: true, id: doc._id.toString() });
});

export const dismissMusicSuggestion = asyncHandler(async (req, res) => {
  const doc = await MusicSuggestion.findByIdAndUpdate(
    req.params.id,
    { status: 'dismissed' },
    { new: true },
  );
  if (!doc) {
    res.status(404);
    throw new Error('Suggestion not found');
  }
  scheduleDevSnapshot();
  res.json(await listAll());
});

export const approveMusicSuggestion = asyncHandler(async (req, res) => {
  const suggestion = await MusicSuggestion.findById(req.params.id);
  if (!suggestion) {
    res.status(404);
    throw new Error('Suggestion not found');
  }

  const existing = await DevotionalMusic.findOne({ videoId: suggestion.videoId });
  if (existing) {
    await MusicSuggestion.findByIdAndUpdate(suggestion._id, { status: 'added' });
    scheduleDevSnapshot();
    res.json({
      suggestions: await listAll(),
      items: (await DevotionalMusic.find().sort({ order: 1, featured: -1, createdAt: -1 })).map(mapDevotionalMusicDoc),
    });
    return;
  }

  const category = ['Bhajan', 'Aarti', 'Kirtan', 'Stotra', 'Other'].includes(req.body?.category)
    ? req.body.category
    : 'Bhajan';

  await DevotionalMusic.create({
    title: suggestion.title,
    artist: suggestion.suggesterName || '',
    category,
    youtubeUrl: suggestion.youtubeUrl,
    videoId: suggestion.videoId,
    description: 'Suggested by a devotee.',
    featured: false,
    published: true,
    order: 0,
  });

  await MusicSuggestion.findByIdAndUpdate(suggestion._id, { status: 'added' });
  scheduleDevSnapshot();

  const items = await DevotionalMusic.find().sort({ order: 1, featured: -1, createdAt: -1 });
  res.json({
    suggestions: await listAll(),
    items: items.map(mapDevotionalMusicDoc),
  });
});

export const deleteMusicSuggestion = asyncHandler(async (req, res) => {
  const doc = await MusicSuggestion.findByIdAndDelete(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Suggestion not found');
  }
  scheduleDevSnapshot();
  res.json(await listAll());
});
