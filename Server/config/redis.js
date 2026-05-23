const redis = require('redis');

// Create Redis client using connection URL
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle connection events
redisClient.on('connect', () => {
  console.log('[Redis] Connected to Redis server');
});

redisClient.on('error', (err) => {
  console.error('[Redis] Connection error:', err);
});

redisClient.on('ready', () => {
  console.log('[Redis] Redis client ready');
});

// Connect to Redis
redisClient.connect().catch(err => {
  console.error('[Redis] Failed to connect:', err);
});

module.exports = redisClient;
