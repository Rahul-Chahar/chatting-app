// controllers/messageController.js
const db = require('../models');

// controllers/messageController.js - Updated getGroupMessages
// controllers/messageController.js
exports.getGroupMessages = async (req, res) => {
  const groupId = req.params.groupId;
  if (!groupId) {
    return res.status(400).json({ message: 'Group ID is required.' });
  }
  try {
    const messages = await db.GroupMessage.findAll({
      where: { groupId },
      include: [{
        model: db.User,
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'senderId', 'message', 'createdAt']
    });

    return res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching group messages:", err);
    return res.status(500).json({ message: 'Server error retrieving messages.' });
  }
};
exports.sendGroupMessage = async (req, res) => {
  const groupId = req.params.groupId;
  const { senderId, message } = req.body;
  if (!senderId || !message) {
    return res.status(400).json({ message: 'Sender ID and message are required.' });
  }
  try {
    const newMessage = await db.GroupMessage.create({ groupId, senderId, message });
    // You can emit the message via Socket.io from the socket controller instead.
    return res.status(201).json({ message: 'Message stored successfully.', data: newMessage });
  } catch (err) {
    console.error("Error storing group message:", err);
    return res.status(500).json({ message: 'Server error storing message.' });
  }
};
