const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { uploadImage } = require("../middlewares/multer.middleware");

// Public Routes
router.get("/filter-options", itemController.getFilterOptions); // must be before /:id
router.get("/user/my-bids", authMiddleware, itemController.getMyBids); // User's active bids
router.get("/", itemController.getActiveItems);
router.get("/:id", itemController.getItemById);
router.get("/:id/bids", itemController.getItemBids);
router.get("/:id/blind-reveal", itemController.getBlindReveal);

// Protected Routes
router.post("/:id/buy-dutch", authMiddleware, itemController.buyDutch);
router.post("/:id/blind-bid", authMiddleware, itemController.submitBlindBid);
router.post(
  "/",
  authMiddleware, // 1. Verify the JWT and attach req.user
  // 2. Inline Role-Based Access Control (RBAC)
  (req, res, next) => {
    if (req.user.role !== "SELLER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: Only verified sellers can list auction items." 
      });
    }
    next();
  },
  // 3. Process the images. 'photos' must match the Postman/Frontend field name. Max 5 files.
  uploadImage.array("photos", 5), 
  // 4. Execute the controller logic (Cloudinary upload + MongoDB save)
  itemController.createItem 
);

module.exports=router;
