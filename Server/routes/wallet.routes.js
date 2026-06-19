const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Frontend calls this to display balance on the dashboard
router.get('/balance', authMiddleware, walletController.getWalletBalance);

module.exports = router;