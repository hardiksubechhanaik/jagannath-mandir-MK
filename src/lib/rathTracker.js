import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import startMarkerImg from '../assets/rath/start-marker.png';
import trackerMarkerImg from '../assets/rath/tracker-marker.png';
import endMarkerImg from '../assets/rath/end-marker.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

/** Map default centre — middle of the current Rath route loop */
export const RATH_MAP_CENTER = [28.3584, 77.0797];
export const RATH_MAP_ZOOM = 16;

/** Location is stale after this many ms without an update from the volunteer. */
export const RATH_LIVE_STALE_MS = 30_000;

/** How often the public map polls the server for the live Rath position. */
export const RATH_POLL_MS = 2_000;

const MARKER_SIZE = 36;
const END_MARKER_HEIGHT = 32;

function createStaticRathIcon(src, className, options = {}) {
  const { iconSize, iconAnchor, html } = options;
  const anchor = iconAnchor ?? [MARKER_SIZE / 2, MARKER_SIZE / 2];
  return L.divIcon({
    className: 'rath-marker-wrap',
    html: html ?? `<div class="rath-marker ${className}"><img src="${src}" alt="" /></div>`,
    iconSize: iconSize ?? [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: anchor,
    popupAnchor: [0, -anchor[1]],
  });
}

export function createRathStartIcon() {
  return createStaticRathIcon(startMarkerImg, 'rath-marker-start');
}

export function createRathEndIcon() {
  return createStaticRathIcon(endMarkerImg, 'rath-marker-end', {
    iconSize: [MARKER_SIZE, END_MARKER_HEIGHT],
    iconAnchor: [MARKER_SIZE / 2, END_MARKER_HEIGHT],
    html: `<div class="rath-marker rath-marker-end"><div class="rath-marker-triangle"><img src="${endMarkerImg}" alt="" /></div></div>`,
  });
}

export function createRathTrackerIcon() {
  return L.divIcon({
    className: 'rath-marker-wrap',
    html: `<div class="rath-marker rath-marker-tracker"><span class="rath-tracker-pulse"></span><img src="${trackerMarkerImg}" alt="" /></div>`,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
    popupAnchor: [0, -MARKER_SIZE / 2],
  });
}

function distSq(a, b) {
  const dLat = a[0] - b[0];
  const dLng = a[1] - b[1];
  return dLat * dLat + dLng * dLng;
}

function closestPointOnSegment(point, start, end) {
  const seg = [end[0] - start[0], end[1] - start[1]];
  const toPoint = [point[0] - start[0], point[1] - start[1]];
  const segLenSq = seg[0] * seg[0] + seg[1] * seg[1];
  let t = segLenSq === 0 ? 0 : (toPoint[0] * seg[0] + toPoint[1] * seg[1]) / segLenSq;
  t = Math.max(0, Math.min(1, t));
  const projected = [start[0] + t * seg[0], start[1] + t * seg[1]];
  return { point: projected, t, distSq: distSq(point, projected) };
}

/** Route ahead of the live Rath position — hides the portion already crossed. */
export function getRemainingRouteWaypoints(waypoints, lat, lng) {
  if (waypoints.length < 2 || lat == null || lng == null) {
    return waypoints;
  }

  const position = [lat, lng];
  let best = { segmentIndex: 0, distSq: Infinity, progress: 0, point: waypoints[0], t: 0 };
  let cumulative = 0;

  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    const segLen = Math.sqrt(distSq(start, end));
    const { point, t, distSq: segmentDistSq } = closestPointOnSegment(position, start, end);
    const progress = cumulative + t * segLen;

    if (
      segmentDistSq < best.distSq - 1e-12
      || (Math.abs(segmentDistSq - best.distSq) < 1e-12 && progress > best.progress)
    ) {
      best = { segmentIndex: i, distSq: segmentDistSq, progress, point, t };
    }

    cumulative += segLen;
  }

  if (best.progress >= cumulative - 1e-8) {
    return [waypoints[waypoints.length - 1]];
  }

  // Snap the line to the route polyline — never draw from raw GPS across blocks.
  const remaining = [best.point];
  for (let i = best.segmentIndex + 1; i < waypoints.length; i += 1) {
    remaining.push(waypoints[i]);
  }

  return remaining.length > 1 ? remaining : [waypoints[waypoints.length - 1]];
}

/** @deprecated Use createRathTrackerIcon */
export function createRathMarkerIcon() {
  return createRathTrackerIcon();
}

export function isRathLocationLive(updatedAt) {
  if (!updatedAt) return false;
  return Date.now() - new Date(updatedAt).getTime() < RATH_LIVE_STALE_MS;
}

export function secondsSinceUpdate(updatedAt) {
  if (!updatedAt) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000));
}

export function googleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two [lat, lng] points in kilometres. */
export function haversineKm(a, b) {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Total polyline length in kilometres. */
export function getRouteDistanceKm(waypoints) {
  if (waypoints.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    total += haversineKm(waypoints[i], waypoints[i + 1]);
  }
  return total;
}

/** Distance remaining along the route from a live GPS position. */
export function getRemainingRouteDistanceKm(waypoints, lat, lng) {
  const remaining = getRemainingRouteWaypoints(waypoints, lat, lng);
  return getRouteDistanceKm(remaining);
}

/** Progress along the polyline as 0–1 (GPS snapped to route). */
export function getRouteProgressFraction(waypoints, lat, lng) {
  if (waypoints.length < 2 || lat == null || lng == null) return 0;

  const totalKm = getRouteDistanceKm(waypoints);
  if (totalKm <= 0) return 0;

  const remainingKm = getRemainingRouteDistanceKm(waypoints, lat, lng);
  const traveledKm = Math.max(0, totalKm - remainingKm);
  return Math.max(0, Math.min(1, traveledKm / totalKm));
}

/**
 * Progress & ETA on the official track length (e.g. 2.2 km),
 * scaling GPS position along the mapped polyline.
 */
export function getTrackProgressStats(waypoints, lat, lng, trackLengthKm, speedKmh) {
  const fraction = getRouteProgressFraction(waypoints, lat, lng);
  const traveledKm = fraction * trackLengthKm;
  const remainingKm = Math.max(0, (1 - fraction) * trackLengthKm);
  const remainingMins = estimateRemainingMinutes(remainingKm, speedKmh);
  const totalMins = estimateRemainingMinutes(trackLengthKm, speedKmh);

  return {
    fraction,
    traveledKm,
    remainingKm,
    remainingMins,
    totalMins,
  };
}

/** Rough ETA from remaining distance at procession walking speed. */
export function estimateRemainingMinutes(remainingKm, speedKmh = 2.2 / 3.5) {
  if (remainingKm <= 0) return 0;
  return Math.ceil((remainingKm / speedKmh) * 60);
}

export function formatDistanceKm(km) {
  if (km < 1) return `~${Math.round(km * 1000)} m`;
  return `~${km.toFixed(1)} km`;
}

export function formatDurationMinutes(mins) {
  if (mins <= 0) return null;
  if (mins < 60) return `~${mins} min`;

  const hours = mins / 60;
  const roundedHalf = Math.round(hours * 2) / 2;
  if (Math.abs(hours - roundedHalf) < 0.08) {
    return `~${roundedHalf} hr`;
  }

  const wholeHours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (remainder === 0) return `~${wholeHours} hr`;
  return `~${wholeHours} hr ${remainder} min`;
}
