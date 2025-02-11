// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// Signup endpoint
router.post('/signup', authController.signup);

// Login endpoint
router.post('/login', authController.login);

// Get user details endpoint
router.get('/user', authenticate, authController.getUser);

module.exports = router;
