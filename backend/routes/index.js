import { Router } from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import {
  login,
  me,
  createAdminHandoff,
  exchangeAdminHandoff,
} from '../controllers/authController.js';
import { getSettings } from '../controllers/settingController.js';
import { createDonation } from '../controllers/donationController.js';
import { createMessage } from '../controllers/messageController.js';
import adminRouter from './admin.js';
import {
  publicHealth,
  publicHome,
  publicAbout,
  publicVisit,
  publicDeities,
  publicFestivals,
  publicLiveDarshan,
  publicYoutubeStats,
  publicDonate,
  publicPrasad,
  publicContact,
  publicGallery,
  publicTempleStatus,
  publicBlogs,
  publicNiti,
  publicDevotionalMusic,
  createLiveNotification,
} from '../controllers/publicSiteController.js';
import { createMusicSuggestion } from '../controllers/musicSuggestionController.js';
import { getRathLocationPublic, stopRathLocation, updateRathLocation } from '../controllers/rathController.js';
import rathWallRouter from './rathWall.js';
import { serveMedia } from '../controllers/mediaController.js';
import {
  loginLimiter,
  handoffLimiter,
  publicWriteLimiter,
  newsletterSubscribeLimiter,
} from '../middleware/rateLimit.js';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
} from '../controllers/newsletterController.js';

const router = Router();

router.get('/health', publicHealth);

router.get('/media/:id', serveMedia);

router.post('/auth/login', loginLimiter, login);
router.post('/auth/handoff', loginLimiter, protect, requireAdmin, createAdminHandoff);
router.post('/auth/exchange-handoff', handoffLimiter, exchangeAdminHandoff);
router.get('/auth/me', protect, me);

router.get('/settings', getSettings);

router.post('/donations', publicWriteLimiter, createDonation);
router.post('/messages', publicWriteLimiter, createMessage);
router.post('/newsletter/subscribe', newsletterSubscribeLimiter, subscribeNewsletter);
router.get('/newsletter/unsubscribe', unsubscribeNewsletter);
router.post('/live-darshan/notify', publicWriteLimiter, createLiveNotification);

router.post('/rath/update-location', publicWriteLimiter, updateRathLocation);
router.post('/rath/stop-location', publicWriteLimiter, stopRathLocation);
router.get('/rath/location', getRathLocationPublic);

router.use('/rath-wall', rathWallRouter);

router.get('/home', publicHome);
router.get('/about', publicAbout);
router.get('/visit', publicVisit);
router.get('/deities', publicDeities);
router.get('/festivals', publicFestivals);
router.get('/live-darshan/youtube-stats', publicYoutubeStats);
router.get('/live-darshan', publicLiveDarshan);
router.get('/donate', publicDonate);
router.get('/prasad', publicPrasad);
router.get('/contact', publicContact);
router.get('/gallery', publicGallery);
router.get('/blogs', publicBlogs);
router.get('/devotional-music', publicDevotionalMusic);
router.post('/devotional-music/suggestions', publicWriteLimiter, createMusicSuggestion);
router.get('/temple/status', publicTempleStatus);
router.get('/niti', publicNiti);

router.use('/admin', adminRouter);

export default router;
