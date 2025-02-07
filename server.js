// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // For proper CORS handling
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS with proper configuration
app.use(cors({
  origin: "http://localhost:3000", // Adjust as needed for your deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (adjust the URI as needed)
mongoose
  .connect('mongodb://localhost:27017/chatapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Serve static HTML files from the views directory
app.use(express.static(path.join(__dirname, 'views')));

// Use the authentication routes for handling signup and login
app.use('/', authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
