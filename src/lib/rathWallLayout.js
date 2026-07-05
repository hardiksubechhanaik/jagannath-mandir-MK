const WALL_MARGIN = { left: 3, top: 5, right: 16, bottom: 14 };

function hashId(id) {
  return [...String(id)].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
}

function rotFromId(id, spread = 20) {
  const hash = hashId(id);
  return Math.round(-spread / 2 + (hash % spread));
}

function itemId(entry) {
  return entry.id ?? entry._id ?? entry.createdAt ?? Math.random();
}

function buildRegionSlots(cols, rows, region) {
  const usableWidth = 100 - region.left - region.right;
  const usableHeight = 100 - region.top - region.bottom;
  const cellW = usableWidth / cols;
  const cellH = usableHeight / rows;
  const slots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      slots.push({
        leftPct: region.left + col * cellW + cellW * 0.05,
        topPct: region.top + row * cellH + cellH * 0.04,
      });
    }
  }

  return slots;
}

const PHOTO_REGION = { left: 2, top: 6, right: 14, bottom: 38 };
const SANKALP_REGION = { left: 2, top: 34, right: 18, bottom: 22 };
const DIYA_REGION = { left: WALL_MARGIN.left, top: WALL_MARGIN.top, right: WALL_MARGIN.right, bottom: WALL_MARGIN.bottom };

const PHOTO_SLOTS = buildRegionSlots(3, 3, PHOTO_REGION);
const SANKALP_SLOTS = buildRegionSlots(2, 5, SANKALP_REGION);
const DIYA_SLOTS = buildRegionSlots(5, 4, DIYA_REGION);

function layoutItems(items, slots, zBase, rotSpread) {
  return items.map((entry, index) => {
    const id = itemId(entry);
    const slot = slots[index % slots.length];
    const layer = Math.floor(index / slots.length);
    const jitterX = (hashId(id) % 9) - 4;
    const jitterY = (hashId(`${id}-y`) % 9) - 4;

    return {
      ...entry,
      leftPct: Math.max(1, Math.min(84, slot.leftPct + layer * 2.5 + jitterX * 0.3)),
      topPct: Math.max(2, Math.min(78, slot.topPct + layer * 2.5 + jitterY * 0.3)),
      rot: rotFromId(id, rotSpread),
      z: zBase + index + layer * 2,
    };
  });
}

/**
 * Each wall item type gets its own grid region so photos are not pushed out
 * by sankalps/diyas. Photos sit on the highest z layer when areas overlap.
 */
export function layoutWallBoard({ photos = [], sankalps = [], diyas = [] }) {
  return {
    photos: layoutItems(photos, PHOTO_SLOTS, 60, 18),
    sankalps: layoutItems(sankalps, SANKALP_SLOTS, 35, 20),
    diyas: layoutItems(diyas, DIYA_SLOTS, 10, 24),
  };
}
