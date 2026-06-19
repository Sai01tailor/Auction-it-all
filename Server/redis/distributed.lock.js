const { redisClient } = require("../config/redis"); // Importing your exact client

class DistributedLock {
  /**
   * Attempts to acquire a lock for a specific auction.
   * @param {string} resourceKey - The unique name for the lock (e.g., 'lock:auction:12345')
   * @param {number} ttl - Time To Live in milliseconds (auto-unlocks if server crashes)
   * @returns {string|null} - Returns a unique token if locked, or null if busy
   */
  static async acquireLock(resourceKey, ttl = 500) {
    try {
      // Create a random token so we know exactly WHO locked the door
      const token = Math.random().toString(36).substring(2, 15);

      // NX = Only set if it does NOT already exist. PX = Expire in 'ttl' ms.
      const result = await redisClient.set(resourceKey, token, {
        NX: true,
        PX: ttl,
      });

      // If Redis says "OK", you got the lock. If null, someone else is bidding.
      return result === "OK" ? token : null;
    } catch (error) {
      console.error("Redis Lock Error:", error);
      return null;
    }
  }

  /**
   * Releases the lock safely using a Lua script to ensure we only delete OUR lock.
   */
  static async releaseLock(resourceKey, token) {
    try {
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
      `;

      await redisClient.eval(script, {
        keys: [resourceKey],
        arguments: [token],
      });
    } catch (error) {
      console.error("Redis Unlock Error:", error);
    }
  }
}

module.exports = DistributedLock;