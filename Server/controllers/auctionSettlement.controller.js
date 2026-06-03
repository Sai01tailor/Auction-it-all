const AuctionSettlement=require('../models/auctionSettlement.model');
const Item=require('../models/item.model');
const {generateInvoicePDF}=require('../utils/pdfGenerator');

/**
 * Triggered when an auction ends. 
 * Calculates the 10% and 90% split in paise and saves the permanent record.
 */
exports.processAuctionSettlement=async(req,res)=>{
    try{
        const { itemId } = req.params;

        // 1. Fetch the item and populate both the seller and the winner
        const item = await Item.findById(itemId)
            .populate('sellerId', 'username email')
            .populate('winnerId', 'username email');

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        // Ensure the item actually has a winner
        if (!item.winnerId) {
            return res.status(400).json({ success: false, message: "Cannot settle an auction with no winner." });
        }

        const hammerPricePaise = Math.round(item.currentHighestBid * 100);
        const securityDepositPaise = Math.round(hammerPricePaise * 0.10); // 10%
        const offlineBalancePaise = hammerPricePaise - securityDepositPaise; // 90%

        // 3.5 UPDATE THE ITEM STATUS TO SOLD (The fix!)
        item.status = 'SOLD';
        await item.save(); // Persists the "SOLD" status to MongoDB
        
        // 3. Generate a unique Settlement ID for the receipt
        const settlementId = `SETTLE-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        // 4. Save the permanent ledger record
        const settlement = new AuctionSettlement({
            settlementId,
            item: item._id,
            buyer: item.winnerId._id,
            seller: item.sellerId._id,
            hammerPricePaise,
            securityDepositPaise,
            offlineBalancePaise,
            status: 'COMPLETED'
        });

        await settlement.save();

        res.status(201).json({
            success: true,
            message: "Auction settled successfully",
            data: settlement
        });
    }catch(error){
        console.error("Settlement Error:", error);
        res.status(500).json({ success: false, message: "Server error during settlement" });
    }
}

//  Triggered when a user clicks "Download Receipt".
//  Gathers the data, formats it, and streams the PDF back to the browser.

exports.downloadInvoice=async(req,res)=>{
    try{
        const { settlementId } = req.params;
        // 1. Fetch the settlement and populate all required fields for the EJS template
        const settlement = await AuctionSettlement.findOne({ settlementId })
            .populate('item', 'title')
            .populate('buyer', 'username')
            .populate('seller', 'username');

        if (!settlement) {
            return res.status(404).json({ success: false, message: "Settlement not found" });
        }

        // 2. Map the database fields perfectly to your invoice.ejs tags
        const invoiceData = {
            date: new Date(settlement.createdAt).toLocaleDateString('en-IN'),
            transactionId: settlement.settlementId,
            
            buyerName: settlement.buyer.username,
            buyerId: settlement.buyer._id.toString(),
            
            sellerName: settlement.seller.username,
            sellerId: settlement.seller._id.toString(),
            
            itemName: settlement.item.title,
            
            // Using the Mongoose Virtuals we created to format paise back to Rupees
            hammerPrice: settlement.hammerPriceRupees,
            securityDeposit: settlement.securityDepositRupees,
            offlineBalance: settlement.offlineBalanceRupees
        }

        // 3. Trigger Puppeteer to generate the PDF Buffer
        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // 4. Set HTTP headers so the browser knows it is receiving a downloadable PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=BidKar-Invoice-${settlement.settlementId}.pdf`);

        // 5. Send the file
        res.send(pdfBuffer);
    }catch(error){
        console.error("Invoice Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate invoice" });
    }
}