const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Start or get a conversation
router.post('/conversation', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId]
      });
    }

    const populated = await Conversation.findById(conversation._id).populate('participants', 'name avatar bio');
    res.status(201).json(populated);
  } catch (error) {
    console.error('START CONVERSATION ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user conversations
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name avatar bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('GET CONVERSATIONS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get messages in a conversation
router.get('/:convId/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.convId
    })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('GET MESSAGES ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/message', protect, async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    if (!conversationId || !text) {
      return res.status(400).json({ message: 'Conversation ID and text are required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('SEND MESSAGE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
