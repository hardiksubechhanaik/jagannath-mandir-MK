import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pickNextWallPosition } from './wallBoardLayout.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../.data/sankalps.json');

export const MAX_APPROVED_SANKALPS = 30;

const sankalps = new Map();

function persist() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify([...sankalps.values()], null, 2));
}

function restore() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const rows = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!Array.isArray(rows)) return;
    rows.forEach((entry) => {
      if (entry?.id) sankalps.set(entry.id, entry);
    });
  } catch {
    // ignore corrupt file
  }
}

restore();

function enforceApprovedCap() {
  const approved = [...sankalps.values()]
    .filter((entry) => entry.status === 'approved')
    .sort((a, b) => {
      const aTime = a.approvedAt ?? a.createdAt;
      const bTime = b.approvedAt ?? b.createdAt;
      return aTime.localeCompare(bTime);
    });

  if (approved.length <= MAX_APPROVED_SANKALPS) return;

  const excess = approved.slice(0, approved.length - MAX_APPROVED_SANKALPS);
  excess.forEach((entry) => sankalps.delete(entry.id));
  persist();
}

export function createSankalp(text) {
  const id = `sk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const entry = {
    id,
    text: text.slice(0, 500),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  sankalps.set(id, entry);

  if (sankalps.size > 200) {
    const oldestPending = [...sankalps.values()]
      .filter((item) => item.status === 'rejected' || item.status === 'pending')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (oldestPending) sankalps.delete(oldestPending.id);
  }

  persist();
  return entry;
}

export function listPendingSankalps() {
  return [...sankalps.values()]
    .filter((entry) => entry.status === 'pending')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function hashId(id) {
  return [...id].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
}

function ensureSankalpLayout(entry, index) {
  if (entry.leftPct != null && entry.topPct != null) return entry;

  const hash = hashId(entry.id);
  return {
    ...entry,
    leftPct: 8 + (hash % 58),
    topPct: 10 + ((hash * 11) % 48),
    rot: -10 + (hash % 20),
    z: 12 + index,
  };
}

export function listApprovedSankalps() {
  enforceApprovedCap();
  let layoutChanged = false;
  const approved = [...sankalps.values()]
    .filter((entry) => entry.status === 'approved')
    .sort((a, b) => {
      const aTime = a.approvedAt ?? a.createdAt;
      const bTime = b.approvedAt ?? b.createdAt;
      return bTime.localeCompare(aTime);
    })
    .slice(0, MAX_APPROVED_SANKALPS)
    .map((entry, index) => {
      const withLayout = ensureSankalpLayout(entry, index);
      if (withLayout !== entry) {
        sankalps.set(entry.id, withLayout);
        layoutChanged = true;
      }
      return withLayout;
    });

  if (layoutChanged) persist();
  return approved;
}

export function approveSankalp(id, layout) {
  const entry = sankalps.get(id);
  if (!entry || entry.status !== 'pending') return null;

  const placement = layout ?? pickNextWallPosition(id, 0, 20);

  entry.status = 'approved';
  entry.approvedAt = new Date().toISOString();
  entry.leftPct = placement.leftPct;
  entry.topPct = placement.topPct;
  entry.rot = placement.rot;
  entry.z = placement.z;
  sankalps.set(id, entry);
  enforceApprovedCap();
  persist();
  return entry;
}

export function rejectSankalp(id) {
  const entry = sankalps.get(id);
  if (!entry || entry.status !== 'pending') return null;

  entry.status = 'rejected';
  entry.rejectedAt = new Date().toISOString();
  sankalps.set(id, entry);
  persist();
  return entry;
}

export function countApprovedSankalps() {
  return listApprovedSankalps().length;
}

export function clearApprovedSankalps() {
  let removed = 0;
  [...sankalps.entries()].forEach(([id, entry]) => {
    if (entry.status === 'approved') {
      sankalps.delete(id);
      removed += 1;
    }
  });
  if (removed > 0) persist();
  return removed;
}
