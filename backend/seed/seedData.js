import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import User from '../models/User.js';
import Festival from '../models/Festival.js';
import Timing from '../models/Timing.js';
import Setting from '../models/Setting.js';
import GalleryItem from '../models/GalleryItem.js';
import BlogPost from '../models/BlogPost.js';
import Donation from '../models/Donation.js';
import Message from '../models/Message.js';
import panjikaEvents from '../../src/data/panjika2026.js';
import { SUMMER_NITI, WINTER_NITI } from '../../src/data/niti.js';
import {
  TEMPLE_PHONE,
  TEMPLE_EMAIL,
  TEMPLE_ADDRESS_SHORT,
} from '../../src/data/site.js';

const PANJIKA_DESC = 'Shree Mandira Panjika 2026–27 · Shree Mandira, Puri';

export const festivalsSeed = panjikaEvents.map((event) => ({
  day: String(event.day),
  month: event.month,
  name: event.name,
  desc: event.description || PANJIKA_DESC,
  odia: event.odia || '',
  featured: event.featured || false,
  date: event.date,
  weekday: event.weekday || '',
  order: event.order,
}));

export const settingsSeed = {
  status: 'open',
  phone: TEMPLE_PHONE,
  email: TEMPLE_EMAIL,
  address: TEMPLE_ADDRESS_SHORT,
  morning: '5:00 AM – 1:30 PM',
  evening: '4:00 PM – 9:30 PM',
  paymentsEnabled: false,
  welcomePopupEnabled: true,
  welcomePopupEyebrow: 'Bhakti · Sanskriti · Seva',
  welcomePopupHeading: 'Are you a content creator?',
  welcomePopupSubline: 'We invite you to be our official Content Creator Partner.',
  welcomePopupImages: [
    {
      url: '/images/content-creator-partner.png',
      alt: 'Content Creator Partner program at Shree Jagannath Mandir',
      linkUrl: '',
      caption: '',
    },
  ],
};

function mapNitiRows(schedule, season) {
  return schedule.map((item, order) => ({
    name: item.name,
    nameOdia: item.odia,
    time: item.time,
    note: item.note || '',
    season,
    order,
  }));
}

export async function purgeSampleContent() {
  const [donations, messages, gallery, blogs] = await Promise.all([
    Donation.deleteMany({}),
    Message.deleteMany({}),
    GalleryItem.deleteMany({}),
    BlogPost.deleteMany({}),
  ]);

  return {
    donations: donations.deletedCount,
    messages: messages.deletedCount,
    gallery: gallery.deletedCount,
    blogs: blogs.deletedCount,
  };
}

export async function resyncEssentials() {
  await Timing.deleteMany({});
  await Setting.deleteMany({});

  await Timing.insertMany([
    ...mapNitiRows(SUMMER_NITI, 'summer'),
    ...mapNitiRows(WINTER_NITI, 'winter'),
  ]);
  await Setting.create(settingsSeed);

  const festivalCount = await Festival.countDocuments();
  if (festivalCount === 0) {
    await Festival.insertMany(festivalsSeed);
  }

  return {
    timings: SUMMER_NITI.length + WINTER_NITI.length,
    festivals: festivalCount || festivalsSeed.length,
  };
}

export async function runSeed({ reset = true } = {}) {
  if (reset) {
    await Promise.all([
      User.deleteMany({}),
      GalleryItem.deleteMany({}),
      BlogPost.deleteMany({}),
      Festival.deleteMany({}),
      Timing.deleteMany({}),
      Donation.deleteMany({}),
      Message.deleteMany({}),
      Setting.deleteMany({}),
    ]);
  } else {
    const existing = await User.countDocuments();
    if (existing > 0) return false;
  }

  const isProd = process.env.NODE_ENV === 'production';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD
    || (isProd ? crypto.randomBytes(18).toString('base64url') : 'jagannath');
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: 'Administrator',
    username: 'admin',
    passwordHash,
    role: 'admin',
  });

  const volunteerPassword = process.env.WALL_VOLUNTEER_SECRET
    || process.env.RATH_TRACKER_SECRET
    || (isProd ? null : 'dev-volunteer');
  if (volunteerPassword) {
    const volunteerHash = await bcrypt.hash(volunteerPassword, 10);
    await User.create({
      name: 'Volunteer',
      username: 'volunteer',
      passwordHash: volunteerHash,
      role: 'volunteer',
    });
  }

  await Festival.insertMany(festivalsSeed);
  await Timing.insertMany([
    ...mapNitiRows(SUMMER_NITI, 'summer'),
    ...mapNitiRows(WINTER_NITI, 'winter'),
  ]);
  await Setting.create(settingsSeed);

  return true;
}

export function printSeedSummary() {
  console.log('Seed complete (essentials only — no demo donations, messages, or gallery):');
  if (process.env.NODE_ENV === 'production') {
    console.log('  Admin user created — set ADMIN_INITIAL_PASSWORD before seeding or reset password immediately.');
    console.log('  Volunteer user uses WALL_VOLUNTEER_SECRET when configured.');
  } else {
    console.log('  User: admin / jagannath (dev only)');
    console.log('  User: volunteer / dev-volunteer or WALL_VOLUNTEER_SECRET');
  }
  console.log(`  Festivals: ${festivalsSeed.length} (Shree Mandira Panjika)`);
  console.log(`  Timings: ${SUMMER_NITI.length + WINTER_NITI.length}`);
  console.log('  Settings: 1');
  console.log('  Gallery: 0');
  console.log('  Blogs: 0');
  console.log('  Donations: 0');
  console.log('  Messages: 0');
}
