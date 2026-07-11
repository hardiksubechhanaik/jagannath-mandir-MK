import crypto from 'node:crypto';
import asyncHandler from 'express-async-handler';
import BlogPost from '../models/BlogPost.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import NewsletterBroadcast from '../models/NewsletterBroadcast.js';
import { scheduleDevSnapshot } from '../config/devSnapshot.js';
import {
  buildBroadcastEmail,
  getSiteUrl,
  isMailConfigured,
  sendMail,
  verifyMailConnection,
} from '../lib/mail.js';
import { clampText, isValidEmail } from '../lib/validators.js';

function plainTextFromRich(text) {
  return String(text ?? '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1');
}

function subscriberToClient(doc) {
  return {
    id: doc._id.toString(),
    email: doc.email,
    active: doc.active,
    source: doc.source || 'blog',
    subscribedAt: doc.createdAt,
  };
}

function broadcastToClient(doc) {
  return {
    id: doc._id.toString(),
    subject: doc.subject,
    body: doc.body,
    type: doc.type,
    recipientCount: doc.recipientCount,
    sentCount: doc.sentCount,
    failedCount: doc.failedCount,
    status: doc.status,
    sentBy: doc.sentBy,
    createdAt: doc.createdAt,
  };
}

function newUnsubscribeToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function sendToSubscriber(subscriber, payload) {
  const unsubscribeUrl = `${getSiteUrl()}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;
  const { html, text } = buildBroadcastEmail({
    subject: payload.subject,
    bodyText: payload.body,
    unsubscribeUrl,
  });

  await sendMail({
    to: subscriber.email,
    subject: payload.subject,
    html,
    text,
  });
}

async function finalizeBroadcast(broadcastId, subscribers, payload) {
  const broadcast = await NewsletterBroadcast.findById(broadcastId);
  if (!broadcast || broadcast.status !== 'sending') return;

  let sentCount = 0;
  let failedCount = 0;

  for (const subscriber of subscribers) {
    try {
      await sendToSubscriber(subscriber, payload);
      sentCount += 1;
    } catch (err) {
      failedCount += 1;
      console.error(`Newsletter send failed for ${subscriber.email}:`, err.message);
    }
  }

  const status = failedCount === 0
    ? 'sent'
    : sentCount === 0
      ? 'failed'
      : 'partial';

  broadcast.sentCount = sentCount;
  broadcast.failedCount = failedCount;
  broadcast.status = status;
  await broadcast.save();
  scheduleDevSnapshot();
}

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const email = clampText(req.body?.email, 254).toLowerCase();
  if (!email || !isValidEmail(email)) {
    res.status(400);
    throw new Error('A valid email address is required.');
  }

  const existing = await NewsletterSubscriber.findOne({ email });
  if (existing) {
    if (!existing.active) {
      existing.active = true;
      existing.source = req.body?.source || existing.source || 'blog';
      await existing.save();
    }
    scheduleDevSnapshot();
    res.status(200).json({ ok: true, message: 'You are subscribed to mandir updates.' });
    return;
  }

  await NewsletterSubscriber.create({
    email,
    active: true,
    unsubscribeToken: newUnsubscribeToken(),
    source: req.body?.source || 'blog',
  });

  scheduleDevSnapshot();
  res.status(201).json({ ok: true, message: 'Thank you — you are subscribed.' });
});

export const unsubscribeNewsletter = asyncHandler(async (req, res) => {
  const token = String(req.query?.token || req.params?.token || '').trim();
  if (!token) {
    res.status(400);
    throw new Error('Invalid unsubscribe link.');
  }

  const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token });
  if (!subscriber) {
    res.status(404);
    throw new Error('This unsubscribe link is invalid or has already been used.');
  }

  subscriber.active = false;
  await subscriber.save();
  scheduleDevSnapshot();

  res.json({ ok: true, message: 'You have been unsubscribed from mandir email updates.' });
});

export const listNewsletterSubscribers = asyncHandler(async (_req, res) => {
  const subscribers = await NewsletterSubscriber.find({ active: true }).sort({ createdAt: -1 });
  res.json({
    count: subscribers.length,
    subscribers: subscribers.map(subscriberToClient),
  });
});

export const removeNewsletterSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
  if (!subscriber) {
    res.status(404);
    throw new Error('Subscriber not found');
  }
  scheduleDevSnapshot();
  const subscribers = await NewsletterSubscriber.find({ active: true }).sort({ createdAt: -1 });
  res.json({
    count: subscribers.length,
    subscribers: subscribers.map(subscriberToClient),
  });
});

export const listNewsletterBroadcasts = asyncHandler(async (_req, res) => {
  const broadcasts = await NewsletterBroadcast.find().sort({ createdAt: -1 }).limit(50);
  res.json(broadcasts.map(broadcastToClient));
});

export const getLatestBlogDraft = asyncHandler(async (_req, res) => {
  const post = await BlogPost.findOne().sort({ createdAt: -1 });
  if (!post) {
    res.json({ available: false });
    return;
  }

  const excerpt = plainTextFromRich(post.body).replace(/\s+/g, ' ').trim();
  const shortExcerpt = excerpt.length > 220 ? `${excerpt.slice(0, 217).trim()}…` : excerpt;
  const blogUrl = `${getSiteUrl()}/blog`;

  res.json({
    available: true,
    title: post.title,
    date: post.dateLabel,
    excerpt: shortExcerpt,
    suggestedSubject: `New from the mandir: ${post.title}`,
    suggestedBody: `${shortExcerpt}\n\nRead on the Temple Journal: ${blogUrl}`,
  });
});

export const sendNewsletterBroadcast = asyncHandler(async (req, res) => {
  if (!isMailConfigured() && process.env.NODE_ENV === 'production') {
    res.status(503);
    throw new Error('Zoho Mail SMTP is not configured. Set SMTP_USER and SMTP_PASS on the server.');
  }

  const subject = clampText(req.body?.subject, 200);
  const body = clampText(req.body?.body, 20000);
  const type = ['blog', 'emergency', 'general'].includes(req.body?.type)
    ? req.body.type
    : 'general';

  if (!subject || !body) {
    res.status(400);
    throw new Error('Subject and message are required.');
  }

  const subscribers = await NewsletterSubscriber.find({ active: true });
  if (!subscribers.length) {
    res.status(400);
    throw new Error('There are no active subscribers to email yet.');
  }

  try {
    await verifyMailConnection();
  } catch (err) {
    res.status(503);
    throw err;
  }

  const broadcast = await NewsletterBroadcast.create({
    subject,
    body,
    type,
    recipientCount: subscribers.length,
    sentCount: 0,
    failedCount: 0,
    status: 'sending',
    sentBy: req.user?.username || 'admin',
  });

  const payload = { subject, body };
  const subscriberSnapshot = subscribers.map((sub) => ({
    email: sub.email,
    unsubscribeToken: sub.unsubscribeToken,
  }));

  finalizeBroadcast(broadcast._id, subscriberSnapshot, payload).catch((err) => {
    console.error('Newsletter broadcast failed:', err.message);
    NewsletterBroadcast.findByIdAndUpdate(broadcast._id, {
      status: 'failed',
      failedCount: subscribers.length,
    }).catch(() => {});
  });

  res.status(202).json({
    ok: true,
    message: 'Broadcast started. Emails are being sent now.',
    broadcast: broadcastToClient(broadcast),
    mailConfigured: isMailConfigured(),
  });
});

export const getNewsletterMailStatus = asyncHandler(async (_req, res) => {
  res.json({
    configured: isMailConfigured(),
    from: process.env.MAIL_FROM || process.env.SMTP_USER || '',
    host: process.env.SMTP_HOST || 'smtp.zoho.in',
    port: Number(process.env.SMTP_PORT || 465),
  });
});

export const testNewsletterMail = asyncHandler(async (_req, res) => {
  if (!isMailConfigured()) {
    res.status(503);
    throw new Error('SMTP is not configured. Set SMTP_USER and SMTP_PASS on Render.');
  }

  await verifyMailConnection();

  const to = process.env.MAIL_FROM || process.env.SMTP_USER;
  await sendMail({
    to,
    subject: 'Mandir newsletter test',
    text: 'This is a test email from the Shree Jagannath Mandir admin panel. SMTP is working.',
    html: '<p>This is a test email from the Shree Jagannath Mandir admin panel. <strong>SMTP is working.</strong></p>',
  });

  res.json({ ok: true, message: `Test email sent to ${to}.` });
});
