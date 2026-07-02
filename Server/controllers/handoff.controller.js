const Handoff = require('../models/Handoff.model');
const Item = require('../models/item.model');
const User = require('../models/user.model');
const Message = require('../models/Message.model');
const Notification = require('../models/Notification.model');

// Initiate or retrieve handoff room for a sold item
exports.initiateOrGetHandoff = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    // Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Determine seller and buyer
    const sellerId = item.sellerId;
    let buyerId = item.winnerId;

    // For testing/development fallback, if the item has no winnerId yet,
    // let the current user be the buyer if they are not the seller.
    if (!buyerId) {
      if (userId.toString() !== sellerId.toString()) {
        buyerId = userId;
      } else {
        // Fallback mock buyer for the seller viewing the page
        buyerId = userId; // temporary fallback
      }
    }

    // Check if handoff room exists
    let handoff = await Handoff.findOne({ itemId });

    if (!handoff) {
      // Create new handoff
      handoff = await Handoff.create({
        itemId,
        buyerId,
        sellerId,
        depositCaptured: false, // Default is false, needs to be captured to unlock contact info
        stepperState: 'Contacted'
      });
    }

    // Enforce Authorization: only buyer, seller or admin can access the room
    const isBuyer = req.user._id.toString() === handoff.buyerId.toString();
    const isSeller = req.user._id.toString() === handoff.sellerId.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied to this handoff room' });
    }

    // Retrieve buyer and seller profiles to return contact details
    const buyerUser = await User.findById(handoff.buyerId).select('username email role kycStatus');
    const sellerUser = await User.findById(handoff.sellerId).select('username email role kycStatus');

    // PRIVACY GUARD: Only reveal contact info if deposit has been CAPTURED
    const revealContact = handoff.depositCaptured;

    const formattedBuyer = {
      _id: buyerUser._id,
      username: buyerUser.username,
      kycStatus: buyerUser.kycStatus,
      email: revealContact ? buyerUser.email : 'Locked - Pending Deposit Capture',
      phone: revealContact ? '+91 98765 43210' : 'Locked - Pending Deposit Capture' // Mock verified phone
    };

    const formattedSeller = {
      _id: sellerUser._id,
      username: sellerUser.username,
      kycStatus: sellerUser.kycStatus,
      email: revealContact ? sellerUser.email : 'Locked - Pending Deposit Capture',
      phone: revealContact ? '+91 99999 88888' : 'Locked - Pending Deposit Capture' // Mock verified phone
    };

    return res.status(200).json({
      success: true,
      handoff: {
        _id: handoff._id,
        itemId: handoff.itemId,
        stepperState: handoff.stepperState,
        buyerAgreedChecks: handoff.buyerAgreedChecks,
        sellerAgreedChecks: handoff.sellerAgreedChecks,
        sellerMarkedPaid: handoff.sellerMarkedPaid,
        buyerMarkedReceived: handoff.buyerMarkedReceived,
        depositCaptured: handoff.depositCaptured,
        buyer: formattedBuyer,
        seller: formattedSeller,
        itemTitle: item.title,
        hammerPrice: item.currentHighestBid || item.startingPrice
      }
    });

  } catch (error) {
    console.error('Error in initiateOrGetHandoff:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Capture Deposit - called by buyer to transition from Held -> Captured
exports.captureDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const handoff = await Handoff.findById(id);
    if (!handoff) {
      return res.status(404).json({ success: false, message: 'Handoff room not found' });
    }

    // Only the buyer or admin can capture the deposit
    const isBuyer = userId.toString() === handoff.buyerId.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the buyer can authorize deposit capture' });
    }

    handoff.depositCaptured = true;
    await handoff.save();

    // Trigger Notification for the seller
    await Notification.create({
      userId: handoff.sellerId,
      title: 'Deposit Captured!',
      message: `Buyer has authorized deposit capture. Contact information is now unlocked.`,
      type: 'Payments',
      link: `/handoff/${handoff.itemId}`
    });

    return res.status(200).json({
      success: true,
      message: 'Deposit captured successfully! Contact information unlocked.',
      handoff
    });
  } catch (error) {
    console.error('Error capturing deposit:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update checklist checkbox agreements
exports.updateChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerAgreedChecks, sellerAgreedChecks } = req.body;
    const userId = req.user._id;

    const handoff = await Handoff.findById(id);
    if (!handoff) {
      return res.status(404).json({ success: false, message: 'Handoff room not found' });
    }

    const isBuyer = userId.toString() === handoff.buyerId.toString();
    const isSeller = userId.toString() === handoff.sellerId.toString();

    if (isBuyer && buyerAgreedChecks !== undefined) {
      handoff.buyerAgreedChecks = buyerAgreedChecks;
    }
    if (isSeller && sellerAgreedChecks !== undefined) {
      handoff.sellerAgreedChecks = sellerAgreedChecks;
    }

    await handoff.save();

    return res.status(200).json({
      success: true,
      handoff
    });
  } catch (error) {
    console.error('Error updating checklist:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Advance Stepper status state
exports.updateStepperState = async (req, res) => {
  try {
    const { id } = req.params;
    const { stepperState } = req.body;

    const handoff = await Handoff.findById(id);
    if (!handoff) {
      return res.status(404).json({ success: false, message: 'Handoff room not found' });
    }

    handoff.stepperState = stepperState;
    await handoff.save();

    // Trigger Notification for both
    const notifyUser = req.user._id.toString() === handoff.buyerId.toString() ? handoff.sellerId : handoff.buyerId;
    await Notification.create({
      userId: notifyUser,
      title: 'Handoff Progress Update',
      message: `Handoff state advanced to: ${stepperState}`,
      type: 'System Alerts',
      link: `/handoff/${handoff.itemId}`
    });

    return res.status(200).json({
      success: true,
      handoff
    });
  } catch (error) {
    console.error('Error updating stepper:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Confirm Payment Received - Seller Only (Confirm payment received kill switch)
exports.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const handoff = await Handoff.findById(id);
    if (!handoff) {
      return res.status(404).json({ success: false, message: 'Handoff room not found' });
    }

    if (userId.toString() !== handoff.sellerId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the seller can confirm payment' });
    }

    handoff.sellerMarkedPaid = true;
    handoff.stepperState = 'Payment Received';
    await handoff.save();

    // Update item status to SOLD if not already
    await Item.findByIdAndUpdate(handoff.itemId, { status: 'SOLD' });

    // Trigger Notification for the buyer
    await Notification.create({
      userId: handoff.buyerId,
      title: 'Payment Confirmed!',
      message: `Seller confirmed receipt of the 90% payment. Complete handoff after inspection.`,
      type: 'Payments',
      link: `/handoff/${handoff.itemId}`
    });

    return res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully!',
      handoff
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Confirm Item Received - Buyer Only
exports.confirmItemReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const handoff = await Handoff.findById(id);
    if (!handoff) {
      return res.status(404).json({ success: false, message: 'Handoff room not found' });
    }

    if (userId.toString() !== handoff.buyerId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer can confirm item receipt' });
    }

    handoff.buyerMarkedReceived = true;
    handoff.stepperState = 'Item Received'; // Fully completed handoff
    await handoff.save();

    // Trigger Notification for the seller
    await Notification.create({
      userId: handoff.sellerId,
      title: 'Handoff Completed!',
      message: `Buyer has confirmed receipt of the item. Transaction closed successfully!`,
      type: 'System Alerts',
      link: `/handoff/${handoff.itemId}`
    });

    return res.status(200).json({
      success: true,
      message: 'Handoff completed successfully!',
      handoff
    });
  } catch (error) {
    console.error('Error confirming item receipt:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Chat Message fetcher
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const messages = await Message.find({ roomId: id, roomType: 'Handoff' })
      .populate('senderId', 'username role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching handoff messages:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Post chat message
exports.postMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, attachments } = req.body;
    const senderId = req.user._id;

    if (!text && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: 'Message content or attachments required' });
    }

    const newMessage = await Message.create({
      roomId: id,
      roomType: 'Handoff',
      senderId,
      text: text || '',
      attachments: attachments || []
    });

    const populated = await Message.findById(newMessage._id).populate('senderId', 'username role');

    return res.status(201).json({
      success: true,
      message: populated
    });
  } catch (error) {
    console.error('Error posting message:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
