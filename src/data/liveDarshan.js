// src/data/liveDarshan.js
// ─────────────────────────────────────────────────────────────────────────────
// Live Darshan page data — swap for fetch('/api/...') later.
// ─────────────────────────────────────────────────────────────────────────────

import {
  TEMPLE_NAME,
  WHATSAPP_URL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  YOUTUBE_CHANNEL_ID,
  YOUTUBE_CHANNEL_URL,
} from './site.js';

// Mandir YouTube channel — https://www.youtube.com/channel/UC5v5xXR21TOo1FywRdDC0rQ
export { YOUTUBE_CHANNEL_ID };

export const YOUTUBE = {
  channelId: YOUTUBE_CHANNEL_ID,
  channelUrl: YOUTUBE_CHANNEL_URL,
  subscribeUrl: `${YOUTUBE_CHANNEL_URL}?sub_confirmation=1`,
  videosUrl: `${YOUTUBE_CHANNEL_URL}/videos`,
  embedUrl: `https://www.youtube-nocookie.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}`,
};

export const SOCIAL_APPS = [
  {
    id: 'youtube',
    name: 'YouTube',
    handle: 'Live darshan · YouTube channel',
    cta: 'Subscribe',
    href: YOUTUBE.subscribeUrl,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@shree_jagannathmandir',
    cta: 'Follow',
    href: INSTAGRAM_URL,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Jagannath Mandir Maruti Kunj',
    cta: 'Follow',
    href: FACEBOOK_URL,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    handle: 'Mandir Channel',
    cta: 'Connect',
    href: WHATSAPP_URL,
  },
];

export const RECORDINGS = [];

export const CHANNEL_NAME = TEMPLE_NAME;

/** @deprecated Legacy multi-camera data — live darshan is YouTube only. */
export const CAMERAS = [];

/** @deprecated Legacy schedule rail — retained for API compatibility. */
export const SCHEDULE = [];
