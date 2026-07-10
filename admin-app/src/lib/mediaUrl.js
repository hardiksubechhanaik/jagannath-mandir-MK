const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5174';

/** Resolve image URLs for admin previews (main site assets + backend uploads). */
export function resolvePreviewUrl(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;

  const apiOrigin = API_BASE.replace(/\/api\/?$/, '');
  const siteOrigin = SITE_URL.replace(/\/$/, '');

  if (url.startsWith('/uploads') || url.startsWith('/api/media')) {
    return `${apiOrigin}${url}`;
  }

  if (url.startsWith('/')) {
    return `${siteOrigin}${url}`;
  }

  return url;
}
