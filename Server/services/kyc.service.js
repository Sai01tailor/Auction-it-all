const crypto = require('crypto');
const User = require('../models/user.model');
const KYCVerificationRequest = require('../models/KYCVerificationRequest.model');
const KYCAuditLog = require('../models/KYCAuditLog.model');
const AadhaarAPI = require('../utils/aadhaarApi');
const { sendKYCInitiatedEmail, sendKYCSuccessEmail, sendKYCFailedEmail, sendKYCLockoutEmail } = require('./notification.service');
const { sendEmail } = require('../utils/mailer');
const generateOtp = require('../utils/generateOtp');

class KYCService {
  /**
   * Initiate KYC verification
   */
  static async initiateVerification(userId, aadhaarNumber, ipAddress, userAgent) {
    try {
      // Validate Aadhaar format
      if (!AadhaarAPI.validateAadhaarFormat(aadhaarNumber)) {
        throw {
          code: 'INVALID_AADHAAR_FORMAT',
          message: 'Invalid Aadhaar format. Must be 12 digits.',
          statusCode: 400
        };
      }

      // Get user to get email
      const user = await User.findById(userId);
      if (!user) {
        throw {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          statusCode: 404
        };
      }

      // Hash Aadhaar number
      const aadhaarHash = AadhaarAPI.hashAadhaar(aadhaarNumber);

      // Call Aadhaar API to request OTP (pass email for mock API to send OTP)
      const apiResponse = await AadhaarAPI.requestOTP(aadhaarNumber, user.email);

      if (!apiResponse.success) {
        // Log failed attempt
        await this.logAction(userId, 'KYC_INITIATED', {
          aadhaarHash,
          result: 'failed',
          reason: apiResponse.message
        }, ipAddress, userAgent);

        throw {
          code: apiResponse.code,
          message: apiResponse.message,
          statusCode: 503,
          retryAfter: apiResponse.retryAfter
        };
      }

      // Create verification request
      const verificationRequest = new KYCVerificationRequest({
        userId,
        aadhaarHash,
        status: 'Pending',
        transactionId: apiResponse.transactionId
      });

      await verificationRequest.save();

      // Update user status
      await User.findByIdAndUpdate(userId, {
        kycStatus: 'Pending',
        kycLastAttemptAt: new Date()
      });

      // Log action
      await this.logAction(userId, 'KYC_INITIATED', {
        aadhaarHash,
        result: 'success',
        apiTransactionId: apiResponse.transactionId
      }, ipAddress, userAgent);

      return {
        success: true,
        verificationRequestId: verificationRequest._id,
        aadhaarMasked: apiResponse.aadhaarMasked,
        expiresIn: apiResponse.expiresIn,
        message: 'OTP sent to your registered email'
      };
    } catch (error) {
      console.error('[KYC Service] Error initiating verification:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(verificationRequestId, otp, ipAddress, userAgent) {
    try {
      // Validate OTP format
      if (!AadhaarAPI.validateOTPFormat(otp)) {
        throw {
          code: 'INVALID_OTP_FORMAT',
          message: 'Invalid OTP format. Must be 6 digits.',
          statusCode: 400
        };
      }

      // Get verification request
      const verificationRequest = await KYCVerificationRequest.findById(verificationRequestId);
      if (!verificationRequest) {
        throw {
          code: 'INVALID_REQUEST',
          message: 'Verification request not found',
          statusCode: 404
        };
      }

      const userId = verificationRequest.userId;

      // Check if already verified
      if (verificationRequest.status === 'Verified') {
        throw {
          code: 'ALREADY_VERIFIED',
          message: 'This verification request has already been verified',
          statusCode: 400
        };
      }

      // Check if locked
      if (verificationRequest.otpLockedUntil && Date.now() < verificationRequest.otpLockedUntil) {
        const remainingTime = Math.ceil((verificationRequest.otpLockedUntil - Date.now()) / 1000);
        throw {
          code: 'VERIFICATION_LOCKED',
          message: `Too many failed attempts. Please try again after ${remainingTime} seconds.`,
          statusCode: 429,
          unlocksAt: verificationRequest.otpLockedUntil
        };
      }

      // Reset lock if expired
      if (verificationRequest.otpLockedUntil && Date.now() >= verificationRequest.otpLockedUntil) {
        verificationRequest.otpLockedUntil = null;
        verificationRequest.otpAttempts = 0;
      }

      // Call Aadhaar API to verify OTP
      const apiResponse = await AadhaarAPI.verifyOTP(verificationRequest.transactionId, otp);

      if (!apiResponse.success) {
        // Increment attempts
        verificationRequest.otpAttempts += 1;

        // Lock if 3 failed attempts
        if (verificationRequest.otpAttempts >= 3) {
          verificationRequest.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
          await verificationRequest.save();

          // Log lockout
          await this.logAction(userId, 'VERIFICATION_LOCKED', {
            aadhaarHash: verificationRequest.aadhaarHash,
            otpAttempt: verificationRequest.otpAttempts,
            result: 'locked'
          }, ipAddress, userAgent);

          throw {
            code: 'VERIFICATION_LOCKED',
            message: 'Too many failed attempts. Please try again after 15 minutes.',
            statusCode: 429,
            unlocksAt: verificationRequest.otpLockedUntil
          };
        }

        await verificationRequest.save();

        // Log failed attempt
        await this.logAction(userId, 'OTP_SUBMITTED', {
          aadhaarHash: verificationRequest.aadhaarHash,
          otpAttempt: verificationRequest.otpAttempts,
          result: 'failed',
          reason: apiResponse.message
        }, ipAddress, userAgent);

        throw {
          code: apiResponse.code,
          message: apiResponse.message,
          statusCode: 400,
          attemptsRemaining: 3 - verificationRequest.otpAttempts
        };
      }

      // OTP verified successfully
      verificationRequest.status = 'Verified';
      verificationRequest.verificationCompletedAt = new Date();
      await verificationRequest.save();

      // Update user — auto-upgrade to SELLER on KYC verification
      const user = await User.findByIdAndUpdate(userId, {
        kycStatus: 'Verified',
        kycVerifiedAt: new Date(),
        role: 'SELLER'  // Auto-upgrade: KYC verified = can buy AND sell
      }, { new: true });

      // Log success
      await this.logAction(userId, 'OTP_VERIFIED', {
        aadhaarHash: verificationRequest.aadhaarHash,
        otpAttempt: verificationRequest.otpAttempts,
        result: 'success'
      }, ipAddress, userAgent);

      return {
        success: true,
        message: 'KYC verification successful',
        kycStatus: 'Verified',
        verifiedAt: verificationRequest.verificationCompletedAt
      };
    } catch (error) {
      console.error('[KYC Service] Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Get verification status
   */
  static async getVerificationStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        kycStatus: user.kycStatus,
        verifiedAt: user.kycVerifiedAt,
        canAccessRestrictedFeatures: user.kycStatus === 'Verified'
      };
    } catch (error) {
      console.error('[KYC Service] Error getting verification status:', error);
      throw error;
    }
  }

  /**
   * Check if user is KYC verified
   */
  static async isUserVerified(userId) {
    try {
      const user = await User.findById(userId);
      return user && user.kycStatus === 'Verified';
    } catch (error) {
      console.error('[KYC Service] Error checking verification:', error);
      return false;
    }
  }

  /**
   * Log KYC action
   */
  static async logAction(userId, action, details, ipAddress, userAgent) {
    try {
      const auditLog = new KYCAuditLog({
        userId,
        action,
        actionDetails: details,
        ipAddress,
        userAgent
      });
      await auditLog.save();
    } catch (error) {
      console.error('[KYC Service] Error logging action:', error);
      // Don't throw - logging failure shouldn't block main flow
    }
  }

  /**
   * Get audit logs (admin only)
   */
  static async getAuditLogs(filters = {}, pagination = {}) {
    try {
      const { userId, action, startDate, endDate } = filters;
      const { page = 1, limit = 50 } = pagination;

      const query = {};
      if (userId) query.userId = userId;
      if (action) query.action = action;
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;
      const logs = await KYCAuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const total = await KYCAuditLog.countDocuments(query);

      return {
        success: true,
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[KYC Service] Error getting audit logs:', error);
      throw error;
    }
  }
}

module.exports = KYCService;
