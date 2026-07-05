import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import { relativeTime } from '../utils/format.js';
import { clampText, isValidEmail } from '../lib/validators.js';

function toClient(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    message: doc.message,
    unread: !doc.isRead,
    time: relativeTime(doc.createdAt),
  };
}

export const listMessages = asyncHandler(async (_req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages.map(toClient));
});

export const createMessage = asyncHandler(async (req, res) => {
  const name = clampText(req.body?.name, 120);
  const email = clampText(req.body?.email, 254);
  const message = clampText(req.body?.message, 5000);
  const mobile = clampText(req.body?.mobile, 20);

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required');
  }
  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error('A valid email is required');
  }

  const fullMessage = mobile
    ? `${message}\n\nMobile: ${mobile}`
    : message;

  const msg = await Message.create({
    name,
    email,
    message: fullMessage,
    isRead: false,
  });

  res.status(201).json({ ok: true, id: msg._id.toString() });
});

export const markMessageRead = asyncHandler(async (req, res) => {
  const { isRead, unread } = req.body;
  let readValue = true;
  if (isRead !== undefined) readValue = Boolean(isRead);
  if (unread !== undefined) readValue = !Boolean(unread);

  const msg = await Message.findByIdAndUpdate(
    req.params.id,
    { isRead: readValue },
    { new: true },
  );
  if (!msg) {
    res.status(404);
    throw new Error('Message not found');
  }

  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages.map(toClient));
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const msg = await Message.findByIdAndDelete(req.params.id);
  if (!msg) {
    res.status(404);
    throw new Error('Message not found');
  }
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages.map(toClient));
});

export { toClient };
