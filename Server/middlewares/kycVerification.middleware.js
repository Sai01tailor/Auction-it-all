const KYCService = require('../services/kyc.service');

/**
 * Middleware to check if user is KYC verified
 * Use this on routes that require KYC verification
 */
const requireKYCVerification = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if user is KYC verified
    const isVerified = await KYCService.isUserVerified(userId);

    if (!isVerified) {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required to access this feature',
        code: 'KYC_VERIFICATION_REQUIRED',
        kycStatus: req.user.kycStatus
      });
    }

    // User is verified, proceed
    next();
  } catch (error) {
    console.error('[KYC Verification Middleware] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = { requireKYCVerification };
