const KYCService = require('../services/kyc.service');

class KYCController {
  /**
   * Initiate KYC verification
   * POST /api/kyc/initiate
   */
  static async initiateVerification(req, res) {
    try {
      const { aadhaarNumber } = req.body;
      const userId = req.user._id;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      // Validate input
      if (!aadhaarNumber) {
        return res.status(400).json({
          success: false,
          message: 'Aadhaar number is required',
          code: 'MISSING_AADHAAR'
        });
      }

      const result = await KYCService.initiateVerification(
        userId,
        aadhaarNumber,
        ipAddress,
        userAgent
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error('[KYC Controller] Error initiating verification:', error);

      const statusCode = error.statusCode || 500;
      const response = {
        success: false,
        message: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR'
      };

      if (error.retryAfter) {
        response.retryAfter = error.retryAfter;
      }

      return res.status(statusCode).json(response);
    }
  }

  /**
   * Verify OTP
   * POST /api/kyc/verify-otp
   */
  static async verifyOTP(req, res) {
    try {
      const { verificationRequestId, otp } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      // Validate input
      if (!verificationRequestId || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Verification request ID and OTP are required',
          code: 'MISSING_FIELDS'
        });
      }

      const result = await KYCService.verifyOTP(
        verificationRequestId,
        otp,
        ipAddress,
        userAgent
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error('[KYC Controller] Error verifying OTP:', error);

      const statusCode = error.statusCode || 500;
      const response = {
        success: false,
        message: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR'
      };

      if (error.unlocksAt) {
        response.unlocksAt = error.unlocksAt;
      }

      if (error.attemptsRemaining !== undefined) {
        response.attemptsRemaining = error.attemptsRemaining;
      }

      return res.status(statusCode).json(response);
    }
  }

  /**
   * Get verification status
   * GET /api/kyc/status
   */
  static async getVerificationStatus(req, res) {
    try {
      const userId = req.user._id;

      const result = await KYCService.getVerificationStatus(userId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('[KYC Controller] Error getting verification status:', error);

      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get audit logs (admin only)
   * GET /api/kyc/audit-logs
   */
  static async getAuditLogs(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.',
          code: 'FORBIDDEN'
        });
      }

      const { userId, action, startDate, endDate, page = 1, limit = 50 } = req.query;

      const filters = {};
      if (userId) filters.userId = userId;
      if (action) filters.action = action;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await KYCService.getAuditLogs(filters, pagination);

      return res.status(200).json(result);
    } catch (error) {
      console.error('[KYC Controller] Error getting audit logs:', error);

      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

module.exports = KYCController;
