import path from 'node:path';
import crypto from 'node:crypto';

export const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heif', '.heic']);

export function safeImageFilename(prefix, originalname) {
  const ext = path.extname(originalname || '').toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext)
    ? (ext === '.jpeg' ? '.jpg' : ext)
    : '.jpg';
  const suffix = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${Date.now()}-${suffix}${safeExt}`;
}

export function imageFileFilter(_req, file, cb) {
  if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    return;
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    cb(new Error('Invalid file extension'));
    return;
  }

  cb(null, true);
}
