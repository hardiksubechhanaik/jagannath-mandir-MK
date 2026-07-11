import { resolveApiOrigin } from '../lib/apiBase.js';

function getApiBase() {
  return resolveApiOrigin();
}

/** Backend origin for uploaded files (/api/media/... or legacy /uploads/...). */
function mediaBase() {
  const base = getApiBase();
  if (!base) return '';
  return base.replace(/\/api\/?$/, '');
}

async function parseError(res) {
  try {
    const body = await res.json();
    return body.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function apiGet(path) {
  const res = await fetch(`${getApiBase()}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiPost(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiPostAuth(path, body, token) {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiGetAuth(path, token) {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiDeleteAuth(path, token) {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiPutAuth(path, body, token) {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiUpload(path, formData) {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiUploadAuth(path, formData, token) {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiUploadPutAuth(path, formData, token) {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${mediaBase()}${url}`;
}

export async function adminPost(path, body) {
  const prefix = getApiBase() || '';
  const url = `${prefix}/api${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export const endpoints = {
  health: '/api/health',
  templeStatus: '/api/temple/status',
  home: '/api/home',
  about: '/api/about',
  gallery: '/api/gallery',
  visit: '/api/visit',
  deities: '/api/deities',
  festivals: '/api/festivals',
  liveDarshan: '/api/live-darshan',
  liveDarshanYoutubeStats: '/api/live-darshan/youtube-stats',
  donate: '/api/donate',
  prasad: '/api/prasad',
  contact: '/api/contact',
  blogs: '/api/blogs',
  devotionalMusic: '/api/devotional-music',
  devotionalMusicSuggestion: '/devotional-music/suggestions',
  contactMessage: '/messages',
  donation: '/donations',
  liveNotify: '/api/live-darshan/notify',
  rathLocation: '/api/rath/location',
  rathUpdateLocation: '/api/rath/update-location',
  rathStopLocation: '/api/rath/stop-location',
  rathWallPhotos: '/api/rath-wall/photos',
  rathWallStatus: '/api/rath-wall/status',
  rathWallSubmit: '/api/rath-wall/submit',
  rathWallVolunteerLogin: '/api/rath-wall/volunteer/login',
  rathWallVolunteerSettings: '/api/rath-wall/volunteer/settings',
  rathWallVolunteerPending: '/api/rath-wall/volunteer/pending',
  rathWallVolunteerApprove: (id) => `/api/rath-wall/volunteer/approve/${id}`,
  rathWallVolunteerReject: (id) => `/api/rath-wall/volunteer/reject/${id}`,
  rathWallVolunteerBlockPhone: '/api/rath-wall/volunteer/block-phone',
  rathWallVolunteerClearWall: '/api/rath-wall/volunteer/clear-wall',
  divyangAssistRequest: '/api/rath-wall/divyang-request',
  divyangVolunteerRequests: '/api/rath-wall/volunteer/divyang-requests',
  divyangVolunteerDismiss: (id) => `/api/rath-wall/volunteer/divyang-requests/${id}/dismiss`,
  creatorsPublic: '/api/rath-wall/creators',
  creatorsVolunteer: '/api/rath-wall/volunteer/creators',
  creatorsVolunteerUpdate: (id) => `/api/rath-wall/volunteer/creators/${id}`,
  creatorsVolunteerDelete: (id) => `/api/rath-wall/volunteer/creators/${id}`,
  sankalpSubmit: '/api/rath-wall/sankalp-submit',
  sankalpsPublic: '/api/rath-wall/sankalps',
  sankalpVolunteerPending: '/api/rath-wall/volunteer/sankalps/pending',
  sankalpVolunteerApprove: (id) => `/api/rath-wall/volunteer/sankalps/${id}/approve`,
  sankalpVolunteerReject: (id) => `/api/rath-wall/volunteer/sankalps/${id}/reject`,
  diyaSubmit: '/api/rath-wall/diya-submit',
  diyasPublic: '/api/rath-wall/diyas',
  diyaVolunteerPending: '/api/rath-wall/volunteer/diyas/pending',
  diyaVolunteerApprove: (id) => `/api/rath-wall/volunteer/diyas/${id}/approve`,
  diyaVolunteerReject: (id) => `/api/rath-wall/volunteer/diyas/${id}/reject`,
  melaStats: '/api/rath-wall/mela-stats',
  melaStatsTrack: (key) => `/api/rath-wall/mela-stats/${key}`,
};
