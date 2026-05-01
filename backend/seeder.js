const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('Existing data cleared');


    const users = await User.create([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: '123456',
        bio: 'Travel blogger & coffee lover ✈️☕',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: '123456',
        bio: 'Software developer & guitar player',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      {
        name: 'Charlie Lee',
        email: 'charlie@example.com',
        password: '123456',
        bio: 'Photographer & hiker 📷🏔️',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
    ]);

    console.log('Users created');

    const posts = await Post.create([
      {
        user: users[0]._id,
        content: 'Just finished a fantastic trip to the mountains! The view was breathtaking.',
        image: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        user: users[1]._id,
        content: 'Working on a new React project. This component architecture is amazing!',
      },
      {
        user: users[2]._id,
        content: 'Golden hour at the beach today. Nature is the best artist.',
        image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        user: users[0]._id,
        content: 'Coffee and code — the perfect Sunday morning combo.',
      },
    ]);

    console.log('Posts created');

    await Comment.create([
      {
        user: users[1]._id,
        post: posts[0]._id,
        text: 'Wow, that looks amazing! Where is this?',
      },
      {
        user: users[2]._id,
        post: posts[0]._id,
        text: 'I need to go there!',
      },
      {
        user: users[0]._id,
        post: posts[1]._id,
        text: 'React is the best! What state management are you using?',
      },
    ]);

    const comments = await Comment.find({});
    for (const comment of comments) {
      await Post.findByIdAndUpdate(comment.post, {
        $push: { comments: comment._id },
      });
    }

    users[0].following.push(users[1]._id, users[2]._id);
    users[1].followers.push(users[0]._id);
    users[2].followers.push(users[0]._id);
    users[1].following.push(users[0]._id);
    users[0].followers.push(users[1]._id);

    await users[0].save();
    await users[1].save();
    await users[2].save();

    console.log('Comments and follows added');
    console.log('✅ Seeding complete!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();