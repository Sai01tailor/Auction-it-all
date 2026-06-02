const express=require('express')
const router=express.Router()
const paymentController=require('../controllers/payment.controller')
const authMiddleware=require('../middlewares/auth.middleware')

// Frontend calls this to get orderId
router.post('/create-order',authMiddleware,paymentController.createOrder)


// RAzorpay calls this silently in background
router.post('/webhook',paymentController.verifyWebhook);

module.exports=router;