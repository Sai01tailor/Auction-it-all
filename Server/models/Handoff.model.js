const mongoose = require('mongoose');

const handoffSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    unique: true,
    index: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerAgreedChecks: {
    type: Boolean,
    default: false
  },
  sellerAgreedChecks: {
    type: Boolean,
    default: false
  },
  stepperState: {
    type: String,
    enum: ['Contacted', 'Meeting Scheduled', 'Payment Received', 'Item Received'],
    default: 'Contacted'
  },
  sellerMarkedPaid: {
    type: Boolean,
    default: false
  },
  buyerMarkedReceived: {
    type: Boolean,
    default: false
  },
  depositCaptured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Handoff', handoffSchema);
