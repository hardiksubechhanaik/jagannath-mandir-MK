import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pickNextWallPosition } from './wallBoardLayout.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../.data/diyas.json');

export const MAX_APPROVED_DIYAS = 50;

const diyas = new Map();

function persist() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify([...diyas.values()], null, 2));
}

function restore() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const rows = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!Array.isArray(rows)) return;
    rows.forEach((entry) => {
      if (entry?.id) diyas.set(entry.id, entry);
    });
  } catch {
    // ignore corrupt file
  }
}

restore();

function hashId(id) {
  return [...id].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 5), 0);
}

function enforceApprovedCap() {
  const approved = [...diyas.values()]
    .filter((entry) => entry.status === 'approved')
    .sort((a, b) => {
      const aTime = a.approvedAt ?? a.createdAt;
      const bTime = b.approvedAt ?? b.createdAt;
      return aTime.localeCompare(bTime);
    });

  if (approved.length <= MAX_APPROVED_DIYAS) return;

  const excess = approved.slice(0, approved.length - MAX_APPROVED_DIYAS);
  excess.forEach((entry) => diyas.delete(entry.id));
  persist();
}

function ensureDiyaLayout(entry, index) {
  if (entry.leftPct != null && entry.topPct != null) return entry;

  const hash = hashId(entry.id);
  return {
    ...entry,
    leftPct: 5 + (hash % 62),
    topPct: 8 + ((hash * 13) % 52),
    rot: -12 + (hash % 24),
    z: 8 + index,
  };
}

export function createDiya(name) {
  const id = `dy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const entry = {
    id,
    name: name.slice(0, 80),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  diyas.set(id, entry);

  if (diyas.size > 300) {
    const oldestPending = [...diyas.values()]
      .filter((item) => item.status === 'rejected' || item.status === 'pending')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (oldestPending) diyas.delete(oldestPending.id);
  }

  persist();
  return entry;
}

export function listPendingDiyas() {
  return [...diyas.values()]
    .filter((entry) => entry.status === 'pending')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function listApprovedDiyas() {
  enforceApprovedCap();
  let layoutChanged = false;
  const approved = [...diyas.values()]
    .filter((entry) => entry.status === 'approved')
    .sort((a, b) => {
      const aTime = a.approvedAt ?? a.createdAt;
      const bTime = b.approvedAt ?? b.createdAt;
      return bTime.localeCompare(aTime);
    })
    .slice(0, MAX_APPROVED_DIYAS)
    .map((entry, index) => {
      const withLayout = ensureDiyaLayout(entry, index);
      if (withLayout !== entry) {
        diyas.set(entry.id, withLayout);
        layoutChanged = true;
      }
      return withLayout;
    });

  if (layoutChanged) persist();
  return approved;
}

export function approveDiya(id, layout) {
  const entry = diyas.get(id);
  if (!entry || entry.status !== 'pending') return null;

  const placement = layout ?? pickNextWallPosition(id, 0, 24);

  entry.status = 'approved';
  entry.approvedAt = new Date().toISOString();
  entry.leftPct = placement.leftPct;
  entry.topPct = placement.topPct;
  entry.rot = placement.rot;
  entry.z = placement.z;
  diyas.set(id, entry);
  enforceApprovedCap();
  persist();
  return entry;
}

export function rejectDiya(id) {
  const entry = diyas.get(id);
  if (!entry || entry.status !== 'pending') return null;

  entry.status = 'rejected';
  entry.rejectedAt = new Date().toISOString();
  diyas.set(id, entry);
  persist();
  return entry;
}

export function countApprovedDiyas() {
  return listApprovedDiyas().length;
}

export function clearApprovedDiyas() {
  let removed = 0;
  [...diyas.entries()].forEach(([id, entry]) => {
    if (entry.status === 'approved') {
      diyas.delete(id);
      removed += 1;
    }
  });
  if (removed > 0) persist();
  return removed;
}
