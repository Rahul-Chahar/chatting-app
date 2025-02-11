// server.js

// Load environment variables from .env file
require('dotenv').config();

// Import required modules.
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const socketIo = require('socket.io');

// Import the database (Sequelize instance and models)
const db = require('./models');

// Import authentication middleware
const authenticate = require('./middleware/auth');

// Import routes.
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/group');
const messageRoutes = require('./routes/message');
const groupMemberRoutes = require('./routes/groupMember');

// Create an Express application.
const app = express();

// Create an HTTP server.
const server = http.createServer(app);

// Initialize Socket.io and pass the HTTP server.
const io = socketIo(server, {
  cors: { origin: '*' } // Adjust for production as needed.
});

// Middleware configuration.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'views' folder.
app.use(express.static(path.join(__dirname, 'views')));

// Mount API routes under the '/api' prefix.
app.use('/api/auth', authRoutes);           // For signup and login.
app.use('/api/groups', groupRoutes);          // For creating groups and fetching user groups.
app.use('/api/messages', messageRoutes);      // For group messages.
app.use('/api/groupMembers', groupMemberRoutes); // For managing group membership (invite, promote, remove, get members).

// Initialize Socket.io event handling via the socketController.
// Ensure that 'socketController.js' exports a function that accepts the io instance.
const socketController = require('./controllers/socketController');
socketController(io);

// Start the server after syncing the database.
db.sequelize.sync().then(() => {
  console.log("Database synced successfully.");
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => console.error("Database sync error:", err));
