const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  roomType: {
    type: String,
    enum: ['Handoff', 'Dispute'],
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Message', messageSchema);
