import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = path.join(__dirname, '../storage');

async function readList(filename) {
  const filepath = path.join(STORAGE_DIR, filename);
  try {
    const raw = await fs.readFile(filepath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeList(filename, list) {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  const filepath = path.join(STORAGE_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(list, null, 2));
}

export async function appendRecord(filename, record) {
  const list = await readList(filename);
  const entry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...record,
  };
  list.push(entry);
  await writeList(filename, list);
  return entry;
}
