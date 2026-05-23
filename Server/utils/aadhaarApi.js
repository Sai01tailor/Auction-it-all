/**
 * Mock Aadhaar Verification API
 * Simulates real Aadhaar OTP verification behavior
 * Uses Redis for production-ready OTP storage
 * Can be easily swapped with real API (Shunyatech, Signzy, etc.)
 */

const crypto = require('crypto');
const generateOtp = require('./generateOtp');
const redisClient = require('../config/redis');
const { sendEmail } = require('./mailer');

class AadhaarAPI {
  /**
   * Request OTP for Aadhaar verification
   * @param {string} aadhaarNumber - 12-digit Aadhaar number
   * @param {string} email - Email to send OTP to (optional, for mock API)
   * @returns {Promise<{success: boolean, transactionId: string, message: string}>}
   */
  static async requestOTP(aadhaarNumber, email = null) {
    try {
      // Validate Aadhaar format
      if (!this.validateAadhaarFormat(aadhaarNumber)) {
        return {
          success: false,
          code: 'INVALID_AADHAAR_FORMAT',
          message: 'Invalid Aadhaar format. Must be 12 digits.'
        };
      }

      // Simulate API delay (100-300ms)
      await this.simulateDelay(100, 300);

      // Generate mock transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate mock OTP using utility
      const otp = generateOtp();

      // Store OTP in Redis with 10-minute expiry
      const otpData = {
        otp,
        aadhaarNumber,
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        locked: false,
        lockedUntil: null
      };

      // Store in Redis with TTL (600 seconds = 10 minutes)
      await redisClient.setEx(
        `kyc:otp:${transactionId}`,
        600,
        JSON.stringify(otpData)
      );

      // Log for debugging (remove in production)
      console.log(`[Mock Aadhaar API] OTP requested for ${this.maskAadhaar(aadhaarNumber)}`);
      console.log(`[Mock Aadhaar API] Transaction ID: ${transactionId}`);
      console.log(`[Mock Aadhaar API] OTP: ${otp} (for testing only)`);

      // Send OTP via email if email provided
      if (email) {
        const emailHtml = `
          <h2>KYC Verification - OTP</h2>
          <p>Your OTP for KYC verification is:</p>
          <h3 style="color: #2563eb; font-size: 28px; letter-spacing: 2px;">${otp}</h3>
          <p><strong>Aadhaar:</strong> ${this.maskAadhaar(aadhaarNumber)}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Valid for:</strong> 10 minutes</p>
          <p style="color: #666; font-size: 12px;">Do not share this OTP with anyone. This is an automated message.</p>
        `;
        
        try {
          await sendEmail(email, '🔐 KYC Verification OTP', emailHtml);
          console.log(`[Mock Aadhaar API] OTP sent to ${email}`);
        } catch (emailError) {
          console.error('[Mock Aadhaar API] Failed to send OTP email:', emailError);
          // Don't fail the request if email fails
        }
      }

      return {
        success: true,
        transactionId,
        message: 'OTP sent to registered mobile number',
        aadhaarMasked: this.maskAadhaar(aadhaarNumber),
        expiresIn: 600 // 10 minutes in seconds
      };
    } catch (error) {
      console.error('[Mock Aadhaar API] Error requesting OTP:', error);
      return {
        success: false,
        code: 'SERVICE_ERROR',
        message: 'Verification service temporarily unavailable',
        retryAfter: 30
      };
    }
  }

  /**
   * Verify OTP
   * @param {string} transactionId - Transaction ID from requestOTP
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<{success: boolean, message: string, ...}>}
   */
  static async verifyOTP(transactionId, otp) {
    try {
      // Validate OTP format
      if (!this.validateOTPFormat(otp)) {
        return {
          success: false,
          code: 'INVALID_OTP_FORMAT',
          message: 'Invalid OTP format. Must be 6 digits.'
        };
      }

      // Simulate API delay
      await this.simulateDelay(100, 300);

      // Get OTP data from Redis
      const otpDataStr = await redisClient.get(`kyc:otp:${transactionId}`);
      
      if (!otpDataStr) {
        return {
          success: false,
          code: 'INVALID_TRANSACTION',
          message: 'Invalid or expired transaction ID'
        };
      }

      const otpData = JSON.parse(otpDataStr);

      // Check if OTP is expired
      if (Date.now() > otpData.expiresAt) {
        await redisClient.del(`kyc:otp:${transactionId}`);
        return {
          success: false,
          code: 'OTP_EXPIRED',
          message: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Check if verification is locked
      if (otpData.locked && Date.now() < otpData.lockedUntil) {
        const remainingTime = Math.ceil((otpData.lockedUntil - Date.now()) / 1000);
        return {
          success: false,
          code: 'VERIFICATION_LOCKED',
          message: `Too many failed attempts. Please try again after ${remainingTime} seconds.`,
          unlocksAt: new Date(otpData.lockedUntil)
        };
      }

      // Reset lock if expired
      if (otpData.locked && Date.now() >= otpData.lockedUntil) {
        otpData.locked = false;
        otpData.lockedUntil = null;
        otpData.attempts = 0;
      }

      // Verify OTP
      if (otp !== otpData.otp) {
        otpData.attempts += 1;

        // Lock after 3 failed attempts
        if (otpData.attempts >= 3) {
          otpData.locked = true;
          otpData.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
          
          // Update Redis with new data
          await redisClient.setEx(
            `kyc:otp:${transactionId}`,
            600,
            JSON.stringify(otpData)
          );

          return {
            success: false,
            code: 'VERIFICATION_LOCKED',
            message: 'Too many failed attempts. Please try again after 15 minutes.',
            unlocksAt: new Date(otpData.lockedUntil)
          };
        }

        // Update Redis with incremented attempts
        await redisClient.setEx(
          `kyc:otp:${transactionId}`,
          600,
          JSON.stringify(otpData)
        );

        return {
          success: false,
          code: 'INVALID_OTP',
          message: 'Invalid OTP. Please try again.',
          attemptsRemaining: 3 - otpData.attempts
        };
      }

      // OTP verified successfully
      const aadhaarNumber = otpData.aadhaarNumber;
      await redisClient.del(`kyc:otp:${transactionId}`);

      return {
        success: true,
        message: 'OTP verified successfully',
        aadhaarNumber: this.maskAadhaar(aadhaarNumber),
        verifiedAt: new Date()
      };
    } catch (error) {
      console.error('[Mock Aadhaar API] Error verifying OTP:', error);
      return {
        success: false,
        code: 'SERVICE_ERROR',
        message: 'Verification service temporarily unavailable',
        retryAfter: 30
      };
    }
  }

  /**
   * Validate Aadhaar format (12 digits)
   */
  static validateAadhaarFormat(aadhaarNumber) {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaarNumber);
  }

  /**
   * Validate OTP format (6 digits)
   */
  static validateOTPFormat(otp) {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  }

  /**
   * Mask Aadhaar number (show only last 4 digits)
   */
  static maskAadhaar(aadhaarNumber) {
    if (!aadhaarNumber || aadhaarNumber.length < 4) return 'XXXX XXXX XXXX';
    return `XXXX XXXX ${aadhaarNumber.slice(-4)}`;
  }

  /**
   * Hash Aadhaar number using SHA-256
   */
  static hashAadhaar(aadhaarNumber) {
    return crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
  }

  /**
   * Simulate API delay
   */
  static async simulateDelay(min = 100, max = 300) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Clear all OTPs (for testing)
   */
  static async clearAllOTPs() {
    const keys = await redisClient.keys('kyc:otp:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }

  /**
   * Get OTP count (for debugging)
   */
  static async getOTPCount() {
    const keys = await redisClient.keys('kyc:otp:*');
    return keys.length;
  }
}

module.exports = AadhaarAPI;
