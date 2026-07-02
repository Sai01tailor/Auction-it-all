const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Frontend calls this to display the Top-Up history table
router.get('/history', authMiddleware, transactionController.getMyTransactions);

// Fetch PDF payment/refund receipt using Razorpay API
router.get('/:id/receipt', authMiddleware, transactionController.getReceipt);

module.exports = router;