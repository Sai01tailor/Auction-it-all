const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    action: {
        type: String,
        required: true,
        index: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    deviceInfo: {
        type: String,
    },
    endpoint: {
        type: String,
    },
    // For bid tracking — stores auctionId, amount, serverId, reason, etc.
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for fast auction bid queries
auditLogSchema.index({ 'metadata.auctionId': 1, createdAt: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);