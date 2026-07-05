import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../.data/divyang-requests.json');

const requests = new Map();

function persist() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify([...requests.values()], null, 2));
}

function restore() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const rows = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!Array.isArray(rows)) return;
    rows.forEach((entry) => {
      if (entry?.id) requests.set(entry.id, entry);
    });
  } catch {
    // ignore corrupt file
  }
}

restore();

export function createDivyangRequest(phone) {
  const id = `da-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const entry = {
    id,
    phone,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  requests.set(id, entry);

  if (requests.size > 100) {
    const oldest = [...requests.values()].sort(
      (a, b) => a.createdAt.localeCompare(b.createdAt),
    )[0];
    if (oldest) requests.delete(oldest.id);
  }

  persist();
  return entry;
}

export function listPendingDivyangRequests() {
  return [...requests.values()]
    .filter((entry) => entry.status === 'pending')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function dismissDivyangRequest(id) {
  const entry = requests.get(id);
  if (!entry) return null;
  entry.status = 'dismissed';
  entry.dismissedAt = new Date().toISOString();
  persist();
  return entry;
}
