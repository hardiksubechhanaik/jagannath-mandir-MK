import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';
import { createHandoffCode, consumeHandoffCode } from '../lib/handoffStore.js';
import { createVolunteerSession, getVolunteerSecret } from '../lib/wallSessionStore.js';

const ADMIN_ROLES = new Set(['admin', 'manager']);

function volunteerLoginPayload(user) {
  return {
    user: user ?? { name: 'Volunteer', username: 'volunteer', role: 'volunteer' },
    volunteerWallToken: createVolunteerSession(),
  };
}

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password) {
    res.status(400);
    throw new Error('Username and password are required');
  }

  const normalizedUsername = username.trim().toLowerCase();
  const user = await User.findOne({ username: normalizedUsername });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    if (user.role === 'volunteer') {
      res.json(volunteerLoginPayload({
        name: user.name,
        username: user.username,
        role: user.role,
      }));
      return;
    }

    res.json({
      token: signToken(user._id),
      user: { name: user.name, username: user.username, role: user.role },
    });
    return;
  }

  const volunteerSecret = getVolunteerSecret();
  if (
    volunteerSecret
    && normalizedUsername === 'volunteer'
    && password === volunteerSecret
  ) {
    res.json(volunteerLoginPayload());
    return;
  }

  res.status(401);
  throw new Error('Incorrect username or password');
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    name: req.user.name,
    username: req.user.username,
    role: req.user.role,
  });
});

export const createAdminHandoff = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401);
    throw new Error('Not authorized');
  }
  const code = createHandoffCode(token);
  res.json({ code });
});

export const exchangeAdminHandoff = asyncHandler(async (req, res) => {
  const { code } = req.body ?? {};
  if (!code) {
    res.status(400);
    throw new Error('Handoff code is required');
  }

  const token = consumeHandoffCode(String(code));
  if (!token) {
    res.status(401);
    throw new Error('Invalid or expired handoff code');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user || !ADMIN_ROLES.has(user.role)) {
    res.status(401);
    throw new Error('Invalid handoff code');
  }

  res.json({
    token,
    user: { name: user.name, username: user.username, role: user.role },
  });
});

export const authMiddleware = protect;
