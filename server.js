// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./models'); // Contains User and GroupMessage models

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' } // Adjust for production
});

// Middleware setup.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

/* ============================
   SIGNUP ENDPOINT
============================ */
// In server.js, within your /signup endpoint
app.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Name, email, password, and phone are required.' });
  }
  try {
    // Check if user exists.
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    // Hash the password.
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the new user, including the phone.
    await db.User.create({ name, email, password: hashedPassword, phone });
    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: 'Server error during signup.' });
  }
});


/* ============================
   LOGIN ENDPOINT
============================ */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid password.' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return res.status(200).json({ token, userId: user.id });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

/* ============================
   GROUP CHAT ENDPOINTS
============================ */
// Get all messages for a group.
app.get('/groupMessages', async (req, res) => {
  const groupId = req.query.groupId;
  if (!groupId) {
    return res.status(400).json({ message: 'groupId is required.' });
  }
  try {
    const messages = await db.GroupMessage.findAll({
      where: { groupId },
      order: [['createdAt', 'ASC']]
    });
    console.log(`Fetched ${messages.length} messages for group ${groupId}`);
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return res.status(500).json({ message: 'Server error retrieving messages.' });
  }
});

// Save a new group message.
app.post('/groupMessages', async (req, res) => {
  const { senderId, groupId, message } = req.body;
  if (!senderId || !groupId || !message) {
    return res.status(400).json({ message: 'senderId, groupId, and message are required.' });
  }
  try {
    const newMessage = await db.GroupMessage.create({ senderId, groupId, message });
    console.log("Stored group message:", newMessage.toJSON());
    // Emit the new message to all clients in the group.
    io.to(`group_${groupId}`).emit('newGroupMessage', newMessage);
    return res.status(201).json({ message: 'Message stored successfully.', data: newMessage });
  } catch (error) {
    console.error("Error storing group message:", error);
    return res.status(500).json({ message: 'Server error storing message.' });
  }
});

/* ============================
   SOCKET.IO REAL-TIME MESSAGING
============================ */
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Client joins a group room.
  socket.on('joinGroup', (groupId) => {
    console.log(`Socket ${socket.id} joining group ${groupId}`);
    socket.join(`group_${groupId}`);
  });

  // Listen for messages sent via Socket.io.
  socket.on('sendGroupMessage', async (data) => {
    const { senderId, groupId, message } = data;
    try {
      const newMessage = await db.GroupMessage.create({ senderId, groupId, message });
      console.log("Socket.io stored group message:", newMessage.toJSON());
      io.to(`group_${groupId}`).emit('newGroupMessage', newMessage);
    } catch (error) {
      console.error("Socket.io error storing group message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

/* ============================
   START SERVER
============================ */
db.sequelize.sync().then(() => {
  console.log("Database synced successfully.");
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => console.error("Database sync error:", err));
