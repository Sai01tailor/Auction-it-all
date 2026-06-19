const Review = require('../models/review.model');
const { BUYER_TAGS, SELLER_TAGS } = require('../models/review.model');
const AuctionSettlement = require('../models/auctionSettlement.model');
const Item = require('../models/item.model');

// ================= SUBMIT REVIEW =================
// Both buyer and seller can call this.
// Gate: settlement must be COMPLETED, caller must be buyer or seller of that settlement.
exports.submitReview = async (req, res) => {
  try {
    const { settlementId, rating, comment, tags } = req.body;
    const reviewerId = req.user._id.toString();

    if (!settlementId || !rating) {
      return res.status(400).json({ success: false, message: 'settlementId and rating are required' });
    }

    // 1. Fetch settlement and verify it is COMPLETED
    const settlement = await AuctionSettlement.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement not found' });
    }

    if (settlement.status !== 'COMPLETED') {
      return res.status(403).json({
        success: false,
        message: 'Reviews can only be submitted after the settlement is marked COMPLETED'
      });
    }

    const buyerId  = settlement.buyer.toString();
    const sellerId = settlement.seller.toString();

    // 2. Confirm caller is a participant
    if (reviewerId !== buyerId && reviewerId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer or seller of this auction can leave a review'
      });
    }

    // 3. Determine role and reviewee
    const reviewerRole = reviewerId === buyerId ? 'BUYER' : 'SELLER';
    const revieweeId   = reviewerId === buyerId ? sellerId : buyerId;

    // 4. Validate tags match the role
    const allowedTags = reviewerRole === 'BUYER' ? BUYER_TAGS : SELLER_TAGS;
    const invalidTags = (tags || []).filter(t => !allowedTags.includes(t));
    if (invalidTags.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid tags for role ${reviewerRole}: ${invalidTags.join(', ')}`,
        allowedTags
      });
    }

    // 5. Create review — unique index on {settlementId, reviewerId} prevents duplicates
    const review = await Review.create({
      auctionId:    settlement.item,
      settlementId: settlement._id,
      reviewerId,
      revieweeId,
      reviewerRole,
      rating:  Number(rating),
      comment: comment || '',
      tags:    tags || []
    });

    // 6. Populate for the response
    const populated = await Review.findById(review._id)
      .populate('reviewerId',  'username avatar')
      .populate('revieweeId',  'username avatar')
      .populate('auctionId',   'title');

    res.status(201).json({ success: true, message: 'Review submitted successfully', review: populated });

  } catch (err) {
    // Duplicate key = already reviewed
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already submitted a review for this transaction' });
    }
    console.error('Submit Review Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET REVIEWS FOR A USER =================
// Public. Returns all non-deleted reviews about a user + computed avg rating.
// Also returns the breakdown so the frontend can show "4.2 avg from 18 reviews".
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip  = (page - 1) * limit;

    // Run aggregation and paginated fetch in parallel
    const [aggResult, reviews, total] = await Promise.all([
      // Aggregation: avg rating + count breakdown
      Review.aggregate([
        {
          $match: {
            revieweeId: new (require('mongoose').Types.ObjectId)(userId),
            isDeleted:  false
          }
        },
        {
          $group: {
            _id:       null,
            avgRating: { $avg: '$rating' },
            total:     { $sum: 1 },
            // Count per star
            star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        }
      ]),

      // Paginated individual reviews
      Review.find({ revieweeId: userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reviewerId', 'username avatar')
        .populate('auctionId',  'title'),

      Review.countDocuments({ revieweeId: userId, isDeleted: false })
    ]);

    const stats = aggResult[0] || {
      avgRating: 0, total: 0,
      star5: 0, star4: 0, star3: 0, star2: 0, star1: 0
    };

    res.status(200).json({
      success: true,
      stats: {
        avgRating:  parseFloat((stats.avgRating || 0).toFixed(2)),
        totalCount: stats.total,
        breakdown:  {
          5: stats.star5,
          4: stats.star4,
          3: stats.star3,
          2: stats.star2,
          1: stats.star1
        }
      },
      pagination: {
        currentPage: page,
        totalPages:  Math.ceil(total / limit),
        total
      },
      reviews
    });

  } catch (err) {
    console.error('Get User Reviews Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= REPORT A REVIEW =================
// Only the reviewee (person being reviewed) can flag it.
exports.reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const callerId = req.user._id.toString();

    const review = await Review.findById(id);
    if (!review || review.isDeleted) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.revieweeId.toString() !== callerId) {
      return res.status(403).json({ success: false, message: 'Only the person being reviewed can report this review' });
    }

    review.isReported    = true;
    review.reportReason  = reason || 'No reason provided';
    await review.save();

    res.status(200).json({ success: true, message: 'Review reported. Admin will review it shortly.' });

  } catch (err) {
    console.error('Report Review Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADMIN DELETE =================
// Hard soft-delete — sets isDeleted: true. Admin only (checked via middleware in routes).
exports.adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, message: 'Review removed successfully' });

  } catch (err) {
    console.error('Admin Delete Review Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET MY WRITTEN REVIEWS =================
// Shows the reviews the logged-in user has submitted (their own posts).
exports.getMyReviews = async (req, res) => {
  try {
    const reviewerId = req.user._id;
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ reviewerId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('revieweeId', 'username avatar')
        .populate('auctionId',  'title'),
      Review.countDocuments({ reviewerId, isDeleted: false })
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages:  Math.ceil(total / limit),
        total
      },
      reviews
    });

  } catch (err) {
    console.error('Get My Reviews Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
