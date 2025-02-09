// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Needed for Socket.io
const jwt = require('jsonwebtoken');
const db = require('./models');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*", // Adjust for your deployment
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;

// CORS middleware configuration
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend HTML pages) from the "views" folder
app.use(express.static(path.join(__dirname, 'views')));

// Mount authentication and message routes
app.use('/', authRoutes);
app.use('/', messageRoutes);

// Socket.io middleware for JWT authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.user = decoded; // Attach user info to the socket object
      next();
    });
  } else {
    next(new Error("No token provided"));
  }
});

// Socket.io connection handling for real-time messaging
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name} (ID: ${socket.user.id})`);

  // Listen for incoming chat messages from clients
  socket.on('chatMessage', async (msg) => {
    try {
      // Save the new message in the database
      const dbMessage = await db.Message.create({
        userId: socket.user.id,
        message: msg,
      });

      // Broadcast the new message to all connected clients
      io.emit('newMessage', {
        id: dbMessage.id,
        userId: socket.user.id,
        message: dbMessage.message,
        createdAt: dbMessage.createdAt,
        user: {
          id: socket.user.id,
          name: socket.user.name,
        },
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.name}`);
  });
});

// Sync Sequelize models with the database, then start the server
db.sequelize.sync()
  .then(() => {
    console.log('Database synced successfully.');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });
