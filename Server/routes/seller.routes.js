const express = require('express');
const router = express.Router();
const sellerCtrl = require('../controllers/seller.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Inline SELLER guard
const sellerOnly = (req, res, next) => {
  if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Seller access required. Complete KYC to sell.' });
  }
  next();
};

// ── Seller Dashboard ─────────────────────────────────────────
// GET /api/seller/dashboard  →  stats, revenue, recent listings
router.get('/dashboard', authMiddleware, sellerOnly, sellerCtrl.getDashboard);

// GET /api/seller/my-listings  →  paginated own items
router.get('/my-listings', authMiddleware, sellerOnly, sellerCtrl.getMyListings);

module.exports = router;
