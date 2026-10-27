import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function ensureSeparateCollections(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB database connection is not available');
  }

  const existingCollections = await db.listCollections({}, { nameOnly: true }).toArray();
  const collectionNames = new Set(existingCollections.map((collection) => collection.name));

  if (!collectionNames.has('company_auth_accounts')) {
    await db.createCollection('company_auth_accounts');
    logger.info('Created MongoDB collection: company_auth_accounts');
  }
}

export async function connectDB(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: 'dechub',
      autoIndex: env.NODE_ENV !== 'production',
    });

    await ensureSeparateCollections();
    logger.info('MongoDB connected');
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      logger.warn(
        `MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(attempt + 1);
    }

    logger.error('MongoDB connection failed after max retries', err);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected - attempting reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error', err);
});
