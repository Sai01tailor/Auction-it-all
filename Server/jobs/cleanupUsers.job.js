const User = require("../models/user.model");

const cleanupGhostUsers = async () => {
    try {
        // Find users who are NOT verified, and their OTP expired in the past
        const result = await User.deleteMany({
            isVerified: false,
            otpExpiresAt: { $lt: new Date() }
        });

        if (result.deletedCount > 0) {
            console.log(`🧹 CRON: Deleted ${result.deletedCount} unverified ghost accounts.`);
        }
    } catch (error) {
        console.error("CRON ERROR (User Cleanup):", error.message);
    }
};

module.exports = { cleanupGhostUsers };

/*Spam bots will drain our database limits. 
This runs once a night to delete users who asked for an OTP 
but never actually verified their email. */