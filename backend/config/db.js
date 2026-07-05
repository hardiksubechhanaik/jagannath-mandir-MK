import mongoose from 'mongoose';

let memoryServer;

export async function connectDB() {
  let uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('Using in-memory MongoDB (dev mode)');
  }

  if (!uri) throw new Error('MONGO_URI or MONGODB_URI is not set');

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
