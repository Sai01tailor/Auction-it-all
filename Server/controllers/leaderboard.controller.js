const LeaderboardService = require('../services/leaderboard.service');

exports.getAuctionLeaderboard = async (req, res) => {
    try {
        const { auctionId } = req.params;

        if (!auctionId) {
            return res.status(400).json({ success: false, message: "Auction ID is required" });
        }

        // Reuse the exact same Redis service the Sockets use!
        const leaderboard = await LeaderboardService.getTopBidders(auctionId);

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error("Leaderboard API Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching leaderboard" });
    }
};