import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const env = {
  ...process.env,
  VITE_ADMIN_BASE: '/admin/',
  VITE_API_URL: process.env.VITE_API_URL || 'https://jagannath-mandir-mk.onrender.com',
};

const adminInstall = spawnSync('npm', ['install', '--prefix', 'admin-app'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (adminInstall.status !== 0) {
  process.exit(adminInstall.status ?? 1);
}

const adminBuild = spawnSync('npm', ['run', 'build', '--prefix', 'admin-app'], {
  cwd: root,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (adminBuild.status !== 0) {
  process.exit(adminBuild.status ?? 1);
}

const embed = spawnSync('node', ['scripts/embed-admin.mjs'], {
  cwd: root,
  stdio: 'inherit',
});

process.exit(embed.status ?? 0);
