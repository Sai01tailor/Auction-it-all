const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // The 'Intent to Pay' ID (our server->razorPay)
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  
  // The 'Proof of Payment' ID (Added later by the webhook for your Invoices)
  razorpayPaymentId: {
    type: String,
    default: null 
  },

  // Always stored in the smallest unit (Paise) to prevent decimal corruption
  amountInPaise: {
    type: Number,
    required: true,
    min: 100 // Minimum 1 Rupee
  },
  
  // The digital wallet coins they are buying
  coinsToBeAdded: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING"
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Transaction", transactionSchema);