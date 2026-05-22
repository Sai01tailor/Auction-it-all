const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { uploadImage } = require("../middlewares/multer.middleware");

// Public Routes
router.get("/", itemController.getActiveItems);
router.get("/:id", itemController.getItemById);


// Protected Routes
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
