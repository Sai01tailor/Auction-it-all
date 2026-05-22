const { redisClient } = require("../config/redis"); 

class AuctionCache {
  // Retrieve any data from cache
  static async getCache(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis GET Error:", error);
      return null;
    }
  }

  // Save any data to cache with a specific expiration time
  static async setCache(key, seconds, data) {
    try {
      await redisClient.setEx(key, seconds, JSON.stringify(data));
    } catch (error) {
      console.error("Redis SET Error:", error);
    }
  }

  // Delete a specific cache key (e.g., when a new item is added)
  static async clearCache(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error("Redis DEL Error:", error);
    }
  }
}

module.exports = AuctionCache;