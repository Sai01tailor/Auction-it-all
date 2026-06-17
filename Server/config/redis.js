const { createClient } = require('redis');

// Create Redis client using connection URL
const redisClient = createClient({
  url: process.env.REDIS_URI || process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle connection events
redisClient.on('connect', () => {
  console.log(`✅ Redis Connected [Worker: ${process.pid}]`);
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('ready', () => {
  console.log('[Redis] Redis client ready');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis', err);
    process.exit(1);
  }
};

module.exports = { redisClient, connectRedis };
