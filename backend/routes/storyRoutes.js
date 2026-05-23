const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const Story = require('../models/Story');
const User = require('../models/User');

// Create a story
router.post('/', protect, async (req, res) => {
  try {
    const { content, type } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const story = await Story.create({
      user: req.user._id,
      content,
      type: type || 'text'
    });

    const populated = await Story.findById(story._id).populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    console.error('CREATE STORY ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get stories from active following and self
router.get('/', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const followingIds = currentUser.following || [];
    const userIds = [...followingIds, req.user._id];

    // Find all stories from userIds
    const stories = await Story.find({ user: { $in: userIds } })
      .populate('user', 'name avatar')
      .sort({ createdAt: 1 }); // Chronological order of stories for viewer playback

    // Group stories by user
    const grouped = {};
    stories.forEach((story) => {
      if (!story.user) return;
      const uId = story.user._id.toString();
      if (!grouped[uId]) {
        grouped[uId] = {
          user: story.user,
          stories: []
        };
      }
      grouped[uId].stories.push(story);
    });

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('GET STORIES ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
