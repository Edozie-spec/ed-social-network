const mongoose = require('mongoose');

const storySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'text'],
      default: 'text',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Automatically deletes from MongoDB after 24 hours
    },
  }
);

const Story = mongoose.model('Story', storySchema);
module.exports = Story;
