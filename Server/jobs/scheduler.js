const cron = require('node-cron');

// Import all 5 background workers
const { processEndedAuctions } = require('./auctionCloser.job');
const { startScheduledAuctions } = require('./auctionStarter.job');
const { cleanupGhostUsers } = require('./cleanupUsers.job');
const { cleanupStuckTransactions } = require('./cleanupTransactions.job');
const { penalizeDeadbeatBuyers } = require('./settlementMonitor.job');

const startCronJobs = () => {
    console.log("⏱️  BidKar Enterprise Cron Scheduler Initialized...");

    // 1. AUCTION CLOSER - Runs every minute
    cron.schedule('* * * * *', async () => {
        await processEndedAuctions();
    });

    // 2. AUCTION STARTER - Runs every minute
    cron.schedule('* * * * *', async () => {
        await startScheduledAuctions();
    });

    // 3. ABANDONED PAYMENTS - Runs every hour (At minute 0)
    cron.schedule('0 * * * *', async () => {
        await cleanupStuckTransactions();
    });

    // 4. GHOST USERS - Runs once a day at 3:00 AM server time
    cron.schedule('0 3 * * *', async () => {
        await cleanupGhostUsers();
    });

    // 5. DEADBEAT BUYERS - Runs once a day at 4:00 AM server time
    cron.schedule('0 4 * * *', async () => {
        await penalizeDeadbeatBuyers();
    });
};

module.exports = startCronJobs;