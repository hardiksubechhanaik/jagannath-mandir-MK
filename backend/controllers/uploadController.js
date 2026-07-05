import asyncHandler from 'express-async-handler';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

export const uploadsDir = path.join(__dirname, '../uploads');
