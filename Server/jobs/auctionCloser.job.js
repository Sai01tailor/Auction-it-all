const Item = require("../models/item.model");
const AuctionSettlement = require("../models/auctionSettlement.model");
const { getIo } = require("../sockets/socket"); // To broadcast the 'Auction Ended' event
const crypto = require("crypto");

const processEndedAuctions = async () => {
    try {
        // 1. Find all ACTIVE items where the endTime has passed
        const expiredItems = await Item.find({
            status: 'ACTIVE',
            endTime: { $lte: new Date() }
        });

        if (expiredItems.length === 0) return; // Nothing to sweep

        console.log(`🧹 CRON: Found ${expiredItems.length} expired auctions. Processing...`);

        for (const item of expiredItems) {
            // SCENARIO A: The Auction had a Winner
            if (item.winnerId) {
                // 1. Change Status to SOLD
                item.status = 'SOLD';
                await item.save();

                // 2. Math for the Settlement Receipt (Converting everything to Paise)
                const hammerPricePaise = item.currentHighestBid * 100;
                const securityDepositPaise = hammerPricePaise * 0.10; // The 10% already frozen
                const offlineBalancePaise = hammerPricePaise * 0.90;  // The 90% owed in person

                // 3. Generate the unique Invoice ID (e.g., SETTLE-8f3a9b)
                const uniqueSettlementId = `SETTLE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

                // 4. Create the official Settlement Receipt
                await AuctionSettlement.create({
                    settlementId: uniqueSettlementId,
                    item: item._id,
                    buyer: item.winnerId,
                    seller: item.sellerId,
                    hammerPricePaise: hammerPricePaise,
                    securityDepositPaise: securityDepositPaise,
                    offlineBalancePaise: offlineBalancePaise,
                    status: 'PENDING' // The platform's job is done, now they meet offline (PENDING or CHANGED) mp PENDING 
                });

                // 5. Broadcast to the room: The auction is over! Redirect to Handoff!
                try {
                    const io = getIo();
                    io.to(`auction:${item._id}`).emit("auction_ended", {
                        message: "This auction has officially closed!",
                        winnerId: item.winnerId,
                        finalPrice: item.currentHighestBid
                    });
                } catch (socketErr) {
                    console.log("Socket not ready, skipping broadcast.");
                }

                console.log(`✅ CRON: Auction ${item._id} SOLD to ${item.winnerId}`);
            } 
            // SCENARIO B: Nobody bid on the item
            else {
                item.status = 'CANCELLED';
                await item.save();
                
                try {
                    const io = getIo();
                    io.to(`auction:${item._id}`).emit("auction_cancelled", {
                        message: "Auction ended with no bids."
                    });
                } catch (socketErr) { }

                console.log(`❌ CRON: Auction ${item._id} CANCELLED (No Bids)`);
            }
        }
    } catch (error) {
        console.error("CRON ERROR (Auction Closer):", error.message);
    }
};

module.exports = { processEndedAuctions };