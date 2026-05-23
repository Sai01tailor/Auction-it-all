const express = require('express');
const KYCController = require('../controllers/kyc.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * KYC Routes
 * All routes require authentication
 */

// Initiate KYC verification
router.post('/initiate', authenticate, KYCController.initiateVerification);

// Verify OTP
router.post('/verify-otp', authenticate, KYCController.verifyOTP);

// Get verification status
router.get('/status', authenticate, KYCController.getVerificationStatus);

// Get audit logs (admin only - check role in controller)
router.get('/audit-logs', authenticate, KYCController.getAuditLogs);

module.exports = router;
