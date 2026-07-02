const User = require('../models/user.model');
const Item = require('../models/item.model');
const Handoff = require('../models/Handoff.model');
const Dispute = require('../models/Dispute.model');
const AuditLog = require('../models/auditLog.model');
const Notification = require('../models/Notification.model');
const { sendKYCSuccessEmail, sendKYCFailedEmail } = require('../services/notification.service');

// Middleware role guard inside controller
const verifyAdmin = (req) => {
  return req.user && req.user.role === 'ADMIN';
};

// Global Pulse real-time stats (P26)
exports.getGlobalPulse = async (req, res) => {
  try {
    if (!verifyAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    // 1. Total Live Auctions (ACTIVE and not expired)
    const totalLiveAuctions = await Item.countDocuments({
      status: 'ACTIVE',
      endTime: { $gt: new Date() }
    });

    // 2. Pending KYC requests count
    const pendingKYC = await User.countDocuments({ kycStatus: 'Pending' });

    // 3. Aggregate HELD Deposits (INR) from active handoffs (where depositCaptured is false)
    const activeHandoffs = await Handoff.find({ depositCaptured: false });
    let totalHeldDeposits = 0;
    for (const h of activeHandoffs) {
      const item = await Item.findById(h.itemId);
      if (item) {
        const hammerPrice = item.currentHighestBid || item.startingPrice;
        totalHeldDeposits += hammerPrice * 0.10; // 10% held deposit
      }
    }

    // 4. Revenue Tracker: 2% platform fee collected from successful 10% captures
    const capturedHandoffs = await Handoff.find({ depositCaptured: true });
    let totalRevenue = 0;
    for (const h of capturedHandoffs) {
      const item = await Item.findById(h.itemId);
      if (item) {
        const hammerPrice = item.currentHighestBid || item.startingPrice;
        const deposit = hammerPrice * 0.10;
        totalRevenue += deposit * 0.02; // 2% of the deposit
      }
    }

    return res.status(200).json({
      success: true,
      pulse: {
        totalLiveAuctions,
        pendingKYC,
        totalHeldDeposits,
        totalRevenue
      }
    });

  } catch (error) {
    console.error('Error fetching global pulse metrics:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Searchable User Directory
exports.getUsers = async (req, res) => {
  try {
    if (!verifyAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching users directory:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Block/Unblock User
exports.toggleUserBlock = async (req, res) => {
  try {
    if (!verifyAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Toggle custom block property
    const isBlocked = user.isBlocked === true;
    user.isBlocked = !isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status changed successfully to: ${user.isBlocked ? 'Blocked' : 'Active'}`,
      isBlocked: user.isBlocked
    });
  } catch (error) {
    console.error('Error toggling user block status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// KYC Manual Approval Dashboard
exports.getPendingKYC = async (req, res) => {
  try {
    if (!verifyAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    const pendingUsers = await User.find({ kycStatus: 'Pending' })
      .select('username email kycStatus kycLastAttemptAt')
      .sort({ kycLastAttemptAt: 1 });

    return res.status(200).json({
      success: true,
      pendingUsers
    });
  } catch (error) {
    console.error('Error fetching pending KYC list:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Resolve KYC Request
exports.resolveKYC = async (req, res) => {
  try {
    if (!verifyAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    const { userId, status, failureReason } = req.body;

    if (!userId || !['Verified', 'Failed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'User ID and valid resolution status are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.kycStatus = status;
    if (status === 'Failed') {
      user.kycFailureReason = failureReason || 'Details mismatch or blurry document uploads.';
    } else {
      user.kycVerifiedAt = new Date();
      user.kycFailureReason = null;
    }
    await user.save();

    // Trigger Notification & Email
    if (status === 'Verified') {
      await sendKYCSuccessEmail(user);
      await Notification.create({
        userId: user._id,
        title: 'KYC Verified!',
        message: 'Congratulations! Your Aadhaar/PAN details are verified. Full bidding leverage unlocked.',
        type: 'System Alerts',
        link: '/dashboard'
      });
    } else {
      await sendKYCFailedEmail(user, user.kycFailureReason);
      await Notification.create({
        userId: user._id,
        title: 'KYC Verification Failed',
        message: `Reason: ${user.kycFailureReason}. Please submit correct details in your profile settings.`,
        type: 'System Alerts',
        link: '/kyc'
      });
    }

    return res.status(200).json({
      success: true,
      message: `KYC status resolved successfully to ${status}`,
      user
    });

  } catch (error) {
    console.error('Error resolving KYC status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Disputes Mediation Queue
exports.getAdminDisputes = async (req, res) => {
  try {
    if (!verifyAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    const disputes = await Dispute.find()
      .populate('itemId', 'title currentHighestBid startingPrice')
      .populate('reporterId', 'username email')
      .populate('opponentId', 'username email')
      .sort({ createdAt: 1 }); // Oldest first (urgency queue)

    return res.status(200).json({
      success: true,
      disputes
    });
  } catch (error) {
    console.error('Error fetching mediation disputes queue:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Resolve dispute verdict settlements
exports.resolveDispute = async (req, res) => {
  try {
    if (!verifyAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    const { disputeId, action, resolutionDetails } = req.body;

    if (!disputeId || !['RESOLVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Dispute ID and resolution action are required' });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    dispute.status = action;
    dispute.resolutionDetails = resolutionDetails || 'Mediation completed by platform administration.';
    dispute.resolvedBy = req.user._id;
    await dispute.save();

    // Settle Handoff Room Wallet releases
    const handoff = await Handoff.findById(dispute.handoffId);
    if (handoff) {
      if (action === 'RESOLVED') {
        // Scenario A: Seller at fault -> Refund 10% to Buyer's wallet (in mock, we cancel capture, set false)
        handoff.depositCaptured = false;
        handoff.stepperState = 'Contacted'; // reset
      } else {
        // Scenario B: Buyer at fault -> Release 10% to Seller as no-show fee (mark captured)
        handoff.depositCaptured = true;
      }
      await handoff.save();
    }

    // Notify both parties
    const alertUsers = [dispute.reporterId, dispute.opponentId];
    for (const u of alertUsers) {
      await Notification.create({
        userId: u,
        title: `Dispute Case ${action}`,
        message: `Mediator Verdict: ${dispute.resolutionDetails}`,
        type: 'System Alerts',
        link: '/disputes'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Dispute mediation resolved: ${action}`,
      dispute
    });

  } catch (error) {
    console.error('Error mediating dispute:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Technical Audit Logs (P30/P31)
exports.getAuditLogs = async (req, res) => {
  try {
    if (!verifyAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    const { action, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (action) {
      filter.action = action;
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'username email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(filter);

    return res.status(200).json({
      success: true,
      logs,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching technical audit logs:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
