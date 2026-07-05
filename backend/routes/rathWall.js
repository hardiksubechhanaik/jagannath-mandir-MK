import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import { requireWallVolunteer } from '../middleware/wallAuth.js';
import {
  approveWallPhoto,
  blockWallPhone,
  clearPublicWall,
  getApprovedWallPhotos,
  getVolunteerWallSettings,
  getWallStatus,
  listPendingWallPhotos,
  rejectWallPhoto,
  submitWallPhoto,
  updateVolunteerWallSettings,
  volunteerWallLogin,
  wallUploadsDir,
} from '../controllers/rathWallController.js';
import {
  dismissVolunteerDivyangRequest,
  listVolunteerDivyangRequests,
  submitDivyangRequest,
} from '../controllers/divyangAssistController.js';
import {
  createVolunteerCreator,
  creatorUploadsDir,
  deleteVolunteerCreator,
  listPublicCreators,
  listVolunteerCreators,
  updateVolunteerCreator,
} from '../controllers/creatorSpotlightController.js';
import {
  approveVolunteerSankalp,
  getApprovedSankalps,
  listVolunteerPendingSankalps,
  rejectVolunteerSankalp,
  submitSankalp,
} from '../controllers/sankalpController.js';
import {
  approveVolunteerDiya,
  getApprovedDiyas,
  listVolunteerPendingDiyas,
  rejectVolunteerDiya,
  submitDiya,
} from '../controllers/diyaController.js';
import { readMelaStats, trackMelaStat } from '../controllers/melaStatsController.js';
import { analyticsLimiter, loginLimiter, publicWriteLimiter, uploadLimiter } from '../middleware/rateLimit.js';
import { imageFileFilter, safeImageFilename } from '../lib/uploadSecurity.js';

fs.mkdirSync(wallUploadsDir, { recursive: true });
fs.mkdirSync(creatorUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: wallUploadsDir,
  filename: (_req, file, cb) => {
    cb(null, safeImageFilename('wall', file.originalname));
  },
});

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: imageFileFilter,
});

const creatorStorage = multer.diskStorage({
  destination: creatorUploadsDir,
  filename: (_req, file, cb) => {
    cb(null, safeImageFilename('creator', file.originalname));
  },
});

const creatorUpload = multer({
  storage: creatorStorage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: imageFileFilter,
});

function handleCreatorUpload(req, res, next) {
  creatorUpload.single('photo')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'Image must be under 15 MB' });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    next();
  });
}

const rathWallRouter = Router();

rathWallRouter.get('/status', getWallStatus);
rathWallRouter.get('/photos', getApprovedWallPhotos);

rathWallRouter.post('/submit', uploadLimiter, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'Image must be under 15 MB' });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    next();
  });
}, submitWallPhoto);

rathWallRouter.post('/volunteer/login', loginLimiter, volunteerWallLogin);
rathWallRouter.get('/volunteer/settings', requireWallVolunteer, getVolunteerWallSettings);
rathWallRouter.post('/volunteer/settings', requireWallVolunteer, updateVolunteerWallSettings);
rathWallRouter.get('/volunteer/pending', requireWallVolunteer, listPendingWallPhotos);
rathWallRouter.post('/volunteer/approve/:id', requireWallVolunteer, approveWallPhoto);
rathWallRouter.post('/volunteer/reject/:id', requireWallVolunteer, rejectWallPhoto);
rathWallRouter.post('/volunteer/block-phone', requireWallVolunteer, blockWallPhone);
rathWallRouter.post('/volunteer/clear-wall', requireWallVolunteer, clearPublicWall);

rathWallRouter.post('/divyang-request', publicWriteLimiter, submitDivyangRequest);
rathWallRouter.get('/volunteer/divyang-requests', requireWallVolunteer, listVolunteerDivyangRequests);
rathWallRouter.post('/volunteer/divyang-requests/:id/dismiss', requireWallVolunteer, dismissVolunteerDivyangRequest);

rathWallRouter.post('/sankalp-submit', publicWriteLimiter, submitSankalp);
rathWallRouter.get('/sankalps', getApprovedSankalps);

rathWallRouter.get('/volunteer/sankalps/pending', requireWallVolunteer, listVolunteerPendingSankalps);
rathWallRouter.post('/volunteer/sankalps/:id/approve', requireWallVolunteer, approveVolunteerSankalp);
rathWallRouter.post('/volunteer/sankalps/:id/reject', requireWallVolunteer, rejectVolunteerSankalp);

rathWallRouter.get('/mela-stats', readMelaStats);
rathWallRouter.post('/mela-stats/:key', analyticsLimiter, trackMelaStat);

rathWallRouter.post('/diya-submit', publicWriteLimiter, submitDiya);
rathWallRouter.get('/diyas', getApprovedDiyas);

rathWallRouter.get('/volunteer/diyas/pending', requireWallVolunteer, listVolunteerPendingDiyas);
rathWallRouter.post('/volunteer/diyas/:id/approve', requireWallVolunteer, approveVolunteerDiya);
rathWallRouter.post('/volunteer/diyas/:id/reject', requireWallVolunteer, rejectVolunteerDiya);

rathWallRouter.get('/creators', listPublicCreators);
rathWallRouter.get('/volunteer/creators', requireWallVolunteer, listVolunteerCreators);
rathWallRouter.post('/volunteer/creators', uploadLimiter, requireWallVolunteer, handleCreatorUpload, createVolunteerCreator);
rathWallRouter.put('/volunteer/creators/:id', uploadLimiter, requireWallVolunteer, handleCreatorUpload, updateVolunteerCreator);
rathWallRouter.delete('/volunteer/creators/:id', requireWallVolunteer, deleteVolunteerCreator);

export default rathWallRouter;
