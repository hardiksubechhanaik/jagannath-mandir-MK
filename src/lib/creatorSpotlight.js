export const CREATOR_TIERS = {
  OFFICIAL: 'official',
  DIGITAL: 'digital',
};

export const CREATOR_TIER_LABELS = {
  [CREATOR_TIERS.OFFICIAL]: 'Official Creator Partner',
  [CREATOR_TIERS.DIGITAL]: 'Digital Partner',
};

/** @deprecated use isHighlightedCreator */
export function isOfficialCreator(creator) {
  return isHighlightedCreator(creator);
}

export function isHighlightedCreator(creator) {
  if (!creator) return false;
  if (creator.highlighted === true) return true;
  if (creator.highlighted === false) return false;
  return creator.tier === CREATOR_TIERS.OFFICIAL;
}

export function getPartnerTypeLabel(creator) {
  const label = String(creator?.partnerType ?? '').trim();
  if (label) return label;
  if (creator?.tier === CREATOR_TIERS.OFFICIAL) return CREATOR_TIER_LABELS[CREATOR_TIERS.OFFICIAL];
  if (creator?.tier === CREATOR_TIERS.DIGITAL) return CREATOR_TIER_LABELS[CREATOR_TIERS.DIGITAL];
  return 'Partner';
}

export function sortCreatorsForDisplay(creators = []) {
  return [...creators].sort((a, b) => {
    const highlightDiff = Number(isHighlightedCreator(b)) - Number(isHighlightedCreator(a));
    if (highlightDiff !== 0) return highlightDiff;
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return String(a.createdAt).localeCompare(String(b.createdAt));
  });
}

/** Group partners by their custom type label for admin lists and mela modal. */
export function groupCreatorsByType(creators = []) {
  const groups = new Map();
  for (const creator of creators) {
    const type = getPartnerTypeLabel(creator);
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push(creator);
  }

  return [...groups.entries()]
    .sort(([typeA, itemsA], [typeB, itemsB]) => {
      const aHighlight = itemsA.some(isHighlightedCreator);
      const bHighlight = itemsB.some(isHighlightedCreator);
      if (aHighlight !== bHighlight) return Number(bHighlight) - Number(aHighlight);
      return typeA.localeCompare(typeB);
    })
    .map(([type, items]) => ({
      type,
      items: sortCreatorsForDisplay(items),
      highlighted: items.some(isHighlightedCreator),
    }));
}

/** @deprecated use groupCreatorsByType or sortCreatorsForDisplay */
export function partitionCreators(creators = []) {
  const official = [];
  const digital = [];
  for (const creator of creators) {
    if (isHighlightedCreator(creator)) official.push(creator);
    else digital.push(creator);
  }
  return { official, digital };
}

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

export function hasInstagramHandle(handle) {
  const value = String(handle ?? '').trim();
  if (!value || value === '@') return false;
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      return url.hostname.endsWith('instagram.com') && url.pathname.split('/').filter(Boolean).length > 0;
    } catch {
      return false;
    }
  }
  const username = value.replace(/^@/, '').replace(/[^\w.]/g, '');
  return Boolean(username);
}

export function instagramProfileUrl(handle) {
  if (!hasInstagramHandle(handle)) return '';
  const value = String(handle ?? '').trim();
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
