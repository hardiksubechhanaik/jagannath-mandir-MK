import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'node:fs';
import { connectDB } from './config/db.js';
import {
  getPersistenceMode,
  registerDevSnapshotShutdown,
  restoreDevSnapshot,
} from './config/devSnapshot.js';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { uploadsDir } from './controllers/uploadController.js';
import { runSeed, printSeedSummary } from './seed/seedData.js';
import { assertProductionConfig } from './lib/startupChecks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'https://www.shreejagannathmandirmk.in',
  'https://shreejagannathmandirmk.in',
  'https://jagannath-mandir-mk.vercel.app',
];

const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

fs.mkdirSync(uploadsDir, { recursive: true });

assertProductionConfig();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use('/uploads', (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static(uploadsDir)); // legacy disk uploads (pre-GridFS)

app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});
app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(async () => {
    const seeded = await runSeed({ reset: false });
    if (seeded) {
      printSeedSummary();
    }

    await restoreDevSnapshot();
    registerDevSnapshotShutdown();

    app.listen(PORT, () => {
      console.log(`Mandir Admin API listening on http://localhost:${PORT}`);
      const mode = getPersistenceMode();
      if (mode === 'memory-file') {
        console.warn(
          'USE_MEMORY_DB=true — using local file backup (backend/.data/dev-snapshot.json). For production, set USE_MEMORY_DB=false and run MongoDB.',
        );
      } else if (mode === 'mongodb') {
        console.log('Persistence: MongoDB (data + uploaded images via GridFS survive restarts)');
      }
      const rathOk = Boolean(process.env.RATH_TRACKER_SECRET || process.env.NODE_ENV !== 'production');
      console.log(rathOk ? 'Rath tracker: ready' : 'Rath tracker: set RATH_TRACKER_SECRET');
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
