import mongoose from 'mongoose';
import { MONGODB_URI } from './key_db.js';

export const connectDb = async () => {
  if (!MONGODB_URI || !MONGODB_URI.startsWith('mongodb')) {
    throw new Error('Database not configured. Update server/src/config/key_db.ts with a valid URI.');
  }
  await mongoose.connect(MONGODB_URI, { dbName: 'joap_hardware' });
};
