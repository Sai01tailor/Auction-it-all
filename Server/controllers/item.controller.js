const Item = require('../models/item.model');
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
    // Added startTime to the extraction
    const { title, description, startingPrice, endTime, startTime, category, condition, location } = req.body;

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
      location: location || ''
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
        .populate('sellerId', 'username email')
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
    const item = await Item.findById(itemId)
      .populate("sellerId", "username email")
      .populate("winnerId", "username email");

    if (!item) {
      return res.status(404).json({ success: false, message: "Auction item not found." });
    }

    // 3. Save to Redis for 30 seconds using the Service
    await AuctionCache.setCache(cacheKey, 30, item);

    res.status(200).json({
      success: true,
      source: "database",
      item
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

