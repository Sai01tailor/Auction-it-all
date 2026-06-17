const AuditLog = require('../models/auditLog.model');

/**
 * @param {string} actionName - A label for the legal log (e.g., "PLACED_BID")
 */
const auditTracker = (actionName) => {
    return (req, res, next) => {
        try {
            const log = new AuditLog({
                // Assumes your Auth middleware puts the user object on req.user
                // ig we need ti build schema
                userId: req.user ? req.user._id : null, 
                action: actionName,
                ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                deviceInfo: req.headers['user-agent'] || 'Unknown_Device',
                endpoint: req.originalUrl
            });


            // We let MongoDB save it in the background so the user's request stays lightning fast.
            log.save().catch(err => console.error("Fatal Audit Log Error:", err));

        } catch (error) {
            console.error("Audit Tracker Middleware Failed:", error);
        }
        next(); 
    };
};

module.exports = auditTracker;