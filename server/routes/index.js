import { Router } from 'express';
import {
  DEITY_IMAGES,
  TEMPLE_IMAGES,
  DONATION_AMOUNTS,
} from '../../src/data/home.js';
import { getUpcomingFestivals } from '../../src/lib/todayBand.js';
import { ABOUT_IMAGES, ABOUT_VALUES } from '../../src/data/about.js';
import { GALLERY_ITEMS } from '../../src/data/gallery.js';
import {
  GLANCE,
  HOURS,
  REACH,
  DOS,
  DONTS,
  FACILITIES,
} from '../../src/data/visit.js';
import { TRINITY, PARIVAR } from '../../src/data/deities.js';
import festivals from '../../src/data/festivals.js';
import {
  CAMERAS,
  SCHEDULE,
  RECORDINGS,
} from '../../src/data/liveDarshan.js';
import {
  PURPOSES,
  AMOUNTS,
  TRUST,
  BANK,
} from '../../src/data/donate.js';
import { CONTACT_INFO, NARASIMHA_IMAGE } from '../../src/data/contact.js';
import {
  SUMMER_NITI,
  WINTER_NITI,
  DEITY_MANTRA,
} from '../../src/data/niti.js';
import { enrichSchedule } from '../lib/liveSchedule.js';
import { getTempleStatus } from '../lib/templeStatus.js';
import { appendRecord } from '../lib/storage.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

router.get('/temple/status', (_req, res) => {
  res.json(getTempleStatus());
});

router.get('/home', (_req, res) => {
  res.json({
    deityImages: DEITY_IMAGES,
    templeImages: TEMPLE_IMAGES,
    festivalPreview: getUpcomingFestivals(3),
    donationAmounts: DONATION_AMOUNTS,
    niti: { summer: SUMMER_NITI, winter: WINTER_NITI },
    templeStatus: getTempleStatus(),
  });
});

router.get('/about', (_req, res) => {
  res.json({
    images: ABOUT_IMAGES,
    values: ABOUT_VALUES,
    gallery: GALLERY_ITEMS,
  });
});

router.get('/gallery', (_req, res) => {
  res.json({ items: GALLERY_ITEMS });
});

router.get('/visit', (_req, res) => {
  res.json({
    glance: GLANCE,
    hours: HOURS,
    reach: REACH,
    dos: DOS,
    donts: DONTS,
    facilities: FACILITIES,
  });
});

router.get('/deities', (_req, res) => {
  res.json({
    trinity: TRINITY,
    parivar: PARIVAR,
    mantra: DEITY_MANTRA,
  });
});

router.get('/festivals', (_req, res) => {
  res.json({ festivals });
});

router.get('/live-darshan', (_req, res) => {
  res.json({
    cameras: CAMERAS,
    schedule: enrichSchedule(SCHEDULE),
    recordings: RECORDINGS,
    templeStatus: getTempleStatus(),
  });
});

router.get('/donate', (_req, res) => {
  res.json({
    purposes: PURPOSES,
    amounts: AMOUNTS,
    trust: TRUST,
    bank: BANK,
  });
});

router.get('/contact', (_req, res) => {
  res.json({
    info: CONTACT_INFO,
    narasimhaImage: NARASIMHA_IMAGE,
  });
});

router.get('/niti', (req, res) => {
  const season = req.query.season;
  if (season === 'summer') return res.json({ season: 'summer', items: SUMMER_NITI });
  if (season === 'winter') return res.json({ season: 'winter', items: WINTER_NITI });
  res.json({ summer: SUMMER_NITI, winter: WINTER_NITI });
});

router.post('/contact/messages', async (req, res, next) => {
  try {
    const { name, email, mobile, message } = req.body ?? {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const record = await appendRecord('contact-messages.json', {
      name: name.trim(),
      email: email.trim(),
      mobile: mobile?.trim() ?? '',
      message: message.trim(),
    });

    res.status(201).json({ ok: true, id: record.id });
  } catch (err) {
    next(err);
  }
});

router.post('/donations', async (req, res, next) => {
  try {
    const { mode, amount, donor } = req.body ?? {};

    if (!donor?.name?.trim() || !donor?.email?.trim() || !donor?.mobile?.trim()) {
      return res.status(400).json({ message: 'Donor name, email, and mobile are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donor.email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (!amount?.trim()) {
      return res.status(400).json({ message: 'Donation amount is required.' });
    }

    const record = await appendRecord('donations.json', {
      mode: mode ?? 'once',
      amount: amount.trim(),
      donor: {
        name: donor.name.trim(),
        email: donor.email.trim(),
        mobile: donor.mobile.trim(),
        pan: donor.pan?.trim() ?? '',
      },
    });

    res.status(201).json({ ok: true, id: record.id });
  } catch (err) {
    next(err);
  }
});

router.post('/live-darshan/notify', async (req, res, next) => {
  try {
    const { contact } = req.body ?? {};

    if (!contact?.trim()) {
      return res.status(400).json({ message: 'Email or phone number is required.' });
    }

    const record = await appendRecord('live-notifications.json', {
      contact: contact.trim(),
    });

    res.status(201).json({ ok: true, id: record.id });
  } catch (err) {
    next(err);
  }
});

export default router;
