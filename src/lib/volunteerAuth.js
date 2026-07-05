import { getVolunteerSession, clearVolunteerSession } from './rathWallSession';

export function isVolunteerAuthError(err) {
  const msg = String(err?.message ?? '').toLowerCase();
  return msg.includes('login') || msg.includes('volunteer') || msg.includes('unauthorized');
}

export async function withVolunteerAuth(apiCall) {
  const token = getVolunteerSession();
  if (!token) throw new Error('Volunteer login required');

  try {
    return await apiCall(token);
  } catch (err) {
    if (!isVolunteerAuthError(err)) throw err;
    clearVolunteerSession();
    throw new Error('Volunteer session expired. Please sign in again.');
  }
}

export function refreshVolunteerSession() {
  return getVolunteerSession();
}
