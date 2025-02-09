// controllers/messageController.js
const db = require('../models');
const Message = db.Message;

exports.sendMessage = async (req, res) => {
  try {
    // Destructure the userId and message from the request body
    const { userId, message } = req.body;

    // Validate input
    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and message are required.' });
    }

    // Create and store the new message in the database
    const newMessage = await Message.create({ userId, message });

    return res.status(201).json({
      message: 'Message stored successfully.',
      data: newMessage
    });
  } catch (error) {
    console.error('Error storing message:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    // Retrieve all messages, ordered by creation time (oldest first)
    const messages = await Message.findAll({
      order: [['createdAt', 'ASC']]
    });
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return res.status(500).json({ message: 'Server error retrieving messages.' });
  }
};