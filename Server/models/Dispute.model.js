const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    index: true
  },
  handoffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Handoff',
    required: true,
    index: true
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opponentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: [
      'Item not as described',
      'Seller didn\'t show up',
      'Buyer refused to pay 90%',
      'Other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  evidence: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Dispute Raised', 'Admin Assigned', 'Evidence Review', 'RESOLVED', 'REJECTED'],
    default: 'Dispute Raised',
    index: true
  },
  resolutionDetails: {
    type: String,
    default: ''
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dispute', disputeSchema);
