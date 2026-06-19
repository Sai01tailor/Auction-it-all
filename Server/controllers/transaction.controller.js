const Transaction=require('../models/transaction.model')
const AuctionCache=require('../redis/auction.cache')

exports.getMyTransactions=async(req,res)=>{
    try{
        const userId = req.user._id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const cacheKey = `tx_history:${userId}:page:${page}`;

        // 1. Check Redis
        const cachedHistory = await AuctionCache.getCache(cacheKey);
        if (cachedHistory) {
        return res.status(200).json(cachedHistory);
        }

        // 2. Fallback to MongoDB
        const startIndex = (page - 1) * limit;
        const transactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit)
        .select('-__v');

        const total = await Transaction.countDocuments({ userId });

        const responseData = {
        success: true,
        count: transactions.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: transactions
        };

        // 3. Save to Cache for 15 minutes (900 seconds)
        await AuctionCache.setCache(cacheKey, 900, responseData);
        res.status(200).json(responseData);


    }catch(err){    
        console.error("Transaction Fetch Error:", err);
        res.status(500).json({ success: false, message: "Could not fetch history."});
    }
}