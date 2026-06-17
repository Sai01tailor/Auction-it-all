const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
    try {    
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "no token provided" });
        }
        
        const token = authHeader.split(" ")[1];
        
        // Decoding the token payload using your exact naming constraint
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Querying the unified user collection using decoded.userId
        const user = await userModel.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "user not found" });
        }

        // Storing validated identity strictly on req.user
        req.user = user;
        next();
        
    } catch (err) {
        res.status(401).json({ success: false, message: "invalid token" });
    }
};

module.exports = authMiddleware;