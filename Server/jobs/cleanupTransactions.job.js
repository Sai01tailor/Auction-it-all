const Transaction = require("../models/transaction.model");

const cleanupStuckTransactions = async () => {
    try {
        // Calculate the exact time 30 minutes ago
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        // Find PENDING transactions older than 30 mins and mark them FAILED
        const result = await Transaction.updateMany(
            {
                status: 'PENDING',
                createdAt: { $lte: thirtyMinutesAgo }
            },
            {
                $set: { status: 'FAILED' }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`💸 CRON: Marked ${result.modifiedCount} abandoned Razorpay transactions as FAILED.`);
        }
    } catch (error) {
        console.error("CRON ERROR (Transaction Cleanup):", error.message);
    }
};

module.exports = { cleanupStuckTransactions };