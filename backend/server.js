const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Connection', 'close');
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);


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
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  console.log(`Also try http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.log('Server startup error:', err.message);
});