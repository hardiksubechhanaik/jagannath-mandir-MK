import asyncHandler from 'express-async-handler';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mediaPath, saveUploadedImage } from '../lib/mediaStorage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Legacy disk folder — kept only for serving old uploads until re-uploaded. */
export const uploadsDir = path.join(__dirname, '../uploads');

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const fileId = await saveUploadedImage(req.file, 'gallery');
  res.status(201).json({ url: mediaPath(fileId) });
});
