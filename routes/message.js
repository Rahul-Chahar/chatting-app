// routes/message.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');

// Send a message (POST) and get conversation (GET)
router.post('/messages', authMiddleware, messageController.sendMessage);
router.get('/messages', authMiddleware, messageController.getMessages);

module.exports = router;
