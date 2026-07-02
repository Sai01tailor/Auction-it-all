/**
 * utils/timer.js
 * Core Time Management for the Live Auction Engine
 */

// Configuration variables (Easy to adjust later)
const ANTI_SNIPING_BUFFER_MS = 30 * 1000; // 30 seconds
const EXTENSION_TIME_MS = 60 * 1000;      // 1 minute added if sniped

/**
 * Calculates exactly how many milliseconds are left for an auction.
 * Returns 0 if the time has already passed.
 * * @param {Date|String} endTime - The official end time of the auction
 * @returns {Number} Milliseconds remaining
 */
const getRemainingTime = (endTime) => {
    const now = Date.now();
    const end = new Date(endTime).getTime();
    return Math.max(0, end - now);
};

/**
 * A fast boolean check to see if an auction is completely over.
 * * @param {Date|String} endTime - The official end time of the auction
 * @returns {Boolean} True if expired, False if still active
 */
const isExpired = (endTime) => {
    return getRemainingTime(endTime) === 0;
};

/**
 * The Anti-Sniping Engine. 
 * If a user bids at the very last second, this function calculates the new extended deadline.
 * * @param {Date|String} currentEndTime - The current auction end time
 * @returns {Date} The new Date object (either extended or unchanged)
 */
const calculateNewEndTime = (currentEndTime) => {
    const remainingMs = getRemainingTime(currentEndTime);

    // If the auction is still active AND the bid is placed in the final 30 seconds
    if (remainingMs > 0 && remainingMs <= ANTI_SNIPING_BUFFER_MS) {
        const end = new Date(currentEndTime).getTime();
        // Return a new extended Date
        return new Date(end + EXTENSION_TIME_MS);
    }

    // Otherwise, the time doesn't change
    return new Date(currentEndTime);
};

/**
 * Optional: Formats milliseconds into a clean HH:MM:SS string for backend logging.
 * (The frontend will usually handle its own formatting, but this is great for your terminal)
 */
const formatTimeLeft = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
};

module.exports = {
    getRemainingTime,
    isExpired,
    calculateNewEndTime,
    formatTimeLeft,
    ANTI_SNIPING_BUFFER_MS,
    EXTENSION_TIME_MS
};