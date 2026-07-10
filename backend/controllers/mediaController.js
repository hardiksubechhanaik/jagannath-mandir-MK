import asyncHandler from 'express-async-handler';
import { openMediaReadStream } from '../lib/mediaStorage.js';

export const serveMedia = asyncHandler(async (req, res) => {
  const result = await openMediaReadStream(req.params.id);
  if (!result) {
    res.status(404);
    throw new Error('Image not found');
  }

  const { stream, file } = result;
  const contentType = file.contentType || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  stream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ message: 'Image not found' });
    }
  });

  stream.pipe(res);
});
