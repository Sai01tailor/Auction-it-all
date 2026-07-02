const User = require('../models/user.model');
const Item = require('../models/item.model');
const AuctionSettlement = require('../models/auctionSettlement.model');

// ================= SELLER DASHBOARD =================
exports.getDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Run all aggregations in parallel
    const [
      totalListings,
      activeListings,
      soldListings,
      cancelledListings,
      revenueData,
      pendingSettlements,
      disputedSettlements,
      recentListings
    ] = await Promise.all([
      // Total listings
      Item.countDocuments({ sellerId }),

      // Active listings
      Item.countDocuments({ sellerId, status: 'ACTIVE' }),

      // Sold listings
      Item.countDocuments({ sellerId, status: 'SOLD' }),

      // Cancelled listings
      Item.countDocuments({ sellerId, status: 'CANCELLED' }),

      // Total revenue (sum of hammerPrice for COMPLETED settlements)
      AuctionSettlement.aggregate([
        {
          $lookup: {
            from: 'items',
            localField: 'item',
            foreignField: '_id',
            as: 'itemData'
          }
        },
        { $unwind: '$itemData' },
        {
          $match: {
            'itemData.sellerId': sellerId,
            status: 'COMPLETED'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$hammerPricePaise' }
          }
        }
      ]),

      // Pending settlements count
      AuctionSettlement.countDocuments({
        seller: sellerId,
        status: 'PENDING'
      }),

      // Disputed settlements count
      AuctionSettlement.countDocuments({
        seller: sellerId,
        status: 'DISPUTED'
      }),

      // Recent 5 listings
      Item.find({ sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status currentHighestBid endTime createdAt')
        .lean()
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      dashboard: {
        totalListings,
        activeListings,
        soldListings,
        cancelledListings,
        totalRevenueRupees: (totalRevenue / 100).toFixed(2),
        pendingSettlements,
        disputedSettlements,
        recentListings: recentListings.map(item => ({
          _id: item._id,
          title: item.title,
          status: item.status,
          currentHighestBid: item.currentHighestBid,
          endTime: item.endTime,
          createdAt: item.createdAt
        }))
      }
    });

  } catch (err) {
    console.error('Seller Dashboard Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= MY LISTINGS =================
exports.getMyListings = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const status = req.query.status; // optional filter
    const skip  = (page - 1) * limit;

    const query = { sellerId };
    if (status) query.status = status;

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      },
      items
    });

  } catch (err) {
    console.error('Get My Listings Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
