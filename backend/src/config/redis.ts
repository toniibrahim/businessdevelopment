import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Build Redis URL from environment variables
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

const redisClient = createClient({
  url: redisUrl,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connection established');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

export const initializeRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log(`✅ Connected to Redis at ${redisUrl}`);
  } catch (error) {
    console.error('❌ Error connecting to Redis:', error);
    console.warn('⚠️  Application will continue without Redis caching');
    // Don't exit - allow app to run without Redis
  }
};

export default redisClient;
