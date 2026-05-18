const express=require('express');
const router=express.Router();
const authController=require('../controllers/auth.controller');
const authMiddleware=require('../middlewares/auth.middleware');

router.post('/register',authController.sendSignupOtp);
router.post("/verify", authController.verifySignupOtp);
router.post('/login',authController.login);
router.post('/logout',authController.logout)

// Protected Route
router.get('/profile',authMiddleware,authController.getProfile);

module.exports=router;
