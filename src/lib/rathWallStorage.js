export const RATH_WALL_STORAGE_KEY = 'mandir_rath_wall';

export function placeholderImage(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#EFE3C6"/><g fill="none" stroke="#C9B58A" stroke-width="2"><path d="M0 0l300 300M300 0L0 300"/></g><text x="150" y="155" font-family="monospace" font-size="12" fill="#9A8C70" text-anchor="middle">[ ${label} ]</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createSeedPhotos(PH) {
  return [
    { id: 1, url: PH('Nandighosa'), name: 'Ritika S.', caption: 'The chariot rolling out! 🛕', leftPct: 6, topPct: 10, rot: -6, z: 21, style: 'pin' },
    { id: 2, url: PH('Crowd'), name: 'Anup M.', caption: 'So many devotees today', leftPct: 30, topPct: 6, rot: 4, z: 22, style: 'tape' },
    { id: 3, url: PH('Toran'), name: 'Priya D.', caption: 'Marigolds everywhere ✨', leftPct: 54, topPct: 14, rot: -3, z: 23, style: 'pin' },
    { id: 4, url: PH('Pulling ropes'), name: 'Sanjay B.', caption: 'Pulling the ropes with everyone', leftPct: 18, topPct: 34, rot: 7, z: 24, style: 'pin' },
    { id: 5, url: PH('Prasad'), name: 'Meera R.', caption: 'Mahaprasad after the yatra', leftPct: 44, topPct: 38, rot: -8, z: 25, style: 'tape' },
    { id: 6, url: PH('Gundicha'), name: 'Kailash J.', caption: 'Almost at Gundicha!', leftPct: 68, topPct: 30, rot: 5, z: 26, style: 'pin' },
  ];
}

export function loadWallPhotos() {
  try {
    const raw = localStorage.getItem(RATH_WALL_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map(({ _new, ...photo }) => photo);
    }
  } catch {
    // ignore corrupt storage
  }
  return createSeedPhotos(placeholderImage);
}

export function saveWallPhotos(photos) {
  try {
    const toSave = photos.map(({ _new, ...photo }) => photo);
    localStorage.setItem(RATH_WALL_STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota errors
  }
}
