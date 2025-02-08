// routes/message.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// POST /messages endpoint to store a new chat message
router.post('/messages', messageController.sendMessage);

module.exports = router;
