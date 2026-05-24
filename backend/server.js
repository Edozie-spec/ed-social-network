const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const storyRoutes = require('./routes/storyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support larger base64 uploads for images
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
  res.setHeader('Connection', 'close');
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('ED API is running...');
});

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, 
    connectTimeoutMS: 10000,       
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);               
  });

const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Also try http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.log('Server startup error:', err.message);
});

// Configure Socket.io
const socketio = require('socket.io');
const io = socketio(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const activeUsers = new Map(); // tracks userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected to socket.io:', socket.id);

  socket.on('setup', (userData) => {
    if (!userData || !userData._id) return;
    socket.join(userData._id);
    activeUsers.set(userData._id.toString(), socket.id);
    console.log('User setup room for ID:', userData._id);
    socket.emit('connected');
    
    // Broadcast active online users list
    io.emit('online_users', Array.from(activeUsers.keys()));
  });

  socket.on('join_chat', (room) => {
    socket.join(room);
    console.log('User joined DM chat room:', room);
  });

  socket.on('typing', ({ room, userId }) => {
    socket.in(room).emit('typing', { room, userId });
  });

  socket.on('stop_typing', ({ room, userId }) => {
    socket.in(room).emit('stop_typing', { room, userId });
  });

  socket.on('new_message', (newMessageReceived) => {
    const conversation = newMessageReceived.conversation;
    if (!conversation || !conversation.participants) return;

    conversation.participants.forEach((user) => {
      const uId = user._id || user;
      if (uId.toString() === newMessageReceived.sender._id.toString()) return;

      socket.in(uId.toString()).emit('message_received', newMessageReceived);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket:', socket.id);
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
    // Broadcast updated active online users list
    io.emit('online_users', Array.from(activeUsers.keys()));
  });
});