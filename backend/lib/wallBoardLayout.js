const WALL_MARGIN = { left: 3, top: 5, right: 16, bottom: 14 };

function hashId(id) {
  return [...String(id)].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
}

function rotFromId(id, spread = 20) {
  const hash = hashId(id);
  return Math.round(-spread / 2 + (hash % spread));
}

function buildSlotGrid(cols, rows) {
  const usableWidth = 100 - WALL_MARGIN.left - WALL_MARGIN.right;
  const usableHeight = 100 - WALL_MARGIN.top - WALL_MARGIN.bottom;
  const cellW = usableWidth / cols;
  const cellH = usableHeight / rows;
  const slots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      slots.push({
        leftPct: WALL_MARGIN.left + col * cellW + cellW * 0.06,
        topPct: WALL_MARGIN.top + row * cellH + cellH * 0.05,
      });
    }
  }

  return slots;
}

const BOARD_SLOTS = buildSlotGrid(4, 4);

export function pickNextWallPosition(id, occupiedCount, rotSpread = 20) {
  const slot = BOARD_SLOTS[occupiedCount % BOARD_SLOTS.length];
  const layer = Math.floor(occupiedCount / BOARD_SLOTS.length);
  const jitterX = (hashId(id) % 9) - 4;
  const jitterY = (hashId(`${id}-y`) % 9) - 4;

  return {
    leftPct: Math.max(1, Math.min(86, slot.leftPct + layer * 2.8 + jitterX * 0.35)),
    topPct: Math.max(2, Math.min(80, slot.topPct + layer * 2.8 + jitterY * 0.35)),
    rot: rotFromId(id, rotSpread),
    z: 10 + occupiedCount,
  };
}

export function countBoardOccupancy({ photoCount = 0, sankalpCount = 0, diyaCount = 0 } = {}) {
  return photoCount + sankalpCount + diyaCount;
}
