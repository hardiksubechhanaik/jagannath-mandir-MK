export const PUZZLE_IMAGE = '/images/gallery/jagannath-darshan.png';

export function solvedBoard(size) {
  const total = size * size;
  return Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1));
}

export function getEmptyIndex(board) {
  return board.indexOf(0);
}

export function getNeighborIndices(emptyIndex, size) {
  const row = Math.floor(emptyIndex / size);
  const col = emptyIndex % size;
  const neighbors = [];
  if (row > 0) neighbors.push(emptyIndex - size);
  if (row < size - 1) neighbors.push(emptyIndex + size);
  if (col > 0) neighbors.push(emptyIndex - 1);
  if (col < size - 1) neighbors.push(emptyIndex + 1);
  return neighbors;
}

export function canMoveTile(board, tileIndex, size) {
  if (board[tileIndex] === 0) return false;
  const emptyIndex = getEmptyIndex(board);
  return getNeighborIndices(emptyIndex, size).includes(tileIndex);
}

export function moveTile(board, tileIndex, size) {
  if (!canMoveTile(board, tileIndex, size)) return board;
  const next = [...board];
  const emptyIndex = getEmptyIndex(board);
  [next[emptyIndex], next[tileIndex]] = [next[tileIndex], next[emptyIndex]];
  return next;
}

export function isSolved(board, size) {
  const goal = solvedBoard(size);
  return board.every((value, index) => value === goal[index]);
}

export function shuffleBoard(size, scrambleMoves = 100) {
  let board = solvedBoard(size);
  let emptyIndex = getEmptyIndex(board);
  let lastMoved = -1;

  for (let i = 0; i < scrambleMoves; i += 1) {
    const options = getNeighborIndices(emptyIndex, size).filter((idx) => idx !== lastMoved);
    const pick = options[Math.floor(Math.random() * options.length)];
    [board[emptyIndex], board[pick]] = [board[pick], board[emptyIndex]];
    lastMoved = emptyIndex;
    emptyIndex = pick;
  }

  return board;
}

export function tileBackgroundStyle(tileValue, size, imageUrl) {
  if (tileValue === 0) return {};
  const index = tileValue - 1;
  const row = Math.floor(index / size);
  const col = index % size;
  const step = size > 1 ? 100 / (size - 1) : 0;
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${size * 100}% ${size * 100}%`,
    backgroundPosition: `${col * step}% ${row * step}%`,
  };
}

export function formatPuzzleTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
