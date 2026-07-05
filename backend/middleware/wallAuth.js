import { getVolunteerSession } from '../lib/wallSessionStore.js';

function readBearerToken(req) {
  const header = req.headers.authorization ?? '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

export function requireWallVolunteer(req, res, next) {
  const token = readBearerToken(req);
  const session = getVolunteerSession(token);
  if (!session) {
    return res.status(401).json({ message: 'Volunteer login required' });
  }
  req.wallVolunteer = session;
  return next();
}
