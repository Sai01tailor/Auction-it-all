const mongoose = require('mongoose');

const kycAuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['KYC_INITIATED', 'OTP_SUBMITTED', 'OTP_VERIFIED', 'VERIFICATION_FAILED', 'VERIFICATION_LOCKED'],
    required: true,
    index: true
  },
  actionDetails: {
    aadhaarHash: String,
    otpAttempt: Number,
    result: String,
    reason: String,
    apiTransactionId: String
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  immutable: {
    type: Boolean,
    default: true
  }
});

// TTL index: auto-delete after 30 days
kycAuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

// Prevent modification of audit logs
kycAuditLogSchema.pre('findByIdAndUpdate', function(next) {
  throw new Error('Audit logs cannot be modified');
});

kycAuditLogSchema.pre('updateOne', function(next) {
  throw new Error('Audit logs cannot be modified');
});

module.exports = mongoose.model('KYCAuditLog', kycAuditLogSchema);
