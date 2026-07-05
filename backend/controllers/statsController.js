import asyncHandler from 'express-async-handler';
import Donation from '../models/Donation.js';
import Message from '../models/Message.js';
import GalleryItem from '../models/GalleryItem.js';
import Festival from '../models/Festival.js';
import BlogPost from '../models/BlogPost.js';
import { filterUpcomingFestivals } from '../../src/lib/festivalDates.js';
import { formatAmountShort, parseAmount, relativeTime } from '../utils/format.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getSummary = asyncHandler(async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [donations, messages, galleryCount, blogs] = await Promise.all([
    Donation.find().sort({ createdAt: -1 }),
    Message.find().sort({ createdAt: -1 }),
    GalleryItem.countDocuments(),
    BlogPost.find().sort({ createdAt: -1 }).limit(5),
  ]);

  const monthDonations = donations.filter((d) => new Date(d.createdAt) >= monthStart);
  const monthTotal = monthDonations.reduce((sum, d) => sum + parseAmount(d.amount), 0);
  const unreadMessages = messages.filter((m) => !m.isRead).length;
  const pendingCount = donations.filter((d) => d.status === 'pending').length;

  const festivalRows = await Festival.find();
  const upcomingFestivalCount = filterUpcomingFestivals(festivalRows).length;

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const total = donations
      .filter((d) => {
        const created = new Date(d.createdAt);
        return created >= start && created < end;
      })
      .reduce((sum, d) => sum + parseAmount(d.amount), 0);

    last6Months.push({
      m: MONTH_LABELS[start.getMonth()],
      total,
    });
  }

  const maxTotal = Math.max(...last6Months.map((m) => m.total), 1);
  const chart = last6Months.map((m) => ({
    m: m.m,
    h: `${Math.round((m.total / maxTotal) * 100)}%`,
  }));

  const activity = [];

  for (const d of donations.slice(0, 3)) {
    activity.push({
      text: `New donation ${d.amount} from ${d.donorName}`,
      time: relativeTime(d.createdAt).toUpperCase(),
    });
  }

  for (const m of messages.filter((msg) => !msg.isRead).slice(0, 2)) {
    activity.push({
      text: `New contact message from ${m.name}`,
      time: relativeTime(m.createdAt).toUpperCase(),
    });
  }

  for (const b of blogs.slice(0, 1)) {
    activity.push({
      text: `Blog post “${b.title}” published`,
      time: relativeTime(b.createdAt).toUpperCase(),
    });
  }

  res.json({
    donationsThisMonth: formatAmountShort(monthTotal),
    donationCount: monthDonations.length,
    pendingCount,
    unreadMessages,
    galleryCount,
    upcomingFestivals: upcomingFestivalCount,
    last6Months: chart,
    recentActivity: activity.slice(0, 4),
  });
});
