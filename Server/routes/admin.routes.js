const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Global Pulse real-time stats
router.get('/pulse', adminController.getGlobalPulse);

// Searchable User Directory
router.get('/users', adminController.getUsers);

// Block/Unblock User
router.post('/users/:id/toggle-block', adminController.toggleUserBlock);

// KYC Manual Approval Dashboard
router.get('/kyc/pending', adminController.getPendingKYC);
router.post('/kyc/resolve', adminController.resolveKYC);

// Disputes Mediation Queue
router.get('/disputes', adminController.getAdminDisputes);
router.post('/disputes/resolve', adminController.resolveDispute);

// Technical Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
