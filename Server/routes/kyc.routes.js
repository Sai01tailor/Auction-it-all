const express = require('express');
const KYCController = require('../controllers/kyc.controller');
const authmiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * KYC Routes
 * All routes require authentication
 */

// Initiate KYC verification
router.post('/initiate', authmiddleware, KYCController.initiateVerification);

// Verify OTP
router.post('/verify-otp', authmiddleware , KYCController.verifyOTP);

// Get verification status
router.get('/status', authmiddleware, KYCController.getVerificationStatus);

// Get audit logs (admin only - check role in controller)
router.get('/audit-logs', authmiddleware  , KYCController.getAuditLogs);

module.exports = router;
