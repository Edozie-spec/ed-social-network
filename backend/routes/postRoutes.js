const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/authmiddleware');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', 'name avatar')
      .populate('comments')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('GET POSTS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get following posts
router.get('/following', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const followingIds = user.following;
    const posts = await Post.find({ user: { $in: followingIds } })
      .populate('user', 'name avatar')
      .populate('comments')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('FOLLOWING POSTS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name avatar' },
      });

    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('GET SINGLE POST ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a post (with optional poll support)
router.post('/', protect, async (req, res) => {
  try {
    const { content, image, pollQuestion, pollOptions } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    let pollData = undefined;
    if (pollQuestion && pollOptions && pollOptions.length > 0) {
      pollData = {
        question: pollQuestion,
        options: pollOptions.filter(opt => opt.trim() !== '').map(opt => ({ text: opt, votes: [] }))
      };
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      image: image || '',
      poll: pollData
    });

    const populatedPost = await Post.findById(post._id).populate('user', 'name avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('CREATE POST ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error('DELETE POST ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a post
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
  
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    post.content = req.body.content || post.content;
    post.image = req.body.image !== undefined ? req.body.image : post.image;
    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id)
      .populate('user', 'name avatar')
      .populate('comments');
    res.json(populatedPost);
  } catch (error) {
    console.error('UPDATE POST ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Standard Like Post (for backwards compatibility)
router.put('/like/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes.pull(req.user._id);
      // Remove reaction if toggle off standard like
      const existingReactionIndex = post.reactions.findIndex(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (existingReactionIndex > -1) {
        post.reactions.splice(existingReactionIndex, 1);
      }
    } else {
      post.likes.push(req.user._id);
      // Automatically add heart reaction
      post.reactions.push({ user: req.user._id, type: 'heart' });

      // Create Notification alert
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'reaction',
          post: post._id
        });
      }
    }

    await post.save();

    res.json({
      likes: post.likes,
      reactions: post.reactions,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error('LIKE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// React to post with custom emoji
router.put('/react/:id', protect, async (req, res) => {
  try {
    const { type } = req.body; // 'heart', 'laugh', 'fire', 'wow', 'sad'
    if (!type) {
      return res.status(400).json({ message: 'Reaction type is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingIndex = post.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      // If same reaction type, remove it (toggle off)
      if (post.reactions[existingIndex].type === type) {
        post.reactions.splice(existingIndex, 1);
        post.likes.pull(req.user._id);
      } else {
        // Update reaction type
        post.reactions[existingIndex].type = type;
      }
    } else {
      // Create reaction
      post.reactions.push({ user: req.user._id, type });
      if (!post.likes.includes(req.user._id)) {
        post.likes.push(req.user._id);
      }

      // Create Notification alert
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'reaction',
          post: post._id
        });
      }
    }

    await post.save();
    res.json({
      likes: post.likes,
      reactions: post.reactions
    });
  } catch (error) {
    console.error('REACT ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Vote in a post poll
router.put('/vote/:id', protect, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    if (optionIndex === undefined) {
      return res.status(400).json({ message: 'Option index is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.poll || !post.poll.options || post.poll.options.length === 0) {
      return res.status(400).json({ message: 'This post does not have an active poll' });
    }

    // Verify user hasn't voted in any option of this poll yet
    let userVoted = false;
    post.poll.options.forEach((opt) => {
      if (opt.votes.includes(req.user._id)) {
        userVoted = true;
      }
    });

    if (userVoted) {
      return res.status(400).json({ message: 'You have already voted in this poll' });
    }

    // Cast the vote
    post.poll.options[optionIndex].votes.push(req.user._id);
    await post.save();

    res.json(post.poll);
  } catch (error) {
    console.error('POLL VOTE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user list who liked standard style
router.get('/:id/likes', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('likes', 'name avatar');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post.likes);
  } catch (error) {
    console.error('GET LIKES ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
