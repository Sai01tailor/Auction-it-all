const express    = require('express');
const router     = express.Router();
const reviewCtrl = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Inline admin guard
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ── Public ───────────────────────────────────────────────────
// GET /api/reviews/user/:userId  → all reviews about a user + avg rating
router.get('/user/:userId', reviewCtrl.getUserReviews);

// ── Authenticated ─────────────────────────────────────────────
// POST /api/reviews              → submit a review (buyer or seller)
router.post('/', authMiddleware, reviewCtrl.submitReview);

// GET /api/reviews/mine          → reviews I have written
router.get('/mine', authMiddleware, reviewCtrl.getMyReviews);

// PATCH /api/reviews/:id/report  → flag a review (reviewee only)
router.patch('/:id/report', authMiddleware, reviewCtrl.reportReview);

// ── Admin ─────────────────────────────────────────────────────
// DELETE /api/reviews/:id        → soft-delete a review
router.delete('/:id', authMiddleware, adminOnly, reviewCtrl.adminDeleteReview);

module.exports = router;
