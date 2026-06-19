const mongoose = require('mongoose');

const BUYER_TAGS = [
  'ACCURATE_DESCRIPTION',
  'PUNCTUAL',
  'GOOD_COMMUNICATION',
  'SAFE_HANDOFF',
  'ITEM_AS_EXPECTED'
];

const SELLER_TAGS = [
  'ON_TIME',
  'GOOD_COMMUNICATION',
  'PAID_PROMPTLY',
  'TRUSTWORTHY'
];

const ALL_TAGS = [...new Set([...BUYER_TAGS, ...SELLER_TAGS])];

const reviewSchema = new mongoose.Schema(
  {
    // The auction this review is tied to
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },

    // Gates the review — settlement must be COMPLETED
    settlementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuctionSettlement',
      required: true
    },

    // Who wrote this review
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Who is being reviewed
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // BUYER wrote this review about the seller, or SELLER wrote about the buyer
    reviewerRole: {
      type: String,
      enum: ['BUYER', 'SELLER'],
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },

    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: ''
    },

    // Tags differ based on reviewerRole — validated in controller
    tags: [
      {
        type: String,
        enum: ALL_TAGS
      }
    ],

    // Troll review reporting
    isReported: {
      type: Boolean,
      default: false
    },
    reportReason: {
      type: String,
      default: null
    },

    // Admin soft-delete
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// One review per person per settlement — prevents double submitting
reviewSchema.index({ settlementId: 1, reviewerId: 1 }, { unique: true });

// Fast lookup for "all reviews about user X"
reviewSchema.index({ revieweeId: 1, isDeleted: 1 });

module.exports = mongoose.model('Review', reviewSchema);
module.exports.BUYER_TAGS = BUYER_TAGS;
module.exports.SELLER_TAGS = SELLER_TAGS;
