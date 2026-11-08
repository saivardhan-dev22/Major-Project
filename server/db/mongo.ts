import mongoose from 'mongoose';
import { config } from '../config.js';

let isConnected = false;
let isFallbackMode = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) return;

  try {
    // Attempt Mongoose connection with 3-second timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    isConnected = true;
    isFallbackMode = false;
    console.log(`[Database] Successfully connected to MongoDB at ${config.mongodbUri}`);
  } catch (err: any) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Activating local embedded in-memory database engine for seamless operation.`);
    isFallbackMode = true;
    isConnected = true;
  }
}

export function isDbFallback(): boolean {
  return isFallbackMode;
}
