const Notification = require('../models/Notification.model');

// Get all notifications for logged in user (with optional type filtering)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    const query = { userId };
    if (type && type !== 'All') {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark a single notification as read
exports.markRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark all notifications as read for current user
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
