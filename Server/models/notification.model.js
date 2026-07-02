const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['OUTBID', 'AUCTION_WON', 'SYSTEM_ALERT', 'PAYMENT_REMINDER'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        // Optional: Because some system alerts might not belong to a specific auction
        required: false 
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Create an index on userId so fetching a user's inbox is lightning fast
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);