import { Router } from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import {
  listGallery,
  createGallery,
  updateGallery,
  deleteGallery,
} from '../controllers/galleryController.js';
import {
  listBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';
import {
  listFestivals,
  createFestival,
  updateFestival,
  deleteFestival,
} from '../controllers/festivalController.js';
import {
  listTimings,
  createTiming,
  updateTiming,
  deleteTiming,
  bulkUpdateTimings,
  repairTimings,
} from '../controllers/timingController.js';
import {
  listSpecialTimetables,
  createSpecialTimetable,
  updateSpecialTimetable,
  deleteSpecialTimetable,
} from '../controllers/specialTimetableController.js';
import {
  listDevotionalMusic,
  createDevotionalMusic,
  updateDevotionalMusic,
  deleteDevotionalMusic,
} from '../controllers/devotionalMusicController.js';
import {
  listMusicSuggestions,
  createMusicSuggestion,
  dismissMusicSuggestion,
  approveMusicSuggestion,
  deleteMusicSuggestion,
} from '../controllers/musicSuggestionController.js';
import {
  listDonations,
  updateDonation,
} from '../controllers/donationController.js';
import {
  listMessages,
  markMessageRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { updateSettings } from '../controllers/settingController.js';
import { getSummary } from '../controllers/statsController.js';
import { purgeFakeData } from '../controllers/maintenanceController.js';
import { uploadImage } from '../controllers/uploadController.js';
import { uploadLimiter, broadcastLimiter } from '../middleware/rateLimit.js';
import { createImageUpload, handleMulterError } from '../lib/multerMemory.js';
import {
  listNewsletterSubscribers,
  removeNewsletterSubscriber,
  listNewsletterBroadcasts,
  getLatestBlogDraft,
  sendNewsletterBroadcast,
  getNewsletterMailStatus,
  testNewsletterMail,
} from '../controllers/newsletterController.js';

const adminRouter = Router();
const upload = createImageUpload();

adminRouter.use(protect, requireAdmin);

adminRouter.get('/gallery', listGallery);
adminRouter.post('/gallery', createGallery);
adminRouter.put('/gallery/:id', updateGallery);
adminRouter.delete('/gallery/:id', deleteGallery);

adminRouter.get('/blogs', listBlogs);
adminRouter.post('/blogs', createBlog);
adminRouter.put('/blogs/:id', updateBlog);
adminRouter.delete('/blogs/:id', deleteBlog);

adminRouter.get('/festivals', listFestivals);
adminRouter.post('/festivals', createFestival);
adminRouter.put('/festivals/:id', updateFestival);
adminRouter.delete('/festivals/:id', deleteFestival);

adminRouter.get('/timings', listTimings);
adminRouter.put('/timings/bulk', bulkUpdateTimings);
adminRouter.post('/timings/repair', repairTimings);
adminRouter.post('/timings', createTiming);
adminRouter.put('/timings/:id', updateTiming);
adminRouter.delete('/timings/:id', deleteTiming);

adminRouter.get('/special-timings', listSpecialTimetables);
adminRouter.post('/special-timings', createSpecialTimetable);
adminRouter.put('/special-timings/:id', updateSpecialTimetable);
adminRouter.delete('/special-timings/:id', deleteSpecialTimetable);

adminRouter.get('/devotional-music', listDevotionalMusic);
adminRouter.post('/devotional-music', createDevotionalMusic);
adminRouter.put('/devotional-music/:id', updateDevotionalMusic);
adminRouter.delete('/devotional-music/:id', deleteDevotionalMusic);

adminRouter.get('/music-suggestions', listMusicSuggestions);
adminRouter.post('/music-suggestions/:id/approve', approveMusicSuggestion);
adminRouter.patch('/music-suggestions/:id/dismiss', dismissMusicSuggestion);
adminRouter.delete('/music-suggestions/:id', deleteMusicSuggestion);

adminRouter.get('/donations', listDonations);
adminRouter.put('/donations/:id', updateDonation);

adminRouter.get('/messages', listMessages);
adminRouter.patch('/messages/:id/read', markMessageRead);
adminRouter.delete('/messages/:id', deleteMessage);

adminRouter.put('/settings', updateSettings);
adminRouter.get('/stats/summary', getSummary);
adminRouter.post('/maintenance/purge-sample', purgeFakeData);

adminRouter.get('/newsletter/status', getNewsletterMailStatus);
adminRouter.post('/newsletter/test-mail', broadcastLimiter, testNewsletterMail);
adminRouter.get('/newsletter/subscribers', listNewsletterSubscribers);
adminRouter.delete('/newsletter/subscribers/:id', removeNewsletterSubscriber);
adminRouter.get('/newsletter/broadcasts', listNewsletterBroadcasts);
adminRouter.get('/newsletter/latest-blog', getLatestBlogDraft);
adminRouter.post('/newsletter/broadcasts', broadcastLimiter, sendNewsletterBroadcast);

adminRouter.post('/upload', uploadLimiter, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (handleMulterError(err, res)) return;
    next();
  });
}, uploadImage);

export default adminRouter;
