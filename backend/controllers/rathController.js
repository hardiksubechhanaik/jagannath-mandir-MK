import asyncHandler from 'express-async-handler';
import { clearRathLocation, getRathLocation, setRathLocation } from '../lib/rathLocationStore.js';
import { getVolunteerSession } from '../lib/wallSessionStore.js';

function readBearerToken(req) {
  const header = req.headers.authorization ?? '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

function getExpectedSecret() {
  if (process.env.RATH_TRACKER_SECRET) return process.env.RATH_TRACKER_SECRET;
  if (process.env.NODE_ENV === 'production') return null;
  return process.env.WALL_VOLUNTEER_SECRET || null;
}

function authorizeRathTracker(req, res) {
  const volunteerToken = readBearerToken(req);
  if (volunteerToken && getVolunteerSession(volunteerToken)) {
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    res.status(401);
    throw new Error('Volunteer authorization required');
  }

  const expected = getExpectedSecret();
  if (!expected) {
    res.status(503);
    throw new Error('Rath tracker is not configured on the server');
  }

  const { secret } = req.body ?? {};
  if (secret !== expected) {
    res.status(401);
    throw new Error('Invalid secret');
  }
}

export const updateRathLocation = asyncHandler(async (req, res) => {
  authorizeRathTracker(req, res);

  const { lat, lng } = req.body ?? {};
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    res.status(400);
    throw new Error('lat and lng must be valid numbers');
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    res.status(400);
    throw new Error('Coordinates out of range');
  }

  setRathLocation(latitude, longitude);
  res.json({ success: true });
});

export const stopRathLocation = asyncHandler(async (req, res) => {
  authorizeRathTracker(req, res);
  clearRathLocation();
  res.json({ success: true });
});

export const getRathLocationPublic = asyncHandler(async (_req, res) => {
  res.json(getRathLocation());
});
