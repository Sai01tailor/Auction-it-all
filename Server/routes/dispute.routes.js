const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/dispute.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// File a claim (post-handoff verification)
router.post('/raise', disputeController.raiseDispute);

// Get list of disputes involving current user
router.get('/user', disputeController.getUserDisputes);

// Get dispute details
router.get('/:id', disputeController.getDisputeById);

// Dispute Mediation Chat History
router.get('/:id/messages', disputeController.getMediationMessages);
router.post('/:id/messages', disputeController.postMediationMessage);

module.exports = router;
