const Wallet=require('../models/wallet.model');
const AuctionCache=require('../redis/auction.cache');

exports.getWalletBalance=async(req,res)=>{
    try{
        const userId=req.user._id;
        const cacheKey = `wallet_balance:${userId}`;

        //1. Check Redis via our custom class 
        const cachedBalance=await AuctionCache.getCache(cacheKey);
        if(cachedBalance){
            return res.status(200).json({success:true,data:cachedBalance});
        }

        // 2. Fallback to mongoDB
        let wallet = await Wallet.findOne({ userId });
    
        const walletData = wallet ? {
        availableMoney:wallet.availableMoney,
        frozenMoney:wallet.frozenMoney,
        currency:wallet.currency
        } : { availableMoney: 0, frozenMoney: 0, currency: 'INR' };

        // Save to cache for 1hr 
        await AuctionCache.setCache(cacheKey,3600,walletData);

        res.status(200).json({success:true,data:walletData})

    }catch(err){
        console.error("Wallet Fetch Error:", err);
        res.status(500).json({ success: false, message: "Could not fetch balance." });
    }
};


// This uses Redis to instantly serve the balance, keeping your database safe from spam-refreshing.