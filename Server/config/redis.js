const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URI
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log(`✅ Redis Connected [Worker: ${process.pid}]`);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis", err);
    process.exit(1);
  }
};

module.exports = { redisClient, connectRedis };