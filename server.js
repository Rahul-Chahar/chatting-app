// server.js
require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models'); // Sequelize instance and models
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS with modern configuration.
app.use(cors({
  origin: "*", // Adjust as needed; you can restrict this to your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON and URL-encoded data.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HTML files from the 'views' directory.
app.use(express.static(path.join(__dirname, 'views')));

// Use the authentication routes.
app.use('/', authRoutes);

// Connect to MySQL and sync Sequelize models.
db.sequelize.sync()
  .then(() => {
    console.log('Database synced successfully.');
    // Start the Express server.
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });
