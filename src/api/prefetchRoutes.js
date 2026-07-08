import { endpoints } from './client';
import { prefetchPageData } from '../hooks/usePageData';

/** Map public routes to API endpoints for prefetching. */
export const ROUTE_PREFETCH = {
  '/': endpoints.home,
  '/deities': endpoints.deities,
  '/festivals': endpoints.festivals,
  '/live-darshan': endpoints.liveDarshan,
  '/about': endpoints.about,
  '/contact': endpoints.contact,
  '/donate': endpoints.donate,
  '/gallery': endpoints.gallery,
  '/blog': endpoints.blogs,
};

export function prefetchRoute(pathname) {
  const path = pathname.split('#')[0] || '/';
  const endpoint = ROUTE_PREFETCH[path];
  if (endpoint) prefetchPageData(endpoint);
}
