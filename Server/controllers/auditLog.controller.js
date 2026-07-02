const AuditLog = require('../models/auditLog.model');

// ================= GET AUDIT LOGS (ADMIN ONLY) =================
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      userId,
      action,
      auctionId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (auctionId) query['metadata.auctionId'] = auctionId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'username email')
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      logs
    });

  } catch (err) {
    console.error('Get Audit Logs Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET AUCTION BID TIMELINE (ADMIN ONLY) =================
// Returns millisecond-accurate bid timeline for a specific auction
exports.getAuctionBidTimeline = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const logs = await AuditLog.find({
      action: { $in: ['BID_ATTEMPT', 'BID_ACCEPTED', 'BID_REJECTED'] },
      'metadata.auctionId': auctionId
    })
      .sort({ createdAt: 1 }) // chronological
      .populate('userId', 'username email')
      .lean();

    // Group by bid attempt for tie-breaking analysis
    const timeline = logs.map(log => ({
      timestamp: log.createdAt,
      serverReceivedAt: log.metadata?.serverReceivedAt || log.createdAt,
      action: log.action,
      userId: log.userId?._id,
      username: log.userId?.username,
      amount: log.metadata?.amount,
      serverId: log.metadata?.serverId,
      ipAddress: log.ipAddress,
      reason: log.metadata?.reason
    }));

    res.status(200).json({
      success: true,
      auctionId,
      timeline
    });

  } catch (err) {
    console.error('Get Auction Bid Timeline Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
