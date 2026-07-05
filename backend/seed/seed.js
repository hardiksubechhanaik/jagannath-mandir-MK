import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { runSeed, printSeedSummary } from './seedData.js';

async function seed() {
  await connectDB();
  await runSeed({ reset: true });
  printSeedSummary();
  await disconnectDB();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
