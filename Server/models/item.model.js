const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    startingPrice: {
        type: Number,
        required: true,
        min: 1,
    },
    currentHighestBid: {
        type: Number,
        default: 0
    },
    // we store an array of Cloudinary Secure URLS here
    photos: [{
        type: String
    }],
    // The uSer who listed it give it a sellerId
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // If auction has winner
    winnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'SOLD', 'CANCELLED'],
        default: 'ACTIVE'
    },
    category: {
        type: String,
        enum: [
            'Electronics',
            'Art',
            'Vehicles',
            'Fashion',
            'Furniture',
            'Collectibles',
            'Jewellery',
            'Books',
            'Sports',
            'Other'
        ],
        required: true,
        index: true
    },
    condition: {
        type: String,
        enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'],
        required: true
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },

    // Bidding startTime and endTime
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: true
    },
    auctionType: {
        type: String,
        enum: ['ENGLISH', 'DUTCH', 'BLIND'],
        default: 'ENGLISH'
    }
}, {
    timestamps: true // Automatically tracks createdAt and updatedAt
});

// Compound index for the most common browse query
itemSchema.index({ status: 1, endTime: 1, category: 1 });
// Text index for search on title + description
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);

// NOTES:
// The winnerId field: This starts as null.
// When the auction timer hits zero, your server will lock the item, change the status to SOLD,
// and stamp the highest bidder's ID right here.

// The status enum: When someone browses the homepage,
//  your controller will strictly search for Item.find({ status: "ACTIVE" }).
// This prevents people from accidentally bidding on canceled or sold items.