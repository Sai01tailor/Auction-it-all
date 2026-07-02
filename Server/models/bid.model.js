const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    // Links directly to your item.model.js
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    // Links directly to your user.model.js
    bidderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The exact amount they tried to bid
    amount: {
        type: Number,
        required: true
    },
    // Tracks the lifecycle of the bid (Matches the socket.js logic)
    status: {
        type: String,
        enum: ['ACCEPTED', 'REJECTED', 'OUTBID'],
        default: 'ACCEPTED'
    },
    // Required for your P31: Audit Trail (Technical Log) to prevent Shill Bidding
    ipAddress: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Automatically tracks exactly when the bid was placed
});

module.exports = mongoose.model('Bid', bidSchema);