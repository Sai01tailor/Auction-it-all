const Item = require('../models/item.model');
const Bid = require('../models/bid.model');
const Wallet = require('../models/wallet.model');
const AuditLog = require('../models/auditLog.model');
const AuctionCache = require('../redis/auction.cache');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const crypto = require('crypto');

// Stable cache key from query params — same filters always hit same key
const buildCacheKey = (params) => {
  const sorted = Object.keys(params).sort().reduce((acc, k) => {
    acc[k] = params[k];
    return acc;
  }, {});
  return 'items:' + crypto.createHash('md5').update(JSON.stringify(sorted)).digest('hex');
};

// Create Auction Item
exports.createItem = async (req, res) => {
  try {
    // Added startTime and other custom fields to the extraction
    const {
      title,
      description,
      startingPrice,
      endTime,
      startTime,
      category,
      condition,
      location,
      auctionType,
      priceFloor,
      dropInterval,
      dropAmount,
      currentQuantity,
      revealTime,
      submissionDeadline
    } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }
    if (!condition) {
      return res.status(400).json({ success: false, message: "Condition is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one media file is required" });
    }

    // --- TIME VALIDATION LOGIC ---
    const scheduledStartTime = startTime ? new Date(startTime) : new Date();
    const scheduledEndTime = new Date(endTime);

    if (scheduledStartTime < new Date()) {
      return res.status(400).json({ success: false, message: "Start time cannot be in the past." });
    }
    if (scheduledEndTime <= scheduledStartTime) {
      return res.status(400).json({ success: false, message: "End time must be after the start time." });
    }

    // Process all files in parallel
    const uploadPromises = req.files.map(file => uploadOnCloudinary(file.path));
    const uploadResults = await Promise.all(uploadPromises);

    // Filter out any failed Url and extract the secure URLS
    const mediaUrls = uploadResults
      .filter(result => result != null)
      .map(result => result.secure_url);

    if (mediaUrls.length === 0) {
      return res.status(500).json({ success: false, message: "Failed to upload media assets to Cloudinary." });
    }

    // Create the item record
    const newItem = await Item.create({
      title,
      description,
      startingPrice: Number(startingPrice),
      currentHighestBid: Number(startingPrice),
      photos: mediaUrls,
      sellerId: req.user._id,
      startTime: scheduledStartTime,
      endTime: scheduledEndTime,
      category,
      condition,
      location: location || '',
      auctionType: auctionType || 'ENGLISH',
      priceFloor: priceFloor ? Number(priceFloor) : undefined,
      dropInterval: dropInterval ? Number(dropInterval) : undefined,
      dropAmount: dropAmount ? Number(dropAmount) : undefined,
      currentQuantity: currentQuantity ? Number(currentQuantity) : undefined,
      revealTime: revealTime ? new Date(revealTime) : undefined,
      submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : undefined
    });

    // Use the new service to clear the cache so the frontend updates instantly
    await AuctionCache.clearCache("active_auctions");

    res.status(201).json({
      success: true,
      message: "Auction item listed successfully",
      item: newItem
    });
  } catch (err) {
    console.error("Create Item Error", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Get All Active Auctions — with filters, search, sort, pagination
// GET /api/items?page=1&limit=10&category=Electronics&condition=NEW
//               &minPrice=500&maxPrice=5000&search=iphone
//               &sort=endTime_asc|endTime_desc|price_asc|price_desc|newest
//               &endingSoon=true   (items ending within 60 minutes)
//               &status=ACTIVE     (default) | SOLD | CANCELLED
exports.getActiveItems = async (req, res) => {
  try {
    // ── Parse query params ──────────────────────────────────
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const {
      category,
      condition,
      location,
      search,
      sort = 'newest',
      endingSoon,
      status = 'ACTIVE',
      sellerId,
    } = req.query;

    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

    // ── Build cache key from all params ────────────────────
    const cacheKey = buildCacheKey(req.query);
    const cached = await AuctionCache.getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, source: 'cache' });
    }

    // ── Build MongoDB query ─────────────────────────────────
    const query = { status };

    // Active auctions must not be expired
    if (status === 'ACTIVE') {
      query.endTime = { $gt: new Date() };
    }

    // Category filter
    if (category) query.category = category;

    // Condition filter
    if (condition) query.condition = condition;

    // Location — partial match, case insensitive
    if (location) query.location = { $regex: location, $options: 'i' };

    // Seller filter
    if (sellerId) query.sellerId = sellerId;

    // Price range — against currentHighestBid
    if (minPrice !== null || maxPrice !== null) {
      query.currentHighestBid = {};
      if (minPrice !== null) query.currentHighestBid.$gte = minPrice;
      if (maxPrice !== null) query.currentHighestBid.$lte = maxPrice;
    }

    // Ending soon — within next 60 minutes
    if (endingSoon === 'true') {
      const sixtyMinutesFromNow = new Date(Date.now() + 60 * 60 * 1000);
      query.endTime = {
        $gt: new Date(),
        $lte: sixtyMinutesFromNow
      };
    }

    // Text search on title + description (uses the text index)
    let textScore = {};
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
      textScore = { score: { $meta: 'textScore' } };
    }

    // ── Sort ────────────────────────────────────────────────
    let sortObj = {};
    if (search && search.trim()) {
      // Best text match first when searching
      sortObj = { score: { $meta: 'textScore' } };
    } else {
      switch (sort) {
        case 'endTime_asc': sortObj = { endTime: 1 }; break;
        case 'endTime_desc': sortObj = { endTime: -1 }; break;
        case 'price_asc': sortObj = { currentHighestBid: 1 }; break;
        case 'price_desc': sortObj = { currentHighestBid: -1 }; break;
        case 'newest':
        default: sortObj = { createdAt: -1 }; break;
      }
    }

    // ── Execute query + count in parallel ──────────────────
    const [items, total] = await Promise.all([
      Item.find(query, textScore)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('sellerId', 'username email createdAt kycStatus role')
        .lean(),
      Item.countDocuments(query)
    ]);

    const responseData = {
      success: true,
      source: 'database',
      count: items.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      items
    };

    // Cache for 60s — filtered results have shorter TTL since they change more
    await AuctionCache.setCache(cacheKey, 60, responseData);

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Get Items Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get categories + conditions (static — for frontend dropdowns)
exports.getFilterOptions = (req, res) => {
  res.status(200).json({
    success: true,
    categories: [
      'Electronics', 'Art', 'Vehicles', 'Fashion',
      'Furniture', 'Collectibles', 'Jewellery', 'Books', 'Sports', 'Other'
    ],
    conditions: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'],
    sortOptions: [
      { value: 'newest', label: 'Newest First' },
      { value: 'endTime_asc', label: 'Ending Soon' },
      { value: 'endTime_desc', label: 'Ending Last' },
      { value: 'price_asc', label: 'Price: Low to High' },
      { value: 'price_desc', label: 'Price: High to Low' }
    ]
  });
};

// Get single Auction Details
exports.getItemById = async (req, res) => {
  try {
    const itemId = req.params.id;
    const cacheKey = `item:${itemId}`;

    // 1. Check Redis RAM using the Service
    const cachedItem = await AuctionCache.getCache(cacheKey);

    if (cachedItem) {
      return res.status(200).json({
        success: true,
        source: "cache",
        item: cachedItem
      });
    }

    // 2. Query MongoDB
    const [item, bidsCount] = await Promise.all([
      Item.findById(itemId)
        .populate("sellerId", "username email createdAt kycStatus role")
        .populate("winnerId", "username email"),
      Bid.countDocuments({ auctionId: itemId })
    ]);

    if (!item) {
      return res.status(404).json({ success: false, message: "Auction item not found." });
    }

    const itemObj = item.toObject();
    itemObj.bidsCount = bidsCount;

    // 3. Save to Redis for 30 seconds using the Service
    await AuctionCache.setCache(cacheKey, 30, itemObj);

    res.status(200).json({
      success: true,
      source: "database",
      item: itemObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bids for an item
exports.getItemBids = async (req, res) => {
  try {
    const { id } = req.params;
    const bids = await Bid.find({ auctionId: id })
      .populate('bidderId', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bids: bids.map(b => ({
        bidder: { username: b.bidderId?.username || 'Anonymous' },
        amount: b.amount,
        timestamp: b.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Purchase item via Dutch Auction Buy Now
exports.buyDutch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.auctionType !== 'DUTCH') {
      return res.status(400).json({ success: false, message: 'This is not a Dutch auction.' });
    }

    if (item.status === 'SOLD') {
      return res.status(400).json({ success: false, message: 'Item already sold!' });
    }

    // Calculate current price dynamically
    const now = Date.now();
    const startMs = new Date(item.startTime).getTime();
    const interval = item.dropInterval || 20;
    const dropAmt = item.dropAmount || Math.max(100, Math.floor(item.startingPrice * 0.04));
    const floor = item.priceFloor || Math.max(1, Math.floor(item.startingPrice * 0.45));

    let currentPrice = item.startingPrice;
    if (now >= startMs) {
      const elapsedSeconds = Math.floor((now - startMs) / 1000);
      const drops = Math.floor(elapsedSeconds / interval);
      currentPrice = Math.max(floor, item.startingPrice - (drops * dropAmt));
    }

    // Check if seller is trying to buy their own item
    if (item.sellerId.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'Sellers cannot buy their own items!' });
    }

    // Wallet transaction: freeze 10% security deposit
    const requiredDeposit = Math.floor(currentPrice * 0.1);
    const userWallet = await Wallet.findOne({ userId });
    if (!userWallet || userWallet.availableMoney < requiredDeposit) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance for deposit!' });
    }

    // Freeze money
    userWallet.availableMoney -= requiredDeposit;
    userWallet.frozenMoney += requiredDeposit;
    await userWallet.save();

    // Mark item as SOLD
    item.status = 'SOLD';
    item.winnerId = userId;
    item.currentHighestBid = currentPrice;
    await item.save({ validateBeforeSave: false });

    // Create Bid record
    await Bid.create({
      auctionId: id,
      bidderId: userId,
      amount: currentPrice,
      status: 'ACCEPTED',
      ipAddress: req.ip
    });

    // Clear caches
    await AuctionCache.clearCache(`item:${id}`);
    await AuctionCache.clearCache("active_auctions");

    res.status(200).json({
      success: true,
      message: 'Purchase transaction recorded in escrow. Item locked.',
      item
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Submit sealed Blind Bid
exports.submitBlindBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user._id;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.auctionType !== 'BLIND') {
      return res.status(400).json({ success: false, message: 'This is not a Blind auction.' });
    }

    const now = Date.now();
    const deadline = new Date(item.endTime).getTime();
    if (now > deadline) {
      return res.status(400).json({ success: false, message: 'Submission deadline has passed!' });
    }

    // Check if seller is bidding
    if (item.sellerId.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'Sellers cannot bid on their own items!' });
    }

    // Wallet check: freeze 10% security deposit
    const requiredDeposit = Math.floor(amount * 0.1);
    const userWallet = await Wallet.findOne({ userId });
    if (!userWallet || userWallet.availableMoney < requiredDeposit) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance for deposit!' });
    }

    // We can allow updating existing blind bid for the same user
    await Bid.deleteMany({ auctionId: id, bidderId: userId });

    // Freeze money
    userWallet.availableMoney -= requiredDeposit;
    userWallet.frozenMoney += requiredDeposit;
    await userWallet.save();

    // Create Bid record
    await Bid.create({
      auctionId: id,
      bidderId: userId,
      amount: Number(amount),
      status: 'ACCEPTED',
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Your blind bid has been sealed and encrypted.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch decrypted Blind reveal data after deadline
exports.getBlindReveal = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.auctionType !== 'BLIND') {
      return res.status(400).json({ success: false, message: 'This is not a Blind auction.' });
    }

    const now = Date.now();
    const deadline = new Date(item.endTime).getTime();
    if (now < deadline) {
      return res.status(400).json({ success: false, message: 'Cannot reveal bids before the deadline!' });
    }

    // Fetch all bids
    const bids = await Bid.find({ auctionId: id })
      .populate('bidderId', 'username')
      .sort({ amount: -1 });

    const formattedBids = bids.map(b => ({
      bidder: { username: b.bidderId?.username || 'Anonymous' },
      amount: b.amount,
      timestamp: b.createdAt
    }));

    const winner = formattedBids.length > 0 ? formattedBids[0] : null;

    // Persist winner in database if not already done
    if (winner && !item.winnerId && item.status !== 'SOLD') {
      const winnerBid = bids[0];
      item.winnerId = winnerBid.bidderId._id;
      item.currentHighestBid = winnerBid.amount;
      item.status = 'SOLD';
      await item.save({ validateBeforeSave: false });

      // Clear caches
      await AuctionCache.clearCache(`item:${id}`);
      await AuctionCache.clearCache("active_auctions");
    }

    res.status(200).json({
      success: true,
      bids: formattedBids,
      winner
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all active auctions the logged-in user has placed a bid on
exports.getMyBids = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get distinct auction IDs where user has placed bids
    const biddedAuctionIds = await Bid.distinct('auctionId', { bidderId: userId });

    if (!biddedAuctionIds || biddedAuctionIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, items: [] });
    }

    // 2. Fetch ACTIVE items matching those IDs
    const items = await Item.find({
      _id: { $in: biddedAuctionIds },
      status: 'ACTIVE'
    })
      .populate('sellerId', 'username email createdAt kycStatus role')
      .sort({ updatedAt: -1 })
      .lean();

    // 3. Attach bidsCount to each item
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const [bidsCount, myHighestBidDoc] = await Promise.all([
          Bid.countDocuments({ auctionId: item._id }),
          Bid.findOne({ auctionId: item._id, bidderId: userId }).sort({ amount: -1 })
        ]);
        return {
          ...item,
          bidsCount,
          myHighestBid: myHighestBidDoc ? myHighestBidDoc.amount : item.currentHighestBid
        };
      })
    );

    res.status(200).json({
      success: true,
      count: itemsWithDetails.length,
      items: itemsWithDetails
    });
  } catch (error) {
    console.error('Get My Bids Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
