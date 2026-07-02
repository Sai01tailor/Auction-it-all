const express = require('express');
const router = express.Router();
const auditLogCtrl = require('../controllers/auditLog.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Admin only guard
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ── Query Logs ────────────────────────────────────────────────
// GET /api/audit-logs  →  filter by user, action, date, pagination
router.get('/', authMiddleware, adminOnly, auditLogCtrl.getAuditLogs);

// GET /api/audit-logs/auction/:auctionId  →  bid timeline for tie-breaking analysis
router.get('/auction/:auctionId', authMiddleware, adminOnly, auditLogCtrl.getAuctionBidTimeline);

module.exports = router;
