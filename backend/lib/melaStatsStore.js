import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../.data/mela-stats.json');

export const MELA_STALL_KEYS = [
  'rope',
  'diya',
  'sankalp',
  'trivia',
  'cert',
  'guide',
  'divyang',
  'helpline',
  'creators',
  'memory',
];

const counts = Object.fromEntries(MELA_STALL_KEYS.map((key) => [key, 0]));

function persist() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(counts, null, 2));
}

function restore() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!data || typeof data !== 'object') return;
    MELA_STALL_KEYS.forEach((key) => {
      if (typeof data[key] === 'number' && data[key] >= 0) counts[key] = data[key];
    });
  } catch {
    // ignore corrupt file
  }
}

restore();

export function getMelaStats() {
  return { ...counts };
}

export function incrementMelaStat(key) {
  if (!MELA_STALL_KEYS.includes(key)) return null;
  counts[key] += 1;
  persist();
  return counts[key];
}
