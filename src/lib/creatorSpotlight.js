const CHANNEL = 'creator-spotlight';

export function notifyCreatorSpotlightUpdate() {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage('update');
    channel.close();
  } catch {
    // ignore
  }
}

export function subscribeCreatorSpotlightUpdates(callback) {
  let channel;
  try {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = () => callback();
  } catch {
    // ignore
  }
  return () => channel?.close();
}

export function instagramProfileUrl(handle) {
  const value = String(handle ?? '').trim();
  if (!value) return 'https://www.instagram.com/';
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (!url.hostname.endsWith('instagram.com')) {
        return 'https://www.instagram.com/';
      }
      return url.toString();
    } catch {
      return 'https://www.instagram.com/';
    }
  }
  const username = value.replace(/^@/, '').replace(/[^\w.]/g, '');
  if (!username) return 'https://www.instagram.com/';
  return `https://www.instagram.com/${username}/`;
}

export function formatInstagramHandle(handle) {
  const value = String(handle ?? '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) {
    try {
      const parts = new URL(value).pathname.split('/').filter(Boolean);
      return parts[0] ? `@${parts[0]}` : value;
    } catch {
      return value;
    }
  }
  return value.startsWith('@') ? value : `@${value}`;
}
