const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['All', 'Bids', 'Payments', 'System Alerts', 'OUTBID'],
    default: 'System Alerts',
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  link: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
