import asyncHandler from 'express-async-handler';
import BlogPost from '../models/BlogPost.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';

function toClient(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    date: doc.dateLabel,
    body: doc.body,
  };
}

export const listBlogs = asyncHandler(async (_req, res) => {
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  res.json(posts.map(toClient));
});

export const createBlog = asyncHandler(async (req, res) => {
  const { title, date, dateLabel, body } = req.body;
  await BlogPost.create({
    title,
    dateLabel: dateLabel || date || 'Today',
    body: body || '',
  });
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  scheduleDevSnapshot();
  res.status(201).json(posts.map(toClient));
});

export const updateBlog = asyncHandler(async (req, res) => {
  const { title, date, dateLabel, body } = req.body;
  const patch = {};
  if (title !== undefined) patch.title = title;
  if (date !== undefined) patch.dateLabel = date;
  if (dateLabel !== undefined) patch.dateLabel = dateLabel;
  if (body !== undefined) patch.body = body;

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
