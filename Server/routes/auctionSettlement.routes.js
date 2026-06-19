const express=require('express');
const router=express.Router();
const settlementController=require('../controllers/auctionSettlement.controller.js');

// router.post('/:itemId/settle',settlementController.processAuctionSettlement);
router.get('/:settlementId/invoice',settlementController.downloadInvoice);

module.exports=router;