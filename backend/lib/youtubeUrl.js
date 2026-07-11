const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function extractYoutubeVideoId(input = '') {
  const value = String(input).trim();
  if (!value) return '';

  if (VIDEO_ID_RE.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return VIDEO_ID_RE.test(id) ? id : '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const fromQuery = url.searchParams.get('v');
      if (VIDEO_ID_RE.test(fromQuery)) return fromQuery;

      const parts = url.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && VIDEO_ID_RE.test(parts[embedIndex + 1])) {
        return parts[embedIndex + 1];
      }

      const shortIndex = parts.indexOf('shorts');
      if (shortIndex >= 0 && VIDEO_ID_RE.test(parts[shortIndex + 1])) {
        return parts[shortIndex + 1];
      }
    }
  } catch {
    return '';
  }

  return '';
}

export function buildYoutubeLinks(videoId) {
  const id = extractYoutubeVideoId(videoId);
  if (!id) return null;

  return {
    videoId: id,
    youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  };
}
