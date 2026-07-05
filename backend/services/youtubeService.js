import { YOUTUBE_CHANNEL_ID } from '../../src/data/liveDarshan.js';

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';
const CACHE_MS = 60_000;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

let cache = { data: null, expiresAt: 0 };
let videosCache = { data: null, expiresAt: 0 };

const VIDEOS_CACHE_MS = 5 * 60_000;
const DEFAULT_VIDEO_LIMIT = 3;

function formatSubscribers(count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (n >= 10_000) {
    const v = n / 1_000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}K`;
  }
  return n.toLocaleString('en-US');
}

function formatWatching(count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n < 0) return null;
  return n.toLocaleString('en-US');
}

function parseSubscriberLabel(label) {
  const match = String(label).match(/^([\d.,]+)\s*([KkMm]?)\s*subscribers$/i);
  if (!match) return null;

  let value = Number.parseFloat(match[1].replace(/,/g, ''));
  if (!Number.isFinite(value)) return null;

  const suffix = match[2]?.toUpperCase();
  if (suffix === 'K') value *= 1_000;
  if (suffix === 'M') value *= 1_000_000;

  return Math.round(value);
}

function parseSubscribersFromHtml(html) {
  const match =
    html.match(/"accessibilityLabel":"([\d.,KMkm]+ subscribers)"/i) ??
    html.match(/"content":"([\d.,KMkm]+ subscribers)"/i);
  return match ? parseSubscriberLabel(match[1]) : null;
}

function parseWatchingFromHtml(html) {
  const patterns = [
    /"accessibilityLabel":"([\d.,]+)\s*watching(?: now)?"/i,
    /"simpleText":"([\d.,]+)\s*watching(?: now)?"/i,
    /"text":"([\d.,]+)\s*watching(?: now)?"/i,
    /([\d,]+)\s+watching now/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const value = Number.parseInt(match[1].replace(/,/g, ''), 10);
      if (Number.isFinite(value) && value >= 0) return value;
    }
  }

  return null;
}

async function fetchYoutubePage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) {
    throw new Error(`YouTube page ${res.status} for ${url}`);
  }
  return res.text();
}

async function fetchPublicChannelStats(channelId) {
  const [channelHtml, liveHtml] = await Promise.all([
    fetchYoutubePage(`https://www.youtube.com/channel/${channelId}`),
    fetchYoutubePage(`https://www.youtube.com/channel/${channelId}/live`),
  ]);

  const subscriberCount =
    parseSubscribersFromHtml(channelHtml) ?? parseSubscribersFromHtml(liveHtml);
  const concurrentViewers =
    parseWatchingFromHtml(liveHtml) ?? parseWatchingFromHtml(channelHtml);

  return { subscriberCount, concurrentViewers };
}

async function ytFetch(path, params) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const url = new URL(`${YOUTUBE_API}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set('key', apiKey);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`YouTube API ${res.status}: ${body.slice(0, 120)}`);
  }
  return res.json();
}

async function fetchLiveVideoId(channelId) {
  const data = await ytFetch('/search', {
    part: 'id',
    channelId,
    eventType: 'live',
    type: 'video',
    maxResults: '1',
  });
  return data?.items?.[0]?.id?.videoId ?? null;
}

async function fetchConcurrentViewers(videoId) {
  const data = await ytFetch('/videos', {
    part: 'liveStreamingDetails',
    id: videoId,
  });
  const viewers = data?.items?.[0]?.liveStreamingDetails?.concurrentViewers;
  return viewers != null ? Number(viewers) : null;
}

async function fetchChannelSubscribers(channelId) {
  const data = await ytFetch('/channels', {
    part: 'statistics',
    id: channelId,
  });
  const hidden = data?.items?.[0]?.statistics?.hiddenSubscriberCount;
  if (hidden) return null;
  const count = data?.items?.[0]?.statistics?.subscriberCount;
  return count != null ? Number(count) : null;
}

async function fetchApiChannelStats(channelId) {
  const [subscriberCount, liveVideoId] = await Promise.all([
    fetchChannelSubscribers(channelId),
    fetchLiveVideoId(channelId),
  ]);

  let concurrentViewers = null;
  if (liveVideoId) {
    concurrentViewers = await fetchConcurrentViewers(liveVideoId);
  }

  return { subscriberCount, concurrentViewers, source: 'api' };
}

function buildStatsResult({ subscriberCount, concurrentViewers, source }) {
  return {
    configured: true,
    source,
    subscribers: subscriberCount != null ? formatSubscribers(subscriberCount) : null,
    watching:
      concurrentViewers != null && concurrentViewers > 0
        ? formatWatching(concurrentViewers)
        : null,
    isLive: concurrentViewers != null && concurrentViewers > 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function getYoutubeChannelStats() {
  const now = Date.now();
  if (cache.data && now < cache.expiresAt) {
    return cache.data;
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID;
  const hasApiKey = Boolean(process.env.YOUTUBE_API_KEY);

  try {
    let stats = null;

    if (hasApiKey) {
      try {
        stats = await fetchApiChannelStats(channelId);
      } catch (err) {
        console.error('[youtubeService] API failed, falling back to public page:', err.message);
      }
    }

    if (!stats || (stats.subscriberCount == null && stats.concurrentViewers == null)) {
      const publicStats = await fetchPublicChannelStats(channelId);
      stats = {
        subscriberCount: stats?.subscriberCount ?? publicStats.subscriberCount,
        concurrentViewers: stats?.concurrentViewers ?? publicStats.concurrentViewers,
        source: hasApiKey && stats?.subscriberCount != null ? 'api+public' : 'public',
      };
    }

    const result = buildStatsResult(stats);
    cache = { data: result, expiresAt: now + CACHE_MS };
    return result;
  } catch (err) {
    console.error('[youtubeService]', err.message);
    const fallback = cache.data ?? {
      configured: false,
      source: 'none',
      subscribers: null,
      watching: null,
      isLive: false,
      updatedAt: new Date().toISOString(),
    };
    cache = { data: fallback, expiresAt: now + 15_000 };
    return fallback;
  }
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatPublishedDate(value) {
  if (!value) return '';
  if (/ago$/i.test(value) || /^\d+[wdhmys]/i.test(value)) {
    return value.toUpperCase();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).toUpperCase();

  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function parseIso8601Duration(value) {
  if (!value) return '';
  const match = String(value).match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function normalizeRecording(video) {
  return {
    id: video.id,
    title: video.title,
    date: video.date,
    duration: video.duration,
    href: video.href,
    thumbnail: video.thumbnail,
  };
}

function parseLockupVideosFromHtml(html) {
  const start = html.indexOf('var ytInitialData = ');
  if (start < 0) return [];

  const jsonStart = start + 'var ytInitialData = '.length;
  const jsonEnd = html.indexOf(';</script>', jsonStart);
  if (jsonEnd < 0) return [];

  const data = JSON.parse(html.slice(jsonStart, jsonEnd));
  const videos = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (node.lockupViewModel) {
      const lockup = node.lockupViewModel;
      const thumb =
        lockup.contentImage?.thumbnailViewModel?.image?.sources?.at(-1)?.url ?? null;
      const badges =
        lockup.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel
          ?.badges;
      const duration = badges?.[0]?.thumbnailBadgeViewModel?.text ?? '';
      const title = lockup.metadata?.lockupMetadataViewModel?.title?.content ?? '';
      const metadataParts =
        lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel
          ?.metadataRows?.[0]?.metadataParts ?? [];
      const relativeDate =
        metadataParts.at(-1)?.accessibilityLabel ??
        metadataParts.at(-1)?.text?.content ??
        '';
      const videoId =
        lockup.onTap?.innertubeCommand?.watchEndpoint?.videoId ??
        thumb?.match(/\/vi\/([a-zA-Z0-9_-]{11})\//)?.[1] ??
        null;

      if (videoId && title) {
        videos.push({
          id: videoId,
          title,
          date: formatPublishedDate(relativeDate),
          duration,
          href: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: thumb,
        });
      }
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
    }
  }

  walk(data);

  return [...new Map(videos.map((video) => [video.id, video])).values()];
}

async function fetchRssPublishedDates(channelId) {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) return new Map();

  const xml = await res.text();
  const dates = new Map();

  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const entry = match[1];
    const id = entry.match(/<yt:videoId>([^<]+)/)?.[1];
    const published = entry.match(/<published>([^<]+)/)?.[1];
    if (id && published) dates.set(id, published);
  }

  return dates;
}

async function fetchPublicRecentVideos(channelId, limit) {
  const html = await fetchYoutubePage(`https://www.youtube.com/channel/${channelId}/videos`);
  const scraped = parseLockupVideosFromHtml(html).slice(0, limit * 2);

  if (!scraped.length) return [];

  const publishedDates = await fetchRssPublishedDates(channelId);

  return scraped.slice(0, limit).map((video) => ({
    ...video,
    date: publishedDates.has(video.id)
      ? formatPublishedDate(publishedDates.get(video.id))
      : video.date,
  }));
}

async function fetchApiRecentVideos(channelId, limit) {
  const search = await ytFetch('/search', {
    part: 'snippet',
    channelId,
    order: 'date',
    type: 'video',
    maxResults: String(limit),
  });

  const ids = search?.items?.map((item) => item.id?.videoId).filter(Boolean) ?? [];
  if (!ids.length) return [];

  const details = await ytFetch('/videos', {
    part: 'snippet,contentDetails',
    id: ids.join(','),
  });

  return (
    details?.items?.map((item) => ({
      id: item.id,
      title: item.snippet?.title ?? '',
      date: formatPublishedDate(item.snippet?.publishedAt),
      duration: parseIso8601Duration(item.contentDetails?.duration),
      href: `https://www.youtube.com/watch?v=${item.id}`,
      thumbnail:
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        null,
    })) ?? []
  );
}

export async function getYoutubeRecentVideos(limit = DEFAULT_VIDEO_LIMIT) {
  const now = Date.now();
  const cacheKey = limit;

  if (
    videosCache.data &&
    videosCache.limit === cacheKey &&
    now < videosCache.expiresAt
  ) {
    return videosCache.data;
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID;
  const hasApiKey = Boolean(process.env.YOUTUBE_API_KEY);

  try {
    let videos = [];

    if (hasApiKey) {
      try {
        videos = await fetchApiRecentVideos(channelId, limit);
      } catch (err) {
        console.error('[youtubeService] video API failed, falling back to public page:', err.message);
      }
    }

    if (!videos.length) {
      videos = await fetchPublicRecentVideos(channelId, limit);
    }

    const result = videos.map(normalizeRecording);
    videosCache = { data: result, limit: cacheKey, expiresAt: now + VIDEOS_CACHE_MS };
    return result;
  } catch (err) {
    console.error('[youtubeService] recent videos:', err.message);
    return videosCache.data ?? [];
  }
}
