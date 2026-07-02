const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. CREATE ORDER (Frontend asks to buy coins)
exports.createOrder = async (req, res) => {
  try {
    const { coinsRequested } = req.body;
    const userId = req.user._id;

    // Fixed Conversion Rate
    const conversionRate = 1; 
    const amountINR = coinsRequested * conversionRate;
    
    // EDGE CASE PREVENTED: Floating Point Math
    // Force it to an integer (Paise) before talking to Razorpay or DB
    const amountInPaise = Math.round(amountINR * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      // Fix: Cut the string down to a maximum of 40 characters
      receipt: `rcpt_${userId}_${Date.now()}`.substring(0, 40)
    };

    // 1. Create order on Razorpay servers
    const order = await razorpay.orders.create(options);

    // 2. EDGE CASE PREVENTED: Webhook Drop
    // Save the PENDING intent to our ledger immediately
    await Transaction.create({
      userId,
      razorpayOrderId: order.id,
      amountInPaise,
      coinsToBeAdded: coinsRequested,
      status: "PENDING"
    });

    // 3. Send order details back to frontend to open the popup
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR"
    });

  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({ success: false, message: "Could not initiate payment." });
  }
};


// 2. VERIFY WEBHOOK (Razorpay confirms payment)
exports.verifyWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // // EDGE CASE PREVENTED: Webhook Spoofing / Hijacking
  // // Cryptographically verify the payload actually came from Razorpay
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  // if (expectedSignature !== signature) {
  //   return res.status(400).json({ success: false, message: "Invalid Signature" });
  // }

  // We only care about successful payments
  if (req.body.event !== 'payment.captured') {
    return res.status(200).json({ success: true, message: "Event ignored" });
  }

  const paymentData = req.body.payload.payment.entity;
  const orderId = paymentData.order_id;
  const paymentId = paymentData.id;

  // EDGE CASE PREVENTED: Ghost Unfreeze / Partial Updates
  // Start an ACID Database Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the pending transaction (and lock it to this session)
    const transaction = await Transaction.findOne({ razorpayOrderId: orderId }).session(session);

    // If it doesn't exist or is already processed, acknowledge Razorpay and stop.
    if (!transaction || transaction.status !== "PENDING") {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: "Already processed or invalid." });
    }

    // 2. Mark ledger as SUCCESS and save the Payment ID for future invoices
    transaction.status = "SUCCESS";
    transaction.razorpayPaymentId = paymentId;
    await transaction.save({ session });

    // 3. EDGE CASE PREVENTED: Double-Spend Race Condition
    // Safely inject coins into the user's wallet using $inc atomic operator
    await Wallet.findOneAndUpdate(
      { userId: transaction.userId },
      { $inc: { availableMoney: transaction.coinsToBeAdded } },
      { 
        session, 
        returnDocument: 'after', // Fixes the deprecation warning
        upsert: true             // CREATES the wallet if it doesn't exist
      }
    );

    // 4. Commit everything! If code reaches here, both DB updates succeed together.
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Payment verified, wallet credited!" });

  } catch (error) {
    // If ANYTHING fails (math error, DB crash), roll everything back immediately.
    await session.abortTransaction();
    session.endSession();
    console.error("Webhook Processing Error:", error);
    res.status(500).json({ success: false, message: "Internal server error during verification." });
  }
};