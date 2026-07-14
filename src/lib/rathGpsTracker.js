import { apiPost, endpoints } from '../api/client';
import { getVolunteerSession } from './rathWallSession';

/** How often the volunteer phone pushes GPS to the server. */
export const SEND_INTERVAL_MS = 2_000;

let watchId = null;
let sendTimer = null;
let wakeLock = null;
let coordsRef = { lat: null, lng: null };
let sending = false;

let state = {
  sharing: false,
  coords: { lat: null, lng: null },
  geoError: '',
  sendError: '',
  lastSent: null,
  wakeLockActive: false,
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
  if (lat == null || lng == null || !token || sending) return;

  sending = true;
  try {
    await apiPost(endpoints.rathUpdateLocation, { lat, lng }, token);
    setState({ lastSent: new Date(), sendError: '' });
  } catch (err) {
    setState({ sendError: err.message ?? 'Failed to send location' });
  } finally {
    sending = false;
  }
}

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) {
    setState({ wakeLockActive: false });
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    setState({ wakeLockActive: true });
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
      setState({ wakeLockActive: false });
      if (state.sharing) {
        void requestWakeLock();
      }
    });
  } catch {
    setState({ wakeLockActive: false });
  }
}

async function releaseWakeLock() {
  try {
    await wakeLock?.release();
  } catch {
    // ignore
  }
  wakeLock = null;
  setState({ wakeLockActive: false });
}

function onVisibilityChange() {
  if (!state.sharing) return;

  if (document.visibilityState === 'visible') {
    void requestWakeLock();
    void sendLocation();
  } else {
    // Tab backgrounded — still push immediately while the browser lets us run.
    void sendLocation();
  }
}

function onPageShow() {
  if (!state.sharing) return;
  void requestWakeLock();
  void sendLocation();
}

function onBeforeUnload(event) {
  if (!state.sharing) return;
  event.preventDefault();
  event.returnValue = '';
}

function attachLifecycleListeners() {
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('beforeunload', onBeforeUnload);
}

function detachLifecycleListeners() {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('pageshow', onPageShow);
  window.removeEventListener('beforeunload', onBeforeUnload);
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
  detachLifecycleListeners();
  void releaseWakeLock();
  coordsRef = { lat: null, lng: null };
  setState({
    sharing: false,
    coords: { lat: null, lng: null },
    geoError: '',
    sendError: '',
    lastSent: null,
    wakeLockActive: false,
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
      // Keep sharing on temporary GPS blips; only surface the error.
      setState({ geoError: err.message || 'Could not read GPS location' });
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    },
  );

  sendTimer = setInterval(sendLocation, SEND_INTERVAL_MS);
  attachLifecycleListeners();
  void requestWakeLock();
  setState({ sharing: true });
  sendLocation();
}
