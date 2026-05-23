const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const Notification = require('../models/Notification');

// Get all notifications for current user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar')
      .populate('post', 'content image')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('GET NOTIFICATIONS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.put('/read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('READ NOTIFICATIONS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
