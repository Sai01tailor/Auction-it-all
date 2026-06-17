const mongoose = require('mongoose');

const kycVerificationRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  aadhaarHash: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Failed', 'Expired'],
    default: 'Pending',
    index: true
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpLockedUntil: {
    type: Date,
    default: null
  },
  verificationCompletedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  }
});

// TTL index to auto-delete expired requests after 10 minutes
kycVerificationRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('KYCVerificationRequest', kycVerificationRequestSchema);
