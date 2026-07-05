import { apiPost, endpoints } from '../api/client';
import { getVolunteerSession } from './rathWallSession';

const SEND_INTERVAL_MS = 10_000;

let watchId = null;
let sendTimer = null;
let coordsRef = { lat: null, lng: null };

let state = {
  sharing: false,
  coords: { lat: null, lng: null },
  geoError: '',
  sendError: '',
  lastSent: null,
};

const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch) {
  state = { ...state, ...patch };
  emit();
}

export function getGpsState() {
  return state;
}

export function subscribeGps(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function sendLocation() {
  const { lat, lng } = coordsRef;
  const token = getVolunteerSession();
  if (lat == null || lng == null || !token) return;

  try {
    await apiPost(endpoints.rathUpdateLocation, { lat, lng }, token);
    setState({ lastSent: new Date(), sendError: '' });
  } catch (err) {
    setState({ sendError: err.message ?? 'Failed to send location' });
  }
}

function clearTimers() {
  if (watchId != null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (sendTimer != null) {
    clearInterval(sendTimer);
    sendTimer = null;
  }
}

async function notifyServerStop() {
  const token = getVolunteerSession();
  if (!token) return;

  try {
    await apiPost(endpoints.rathStopLocation, {}, token);
  } catch {
    // Local sharing still stops even if the server is unreachable.
  }
}

export function stopGpsSharing() {
  void notifyServerStop();
  clearTimers();
  coordsRef = { lat: null, lng: null };
  setState({
    sharing: false,
    coords: { lat: null, lng: null },
    geoError: '',
    sendError: '',
    lastSent: null,
  });
}

export function startGpsSharing() {
  if (!navigator.geolocation) {
    setState({ geoError: 'Geolocation is not supported on this device.' });
    return;
  }

  if (!getVolunteerSession()) {
    setState({ geoError: 'Volunteer session expired. Sign in again.' });
    return;
  }

  if (state.sharing) return;

  setState({ geoError: '', sendError: '' });

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      coordsRef = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setState({
        coords: { ...coordsRef },
        geoError: '',
      });
    },
    (err) => {
      setState({ geoError: err.message || 'Could not read GPS location' });
      stopGpsSharing();
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
  );

  sendTimer = setInterval(sendLocation, SEND_INTERVAL_MS);
  setState({ sharing: true });
  sendLocation();
}
