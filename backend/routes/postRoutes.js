const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');
const User=require('../models/User');

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


router.post('/', protect, async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      image: image || '',
    });

    const populatedPost = await Post.findById(post._id).populate('user', 'name avatar');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('CREATE POST ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

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

router.put('/like/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      likes: post.likes,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error('LIKE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

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