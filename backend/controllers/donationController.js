import asyncHandler from 'express-async-handler';
import Donation from '../models/Donation.js';
import Setting from '../models/Setting.js';
import {
  formatDateLabel,
  statusToBackend,
  statusToFrontend,
} from '../utils/format.js';
import { clampText, isValidEmail, isValidIndianMobile, parseDonationAmount, sanitizeIndianMobileDigits } from '../lib/validators.js';

function toClient(doc) {
  return {
    id: doc._id.toString(),
    name: doc.donorName,
    freq: doc.freq,
    purpose: doc.purpose,
    amount: doc.amount,
    date: doc.date,
    status: statusToFrontend(doc.status),
    email: doc.email,
  };
}

export const listDonations = asyncHandler(async (_req, res) => {
  const donations = await Donation.find().sort({ createdAt: -1 });
  res.json(donations.map(toClient));
});

export const createDonation = asyncHandler(async (req, res) => {
  const settings = await Setting.findOne();
  if (!settings?.paymentsEnabled) {
    res.status(503);
    throw new Error('Online donations are not available at this time');
  }

  const { donorName, name, freq, purpose, amount, email, mode } = req.body;
  const donor = req.body.donor || {};

  const resolvedName = clampText(donorName || name || donor.name, 120);
  const resolvedEmail = clampText(email || donor.email, 254);
  const resolvedMobile = sanitizeIndianMobileDigits(donor.mobile);
  const parsedAmount = parseDonationAmount(amount);

  if (!resolvedName) {
    res.status(400);
    throw new Error('Donor name is required');
  }
  if (!resolvedEmail || !isValidEmail(resolvedEmail)) {
    res.status(400);
    throw new Error('A valid email is required');
  }
  if (!resolvedMobile || !isValidIndianMobile(resolvedMobile)) {
    res.status(400);
    throw new Error('A valid 10-digit mobile number is required');
  }
  if (parsedAmount == null) {
    res.status(400);
    throw new Error('A valid donation amount is required');
  }

  const donation = await Donation.create({
    donorName: resolvedName,
    freq: clampText(freq || (mode === 'monthly' ? 'Monthly' : 'One-time'), 40) || 'One-time',
    purpose: clampText(purpose || 'General', 120) || 'General',
    amount: `₹${parsedAmount.toLocaleString('en-IN')}`,
    date: formatDateLabel(new Date()),
    status: 'pending',
    email: resolvedEmail,
  });

  res.status(201).json({ ok: true, id: donation._id.toString() });
});

export const updateDonation = asyncHandler(async (req, res) => {
  const patch = {};
  if (req.body.status !== undefined) {
    patch.status = statusToBackend(req.body.status);
  }
  if (req.body.donorName !== undefined) patch.donorName = req.body.donorName;
  if (req.body.name !== undefined) patch.donorName = req.body.name;
  if (req.body.freq !== undefined) patch.freq = req.body.freq;
  if (req.body.purpose !== undefined) patch.purpose = req.body.purpose;
  if (req.body.amount !== undefined) patch.amount = req.body.amount;
  if (req.body.email !== undefined) patch.email = req.body.email;

  const donation = await Donation.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  const donations = await Donation.find().sort({ createdAt: -1 });
  res.json(donations.map(toClient));
});

export { toClient };
