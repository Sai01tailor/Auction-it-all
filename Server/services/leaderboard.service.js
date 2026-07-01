const { redisClient } = require("../config/redis");

class LeaderboardService {
  /**
   * Fetches the Top N bidders from the Redis ZSET.
   */
  static async getTopBidders(auctionId, limit = 5) {
    const key = `leaderboard:${auctionId}`;
    try {
      // Fetch highest scores first
      const topBidders = await redisClient.zRangeWithScores(key, 0, limit - 1, { REV: true });
      
      // Format it beautifully for the frontend
      return topBidders.map(b => ({ username: b.value, bidAmount: b.score }));
    } catch (err) {
      console.error("Redis Get Leaderboard Error:", err);
      return []; // Return empty array if Redis blips, so app doesn't crash
    }
  }

  /**
   * Updates the user's highest bid in Redis and returns the new Top 5.
   */
  static async updateLeaderboard(auctionId, username, amount) {
    const key = `leaderboard:${auctionId}`;
    try {
      // ZADD automatically updates the score if the username already exists
      await redisClient.zAdd(key, [{ score: amount, value: username }]);
      
      // Instantly return the newly updated rankings
      return await this.getTopBidders(auctionId);
    } catch (err) {
      console.error("Redis Update Leaderboard Error:", err);
      return [];
    }
  }
}

module.exports = LeaderboardService;