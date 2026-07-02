const AuctionSettlement = require("../models/auctionSettlement.model");
const Wallet = require("../models/wallet.model");

const penalizeDeadbeatBuyers = async () => {
    try {
        // Calculate the exact time 48 hours ago
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // Find settlements still stuck in PENDING after 48 hours
        const deadbeatSettlements = await AuctionSettlement.find({
            status: 'PENDING', 
            createdAt: { $lte: fortyEightHoursAgo }
        });

        if (deadbeatSettlements.length === 0) return;

        for (const settlement of deadbeatSettlements) {
            // 1. Mark the settlement as DISPUTED
            settlement.status = 'DISPUTED';
            await settlement.save();

            // 2. Suspend the buyer's wallet for breaking platform rules
            await Wallet.findOneAndUpdate(
                { userId: settlement.buyer },
                { $set: { status: 'SUSPENDED' } }
            );

            console.log(`🚨 CRON: Penalized deadbeat buyer ${settlement.buyer} for Settlement ${settlement.settlementId}`);
            
            // Note: In a real enterprise app, you would also deduct their frozenMoney here
            // and add it to an Admin wallet as a penalty fee!
        }
    } catch (error) {
        console.error("CRON ERROR (Settlement Monitor):", error.message);
    }
};

module.exports = { penalizeDeadbeatBuyers };