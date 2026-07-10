import multer from 'multer';
import { imageFileFilter } from './uploadSecurity.js';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export function createImageUpload() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter: imageFileFilter,
  });
}

export function handleMulterError(err, res) {
  if (!err) return false;
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ message: 'Image must be under 15 MB' });
    return true;
  }
  res.status(400).json({ message: err.message || 'Upload failed' });
  return true;
}
