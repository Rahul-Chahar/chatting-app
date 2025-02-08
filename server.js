// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS with modern configuration
app.use(cors({
  origin: "*", // Adjust as needed for your environment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HTML files from the 'views' directory
app.use(express.static(path.join(__dirname, 'views')));

// Use your authentication and message routes
app.use('/', authRoutes);
app.use('/', messageRoutes);

// Sync the Sequelize models with the database and start the server
db.sequelize.sync()
  .then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });
