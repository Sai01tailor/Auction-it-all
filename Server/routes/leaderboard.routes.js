const express = require('express');
const router = express.Router();
const { getAuctionLeaderboard } = require('../controllers/leaderboard.controller');

// GET /api/leaderboard/:auctionId
// Note: We do NOT put auth middleware here, so guests can view the leaderboard!
router.get('/:auctionId', getAuctionLeaderboard);

module.exports = router;