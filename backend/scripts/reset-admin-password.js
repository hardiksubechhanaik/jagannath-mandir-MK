import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const password = process.env.ADMIN_INITIAL_PASSWORD?.trim();
if (!password) {
  console.error('Set ADMIN_INITIAL_PASSWORD before running this script.');
  process.exit(1);
}

async function main() {
  await connectDB();
  const hash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { username: 'admin' },
    { name: 'Administrator', username: 'admin', passwordHash: hash, role: 'admin' },
    { upsert: true, new: true },
  );
  console.log(`Admin password updated for user: ${user.username}`);
  await disconnectDB();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
