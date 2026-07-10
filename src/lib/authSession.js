export const AUTH_TOKEN_KEY = 'mandir_token';
export const AUTH_USER_KEY = 'mandir_auth';

export function setAuthSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAdminAppUrl() {
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    return `${window.location.origin}/admin`;
  }
  const raw = import.meta.env.VITE_ADMIN_URL;
  if (raw) return raw.replace(/\/login\/?$/, '');
  return 'http://localhost:5173';
}
