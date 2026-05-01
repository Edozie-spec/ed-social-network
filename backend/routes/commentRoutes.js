const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/authMiddleware');

router.post('/:postId/comments', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = await Comment.create({
      user: req.user._id,
      post: req.params.postId,
      text,
    });

    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name avatar');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('ADD COMMENT ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndUpdate(req.params.postId, {
      $pull: { comments: comment._id },
    });

    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error('DELETE COMMENT ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;