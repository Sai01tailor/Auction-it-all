const Dispute = require('../models/Dispute.model');
const Handoff = require('../models/Handoff.model');
const Message = require('../models/Message.model');
const Notification = require('../models/Notification.model');

// File a claim in the dispute center
exports.raiseDispute = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const { itemId, reason, description, evidence, bypassCooldown } = req.body;

    if (!itemId || !reason || !description) {
      return res.status(400).json({ success: false, message: 'Item ID, reason, and description are required' });
    }

    // Find the handoff room
    const handoff = await Handoff.findOne({ itemId });
    if (!handoff) {
      return res.status(404).json({ success: false, message: 'Handoff record not found for this item' });
    }

    // Enforce 48-hour cooldown period before filing a dispute
    const handoffStartTime = new Date(handoff.createdAt).getTime();
    const elapsedTime = Date.now() - handoffStartTime;
    const hours48 = 48 * 60 * 60 * 1000;

    // Standard check with bypass option for manual verification / testing ease
    if (elapsedTime < hours48 && !bypassCooldown) {
      const remainingTimeMs = hours48 - elapsedTime;
      const remainingHours = Math.ceil(remainingTimeMs / (1000 * 60 * 60));
      return res.status(400).json({
        success: false,
        message: `Cannot file a dispute yet. Please wait another ${remainingHours} hours to coordinate details directly first.`
      });
    }

    // Identify opposing party
    let opponentId;
    if (reporterId.toString() === handoff.buyerId.toString()) {
      opponentId = handoff.sellerId;
    } else if (reporterId.toString() === handoff.sellerId.toString()) {
      opponentId = handoff.buyerId;
    } else {
      return res.status(403).json({ success: false, message: 'You are not a participant in this transaction' });
    }

    // Create the dispute
    const dispute = await Dispute.create({
      itemId,
      handoffId: handoff._id,
      reporterId,
      opponentId,
      reason,
      description,
      evidence: evidence || [],
      status: 'Dispute Raised'
    });

    // Notify opposing party
    await Notification.create({
      userId: opponentId,
      title: 'Dispute Raised Against Transaction',
      message: `A dispute claim was filed by the other party. Admin mediation has been requested.`,
      type: 'System Alerts',
      link: `/disputes`
    });

    return res.status(201).json({
      success: true,
      message: 'Dispute submitted successfully to the Mediation Board',
      dispute
    });

  } catch (error) {
    console.error('Error raising dispute:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get list of disputes involving current user
exports.getUserDisputes = async (req, res) => {
  try {
    const userId = req.user._id;

    const disputes = await Dispute.find({
      $or: [
        { reporterId: userId },
        { opponentId: userId }
      ]
    })
    .populate('itemId', 'title photos')
    .populate('reporterId', 'username email')
    .populate('opponentId', 'username email')
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      disputes
    });
  } catch (error) {
    console.error('Error fetching user disputes:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get dispute details
exports.getDisputeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const dispute = await Dispute.findById(id)
      .populate('itemId', 'title currentHighestBid startingPrice photos')
      .populate('reporterId', 'username email')
      .populate('opponentId', 'username email')
      .populate('resolvedBy', 'username');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    // Verify user participates in dispute, or is an admin
    const isReporter = dispute.reporterId._id.toString() === userId.toString();
    const isOpponent = dispute.opponentId._id.toString() === userId.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isReporter && !isOpponent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied to this dispute dossier' });
    }

    return res.status(200).json({
      success: true,
      dispute
    });
  } catch (error) {
    console.error('Error fetching dispute detail:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Fetch dispute mediation chat history
exports.getMediationMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const messages = await Message.find({ roomId: id, roomType: 'Dispute' })
      .populate('senderId', 'username role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching dispute messages:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Append mediation chat message
exports.postMediationMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, attachments } = req.body;
    const senderId = req.user._id;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    const isReporter = dispute.reporterId.toString() === senderId.toString();
    const isOpponent = dispute.opponentId.toString() === senderId.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isReporter && !isOpponent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied to publish messages here' });
    }

    if (!text && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: 'Message content or attachments required' });
    }

    const newMessage = await Message.create({
      roomId: id,
      roomType: 'Dispute',
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
    console.error('Error posting dispute message:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
