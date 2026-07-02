const Item = require("../models/item.model");

const startScheduledAuctions = async () => {
    try {
        // Find all DRAFT items where the startTime is right now (or in the past)
        const itemsToStart = await Item.updateMany(
            { 
                status: 'DRAFT', 
                startTime: { $lte: new Date() } 
            },
            { 
                $set: { status: 'ACTIVE' } 
            }
        );

        if (itemsToStart.modifiedCount > 0) {
            console.log(`🚀 CRON: Automatically started ${itemsToStart.modifiedCount} scheduled auctions.`);
        }
    } catch (error) {
        console.error("CRON ERROR (Auction Starter):", error.message);
    }
};

module.exports = { startScheduledAuctions };