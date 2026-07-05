import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const ADMIN_ROLES = new Set(['admin', 'manager']);

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  const user = await User.findById(decoded.id).select('-passwordHash');

  if (!user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  req.user = user;
  next();
});

export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || !ADMIN_ROLES.has(req.user.role)) {
    res.status(403);
    throw new Error('Admin access required');
  }
  next();
});

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d',
    algorithm: 'HS256',
  });
}
