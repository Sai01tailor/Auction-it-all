const express=require('express');
const router=express.Router();
const authController=require('../controllers/auth.controller');
const authMiddleware=require('../middlewares/auth.middleware');

router.post('/register',authController.sendSignupOtp);
router.post("/verify", authController.verifySignupOtp);
router.post('/login',authController.login);
router.post('/logout',authController.logout);

// ** New Addition-1 for forget Password **
router.post('/forgot-password',authController.forgotPassword);
router.post('/reset-password',authController.resetPassword);

// Protected Route
router.get('/profile',authMiddleware,authController.getProfile);

// New addition for resend OTP
router.post('/resend-otp', authController.resendOtp);

module.exports=router;
