import asyncHandler from 'express-async-handler';
import GalleryItem from '../models/GalleryItem.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';
import { deleteStoredMedia } from '../lib/mediaStorage.js';

function toClient(doc) {
  return {
    id: doc._id.toString(),
    caption: doc.caption,
    category: doc.category,
    url: doc.imageUrl,
  };
}

export const listGallery = asyncHandler(async (_req, res) => {
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  res.json(items.map(toClient));
});

export const createGallery = asyncHandler(async (req, res) => {
  const { caption, category, url, imageUrl } = req.body;
  const item = await GalleryItem.create({
    caption: caption || 'Untitled',
    category: String(category || 'General').trim() || 'General',
    imageUrl: imageUrl || url || '',
  });
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  scheduleDevSnapshot();
  res.status(201).json(items.map(toClient));
});

export const updateGallery = asyncHandler(async (req, res) => {
  const { caption, category, url, imageUrl } = req.body;
  const patch = {};
  if (caption !== undefined) patch.caption = caption;
  if (category !== undefined) patch.category = category;
  if (url !== undefined) patch.imageUrl = url;
  if (imageUrl !== undefined) patch.imageUrl = imageUrl;

  const item = await GalleryItem.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!item) {
    res.status(404);
    throw new Error('Gallery item not found');
  }
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  scheduleDevSnapshot();
  res.json(items.map(toClient));
});

export const deleteGallery = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Gallery item not found');
  }
  if (item.imageUrl) {
    await deleteStoredMedia(item.imageUrl);
  }
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  scheduleDevSnapshot();
  res.json(items.map(toClient));
});
