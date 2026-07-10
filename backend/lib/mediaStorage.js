import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { safeImageFilename } from './uploadSecurity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUCKET_NAME = 'uploads';
const LEGACY_UPLOADS_ROOT = path.join(__dirname, '../uploads');

const MEDIA_ID_RE = /^[a-f\d]{24}$/i;

function getBucket() {
  const db = mongoose.connection?.db;
  if (!db) {
    throw new Error('MongoDB is not connected');
  }
  return new GridFSBucket(db, { bucketName: BUCKET_NAME });
}

/** Public API path for a stored image (persists in MongoDB GridFS). */
export function mediaPath(fileId) {
  return `/api/media/${fileId}`;
}

export function isMediaPath(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('/api/media/');
}

export function parseMediaId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/api\/media\/([a-f\d]{24})/i);
  return match?.[1] ?? null;
}

/**
 * Save a multer memory file to GridFS.
 * @param {Express.Multer.File} file
 * @param {'gallery'|'wall'|'creator'} category
 */
export async function saveUploadedImage(file, category) {
  if (!file?.buffer?.length) {
    throw new Error('No image data to store');
  }

  const filename = safeImageFilename(category, file.originalname);
  const bucket = getBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype || 'application/octet-stream',
      metadata: {
        category,
        originalName: file.originalname || filename,
      },
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString());
    });

    uploadStream.end(file.buffer);
  });
}

export async function deleteStoredMedia(url) {
  const fileId = parseMediaId(url);
  if (fileId) {
    await deleteMediaById(fileId);
    return;
  }

  deleteLegacyDiskFile(url);
}

export async function deleteMediaById(fileId) {
  if (!MEDIA_ID_RE.test(fileId)) return;
  const bucket = getBucket();
  try {
    await bucket.delete(new ObjectId(fileId));
  } catch (err) {
    if (err?.code !== 'ENOENT' && err?.codeName !== 'FileNotFound') {
      throw err;
    }
  }
}

function deleteLegacyDiskFile(url) {
  if (!url || typeof url !== 'string' || !url.includes('/uploads/')) return;

  const relative = url.replace(/^.*\/uploads\//, '');
  if (!relative || relative.includes('..')) return;

  const fullPath = path.join(LEGACY_UPLOADS_ROOT, relative);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export async function openMediaReadStream(fileId) {
  if (!MEDIA_ID_RE.test(fileId)) {
    return null;
  }

  const bucket = getBucket();
  const _id = new ObjectId(fileId);

  const files = await bucket.find({ _id }).limit(1).toArray();
  if (!files.length) {
    return null;
  }

  return {
    stream: bucket.openDownloadStream(_id),
    file: files[0],
  };
}
