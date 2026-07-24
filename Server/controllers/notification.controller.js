const Notification = require('../models/Notification.model');

// Get all notifications for the logged-in user
exports.getMyNotifications = async (req, res) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.type && req.query.type !== 'All') {
      query.type = req.query.type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    // Count unread messages for the red badge icon
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
      data: notifications
    });
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark a specific notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user._id },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

// Mark ALL notifications as read (useful for a "Mark all as read" button)
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
};