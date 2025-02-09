// controllers/messageController.js
const db = require('../models');
const { Op } = require('sequelize');
const Message = db.Message;

// POST /messages: Send a message
exports.sendMessage = async (req, res) => {
  try {
    // Use req.user.id (set by auth middleware) as senderId
    const senderId = req.user.id;
    const { receiverId, message } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver ID and message are required.' });
    }
    // Create and save the message
    const newMessage = await Message.create({ senderId, receiverId, message });
    return res.status(201).json({ message: 'Message stored successfully.', data: newMessage });
  } catch (error) {
    console.error('Error storing message:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /messages?partnerId=...
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = parseInt(req.query.partnerId, 10);
    if (!partnerId) {
      return res.status(400).json({ message: 'Partner ID is required.' });
    }
    // Retrieve messages where the conversation is between the logged-in user and the partner.
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return res.status(500).json({ message: 'Server error retrieving messages.' });
  }
};
