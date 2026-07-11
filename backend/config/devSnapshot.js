import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import GalleryItem from '../models/GalleryItem.js';
import BlogPost from '../models/BlogPost.js';
import Festival from '../models/Festival.js';
import DevotionalMusic from '../models/DevotionalMusic.js';
import Setting from '../models/Setting.js';
import Creator from '../models/Creator.js';
import Timing from '../models/Timing.js';
import SpecialTimetable from '../models/SpecialTimetable.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import NewsletterBroadcast from '../models/NewsletterBroadcast.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = path.join(__dirname, '../.data');
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'dev-snapshot.json');

let saveTimer;

export function isMemoryDb() {
  return process.env.USE_MEMORY_DB === 'true';
}

export function getPersistenceMode() {
  if (!isMemoryDb()) return 'mongodb';
  return 'memory-file';
}

function stripDoc(doc) {
  if (!doc) return doc;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete plain._id;
  delete plain.__v;
  return plain;
}

export async function saveDevSnapshot() {
  if (!isMemoryDb()) return;

  const [gallery, blogs, festivals, settings, creators, timings, specialTimetables, devotionalMusic, newsletterSubscribers, newsletterBroadcasts] = await Promise.all([
    GalleryItem.find().sort({ createdAt: -1 }).lean(),
    BlogPost.find().sort({ createdAt: -1 }).lean(),
    Festival.find().sort({ order: 1, createdAt: 1 }).lean(),
    Setting.findOne().lean(),
    Creator.find().sort({ order: 1, createdAt: 1 }).lean(),
    Timing.find().sort({ season: 1, order: 1 }).lean(),
    SpecialTimetable.find().sort({ startDate: -1, priority: -1 }).lean(),
    DevotionalMusic.find().sort({ order: 1, featured: -1, createdAt: -1 }).lean(),
    NewsletterSubscriber.find().sort({ createdAt: -1 }).lean(),
    NewsletterBroadcast.find().sort({ createdAt: -1 }).lean(),
  ]);

  const snapshot = {
    savedAt: new Date().toISOString(),
    gallery: gallery.map(stripDoc),
    blogs: blogs.map(stripDoc),
    festivals: festivals.map(stripDoc),
    settings: settings ? stripDoc(settings) : null,
    creators: creators.map(stripDoc),
    timings: timings.map(stripDoc),
    specialTimetables: specialTimetables.map(stripDoc),
    devotionalMusic: devotionalMusic.map(stripDoc),
    newsletterSubscribers: newsletterSubscribers.map(stripDoc),
    newsletterBroadcasts: newsletterBroadcasts.map(stripDoc),
  };

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));
}

export function scheduleDevSnapshot() {
  if (!isMemoryDb()) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveDevSnapshot().catch((err) => {
      console.error('Failed to save dev snapshot:', err.message);
    });
  }, 400);
}

async function replaceCollection(Model, rows) {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  await Model.deleteMany({});
  await Model.insertMany(rows);
  return true;
}

export async function restoreDevSnapshot() {
  if (!isMemoryDb()) return false;
  if (!fs.existsSync(SNAPSHOT_FILE)) return false;

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));

  const [galleryRestored, blogsRestored, festivalsRestored, creatorsRestored, timingsRestored, specialRestored, musicRestored, subscribersRestored, broadcastsRestored] = await Promise.all([
    replaceCollection(GalleryItem, snapshot.gallery),
    replaceCollection(BlogPost, snapshot.blogs),
    replaceCollection(Festival, snapshot.festivals),
    replaceCollection(Creator, snapshot.creators),
    replaceCollection(Timing, snapshot.timings),
    replaceCollection(SpecialTimetable, snapshot.specialTimetables),
    replaceCollection(DevotionalMusic, snapshot.devotionalMusic),
    replaceCollection(NewsletterSubscriber, snapshot.newsletterSubscribers),
    replaceCollection(NewsletterBroadcast, snapshot.newsletterBroadcasts),
  ]);

  if (snapshot.settings) {
    const existing = await Setting.findOne();
    if (existing) {
      await Setting.findByIdAndUpdate(existing._id, snapshot.settings, { new: true });
    } else {
      await Setting.create(snapshot.settings);
    }
  }

  if (galleryRestored || blogsRestored || festivalsRestored || creatorsRestored || timingsRestored || specialRestored || musicRestored || subscribersRestored || broadcastsRestored || snapshot.settings) {
    console.log(
      `Restored dev snapshot (${[
        galleryRestored ? `${snapshot.gallery.length} gallery` : null,
        blogsRestored ? `${snapshot.blogs.length} blogs` : null,
        festivalsRestored ? `${snapshot.festivals.length} festivals` : null,
        creatorsRestored ? `${snapshot.creators?.length ?? 0} creators` : null,
        timingsRestored ? `${snapshot.timings?.length ?? 0} timings` : null,
        specialRestored ? `${snapshot.specialTimetables?.length ?? 0} special timetables` : null,
        musicRestored ? `${snapshot.devotionalMusic?.length ?? 0} devotional music` : null,
        subscribersRestored ? `${snapshot.newsletterSubscribers?.length ?? 0} newsletter subscribers` : null,
        broadcastsRestored ? `${snapshot.newsletterBroadcasts?.length ?? 0} newsletter broadcasts` : null,
        snapshot.settings ? 'settings' : null,
      ]
        .filter(Boolean)
        .join(', ')})`,
    );
    return true;
  }

  return false;
}

export function registerDevSnapshotShutdown() {
  if (!isMemoryDb()) return;

  const flush = () => {
    try {
      saveDevSnapshot();
    } catch (err) {
      console.error('Failed to flush dev snapshot on shutdown:', err.message);
    }
  };

  process.once('SIGINT', flush);
  process.once('SIGTERM', flush);
}
