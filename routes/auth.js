// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /signup endpoint to register a new user
router.post('/signup', authController.signup);

// Login endpoint
router.post('/login', authController.login);

module.exports = router;
