const Item = require('../models/item.model');
const AuctionCache = require('../redis/auction.cache'); // Importing the new service
const { uploadOnCloudinary } = require('../utils/cloudinary');

// Create Auction Item
exports.createItem = async (req, res) => {
    try {
        // Added startTime to the extraction
        const { title, description, startingPrice, endTime, startTime } = req.body;

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
            startTime: scheduledStartTime, // Safely saving the start time
            endTime: scheduledEndTime
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

// Get All Active Auctions
exports.getActiveItems = async (req, res) => {
  try {
    const cacheKey = "active_auctions";

    // 1. Check Redis RAM using the Service
    const cachedItems = await AuctionCache.getCache(cacheKey);

    if (cachedItems) {
      return res.status(200).json({
        success: true,
        source: "cache",
        count: cachedItems.length,
        items: cachedItems
      });
    }

    // 2. Query MongoDB
    const items = await Item.find({ 
      status: "ACTIVE", 
      endTime: { $gt: new Date() } 
    })
    .populate("sellerId", "username email")
    .sort({ createdAt: -1 });

    // 3. Save to Redis for 60 seconds using the Service
    await AuctionCache.setCache(cacheKey, 60, items);

    res.status(200).json({
      success: true,
      source: "database",
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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

