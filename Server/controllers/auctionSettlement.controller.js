const AuctionSettlement = require('../models/auctionSettlement.model');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

// NOTE: The processAuctionSettlement logic has been completely moved to the Background Cron Job 
// (jobs/auctionCloser.job.js) to ensure it runs automatically even if users are offline.

/**
 * Triggered when a user clicks "Download Receipt" in the Handoff Room.
 * Gathers the data, formats it, and streams the PDF back to the browser.
 */
exports.downloadInvoice = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Invoice Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate invoice" });
    }
}