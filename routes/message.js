// routes/message.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticate = require('../middleware/auth');

router.get('/:groupId/messages', authenticate, messageController.getGroupMessages);
router.post('/:groupId/messages', authenticate, messageController.sendGroupMessage);

module.exports = router;
