const STORAGE_KEY = 'mandir_rath_wall_layout';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function positionKey(itemType, itemId) {
  return `${itemType}:${itemId}`;
}

export function getWallPosition(itemType, itemId) {
  const entry = readAll()[positionKey(itemType, itemId)];
  if (!entry || typeof entry.leftPct !== 'number' || typeof entry.topPct !== 'number') {
    return null;
  }
  return { leftPct: entry.leftPct, topPct: entry.topPct };
}

export function saveWallPosition(itemType, itemId, position) {
  try {
    const all = readAll();
    all[positionKey(itemType, itemId)] = {
      leftPct: position.leftPct,
      topPct: position.topPct,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore quota errors
  }
}
