const express = require('express');
const router = express.Router();
const handoffController = require('../controllers/handoff.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Initiate or retrieve handoff room for a sold item
router.get('/item/:itemId', handoffController.initiateOrGetHandoff);

// Capture the 10% security deposit (Buyer action to unlock contact details)
router.post('/:id/capture-deposit', handoffController.captureDeposit);

// Update checklist checkbox agreements (buyerAgreedChecks, sellerAgreedChecks)
router.patch('/:id/checklist', handoffController.updateChecklist);

// Advance Stepper status state
router.patch('/:id/stepper', handoffController.updateStepperState);

// Confirm Payment Received - Seller Only kill switch
router.post('/:id/confirm-payment', handoffController.confirmPayment);

// Confirm Item Received - Buyer Only completion switch
router.post('/:id/confirm-received', handoffController.confirmItemReceived);

// Handoff Chat Messages
router.get('/:id/messages', handoffController.getMessages);
router.post('/:id/messages', handoffController.postMessage);

module.exports = router;
