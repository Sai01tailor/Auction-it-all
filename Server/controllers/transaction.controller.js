const Transaction = require('../models/transaction.model')
const AuctionCache = require('../redis/auction.cache')
const { generateReceiptPDF } = require('../utils/pdfGenerator');

exports.getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const cacheKey = `tx_history:${userId}:page:${page}`;

    // 1. Check Redis
    const cachedHistory = await AuctionCache.getCache(cacheKey);
    if (cachedHistory) {
      return res.status(200).json(cachedHistory);
    }

    // 2. Fallback to MongoDB
    const startIndex = (page - 1) * limit;
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .select('-__v');

    const total = await Transaction.countDocuments({ userId });

    const responseData = {
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: transactions
    };

    // 3. Save to Cache for 15 minutes (900 seconds)
    await AuctionCache.setCache(cacheKey, 900, responseData);
    res.status(200).json(responseData);


  } catch (err) {
    console.error("Transaction Fetch Error:", err);
    res.status(500).json({ success: false, message: "Could not fetch history." });
  }
}

/**
 * Download Receipt PDF for a successful wallet top-up transaction
 * GET /api/transaction/:transactionId/receipt
 */
exports.downloadReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user._id;

    // 1. Find the transaction and verify ownership
    const transaction = await Transaction.findById(transactionId)
      .populate('userId', 'name email');

    // 2. Security check: User can only download their own receipts
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    if (transaction.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only access your own receipts"
      });
    }

    // 3. Only allow receipt for successful transactions
    if (transaction.status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: `Receipt not available for ${transaction.status} transactions`
      });
    }

    // 4. Prepare receipt data
    const receiptData = {
      receiptId: `RCPT-${transaction._id.toString().slice(-8).toUpperCase()}`,
      date: new Date(transaction.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      transactionId: transaction.razorpayOrderId,
      paymentId: transaction.razorpayPaymentId || 'N/A',
      userName: transaction.userId.name,
      userEmail: transaction.userId.email || '',
      userId: transaction.userId._id,
      amountPaid: (transaction.amountInPaise / 100).toFixed(2),
      coinsAdded: transaction.coinsToBeAdded,
      paymentMethod: 'Razorpay (Online Payment)',
      status: transaction.status
    };

    // 5. Generate PDF using Puppeteer
    const pdfBuffer = await generateReceiptPDF(receiptData);

    // 6. Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename=BidKar-Receipt-${receiptData.receiptId}.pdf`
    );

    // 7. Send the PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Receipt Generation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate receipt. Please try again later."
    });
  }
};