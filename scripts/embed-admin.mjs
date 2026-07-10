import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'admin-app/dist');
const target = path.join(root, 'dist/admin');

if (!fs.existsSync(source)) {
  console.error('admin-app/dist not found — run build:admin:embed first');
  process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log('Embedded admin dashboard at dist/admin');
