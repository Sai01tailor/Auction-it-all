const Transaction = require('../models/transaction.model');
const AuctionCache = require('../redis/auction.cache');
const htmlPdf = require('html-pdf-node');
const axios = require('axios');

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
};

exports.getReceipt = async (req, res) => {
  try {
    const txId = req.params.id;
    
    // Find transaction and populate user
    const transaction = await Transaction.findOne({
      $or: [
        { _id: txId },
        { razorpayOrderId: txId },
        { razorpayPaymentId: txId }
      ]
    }).populate('userId', 'username email');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const username = transaction.userId?.username || 'Client';
    const email = transaction.userId?.email || 'N/A';
    const paymentId = transaction.razorpayPaymentId || 'N/A';
    const orderId = transaction.razorpayOrderId || 'N/A';
    
    let isRefund = false;
    let paymentStatus = transaction.status;
    let paymentMethod = 'UPI/Card';
    let coins = transaction.coinsToBeAdded;
    let amount = (transaction.amountInPaise || 0) / 100;
    let dateStr = new Date(transaction.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Fetch details from Razorpay REST API directly via Axios
    if (transaction.razorpayPaymentId && !transaction.razorpayPaymentId.startsWith('pay_mock_')) {
      try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        
        const response = await axios.get(`https://api.razorpay.com/v1/payments/${transaction.razorpayPaymentId}`, {
          headers: { 'Authorization': authHeader }
        });
        
        const payment = response.data;
        paymentMethod = payment.method ? payment.method.toUpperCase() : paymentMethod;
        paymentStatus = payment.status ? payment.status.toUpperCase() : paymentStatus;
        
        // Check for refunds on this payment
        if (payment.amount_refunded && payment.amount_refunded > 0) {
          isRefund = true;
          paymentStatus = 'REFUNDED';
          amount = payment.amount_refunded / 100;
          coins = amount;
        }
      } catch (rzpErr) {
        console.warn('Could not fetch details from Razorpay API, falling back to local DB values:', rzpErr.message);
      }
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt-${txId}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; line-height: 1.6; }
        .receipt-container { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #002366; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #002366; }
        .receipt-title { font-size: 16px; color: #525252; text-align: right; }
        .details-section { display: flex; justify-content: space-between; margin-top: 30px; }
        .details-box { width: 45%; }
        .details-box h4 { margin: 0 0 10px 0; color: #002366; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .details-box p { margin: 5px 0; font-size: 14px; color: #555; }
        .table { width: 100%; border-collapse: collapse; margin-top: 40px; }
        .table th { background-color: #002366; color: #fff; padding: 10px; text-align: left; font-size: 14px; }
        .table td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
        .totals { margin-top: 30px; text-align: right; font-size: 16px; }
        .totals p { margin: 5px 0; }
        .totals .grand-total { font-size: 20px; font-weight: 800; color: #002366; border-top: 1px solid #002366; padding-top: 10px; display: inline-block; }
        .footer { margin-top: 60px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
        .badge-success { background-color: #ecfdf5; color: #10b981; }
        .badge-refund { background-color: #eff6ff; color: #3b82f6; }
        .badge-pending { background-color: #fffbeb; color: #f59e0b; }
    </style>
</head>
<body>
    <div class="receipt-container">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="vertical-align: middle;">
                    <div class="logo">BidKar Escrow</div>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                    <div class="receipt-title">
                        <strong>${isRefund ? 'REFUND RECEIPT' : 'PAYMENT RECEIPT'}</strong><br>
                        <span style="font-size: 12px;">ID: ${txId}</span>
                    </div>
                </td>
            </tr>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
            <tr>
                <td style="width: 50%; vertical-align: top;">
                    <div class="details-box" style="width: 90%;">
                        <h4>Recipient</h4>
                        <p><strong>Username:</strong> ${username}</p>
                        <p><strong>Email:</strong> ${email}</p>
                    </div>
                </td>
                <td style="width: 50%; vertical-align: top;">
                    <div class="details-box" style="width: 95%; margin-left: auto;">
                        <h4>Payment Details</h4>
                        <p><strong>Date:</strong> ${dateStr}</p>
                        <p><strong>Razorpay Payment ID:</strong> ${paymentId}</p>
                        <p><strong>Razorpay Order ID:</strong> ${orderId}</p>
                        <p><strong>Method:</strong> ${paymentMethod}</p>
                        <p><strong>Status:</strong> <span class="badge ${isRefund ? 'badge-refund' : (paymentStatus === 'SUCCESS' ? 'badge-success' : 'badge-pending')}">${paymentStatus}</span></p>
                    </div>
                </td>
            </tr>
        </table>

        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Unit Cost</th>
                    <th style="text-align: right;">Quantity</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${isRefund ? 'Refund of Wallet Coins Credit' : 'Deposit of Wallet Coins (1 Coin = 1 INR)'}</td>
                    <td style="text-align: right;">₹1.00</td>
                    <td style="text-align: right;">${coins}</td>
                    <td style="text-align: right;">₹${amount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <p>Subtotal: ₹${amount.toFixed(2)}</p>
            <p>GST (0%): ₹0.00</p>
            <p class="grand-total">${isRefund ? 'Total Refunded' : 'Total Paid'}: ₹${amount.toFixed(2)}</p>
        </div>

        <div class="footer">
            This is an electronically generated receipt for your records. No physical signature is required. <br>
            If you have any questions, please contact support@bidkar.in
        </div>
    </div>
</body>
</html>
    `;

    const options = { format: 'A4' };
    const file = { content: htmlContent };

    htmlPdf.generatePdf(file, options).then(pdfBuffer => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Receipt-${txId}.pdf`);
      res.send(pdfBuffer);
    });

  } catch (err) {
    console.error('Receipt Generation Error:', err);
    res.status(500).json({ success: false, message: 'Could not generate receipt PDF.' });
  }
};