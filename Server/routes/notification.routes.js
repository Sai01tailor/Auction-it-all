const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get current user's notifications (with optional type filter)
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.patch('/:id/read', notificationController.markRead);

// Mark all as read
router.post('/read-all', notificationController.markAllRead);

module.exports = router;
