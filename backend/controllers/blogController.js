import asyncHandler from 'express-async-handler';
import BlogPost from '../models/BlogPost.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';

function toClient(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    name: doc.authorName || '',
    instaId: doc.instaId || '',
    date: doc.dateLabel,
    body: doc.body,
    imageUrl: doc.imageUrl || '',
    image: doc.imageUrl || '',
    category: doc.category || 'Temple Life',
  };
}

function pickBlogFields(body) {
  const { title, date, dateLabel, body: content, name, authorName, instaId, imageUrl, image, category } = body;
  const patch = {};
  if (title !== undefined) patch.title = title;
  if (date !== undefined) patch.dateLabel = date;
  if (dateLabel !== undefined) patch.dateLabel = dateLabel;
  if (content !== undefined) patch.body = content;
  if (name !== undefined) patch.authorName = name;
  if (authorName !== undefined) patch.authorName = authorName;
  if (instaId !== undefined) patch.instaId = instaId;
  if (imageUrl !== undefined) patch.imageUrl = imageUrl;
  if (image !== undefined) patch.imageUrl = image;
  if (category !== undefined) patch.category = category;
  return patch;
}

export const listBlogs = asyncHandler(async (_req, res) => {
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  res.json(posts.map(toClient));
});

export const createBlog = asyncHandler(async (req, res) => {
  const { title, date, dateLabel, body, name, authorName } = req.body;
  if (!String(title || '').trim()) {
    res.status(400);
    throw new Error('Title is required');
  }
  if (!String(name ?? authorName ?? '').trim()) {
    res.status(400);
    throw new Error('Name is required');
  }

  await BlogPost.create({
    ...pickBlogFields(req.body),
    title: title.trim(),
    authorName: String(name ?? authorName ?? '').trim(),
    dateLabel: dateLabel || date || 'Today',
    body: body || '',
  });
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  scheduleDevSnapshot();
  res.status(201).json(posts.map(toClient));
});

export const updateBlog = asyncHandler(async (req, res) => {
  const patch = pickBlogFields(req.body);
  if (patch.title !== undefined) patch.title = patch.title.trim();
  if (patch.authorName !== undefined) patch.authorName = patch.authorName.trim();

  const post = await BlogPost.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  scheduleDevSnapshot();
  res.json(posts.map(toClient));
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  scheduleDevSnapshot();
  res.json(posts.map(toClient));
});
