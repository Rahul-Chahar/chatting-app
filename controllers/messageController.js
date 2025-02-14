const db = require('../models');
const multer = require('multer');
const s3 = require('../utils/s3Config');
const { v4: uuidv4 } = require('uuid');

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
}).single('file');

// Helper function for S3 upload
const uploadToS3 = async (file) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `uploads/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      url: result.Location,
      fileName: file.originalname,
      fileType: file.mimetype
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('File upload failed');
  }
};

// controllers/messageController.js - Updated getGroupMessages
// controllers/messageController.js
exports.sendGroupMessage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const groupId = req.params.groupId;
    const { message } = req.body;
    const senderId = req.user.id;

    try {
      let fileData = null;
      if (req.file) {
        fileData = await uploadToS3(req.file);
      }

      if (!message && !req.file) {
        return res.status(400).json({ message: 'Message or file is required' });
      }

      const newMessage = await db.GroupMessage.create({
        groupId,
        senderId,
        message: message || null,
        fileUrl: fileData?.url || null,
        fileType: fileData?.fileType || null,
        fileName: fileData?.fileName || null
      });

      // Include sender information in response
      const messageWithUser = await db.GroupMessage.findOne({
        where: { id: newMessage.id },
        include: [{
          model: db.User,
          attributes: ['id', 'name']
        }]
      });

      // Emit socket event
      req.app.get('io').to(`group_${groupId}`).emit('newGroupMessage', messageWithUser);

      return res.status(201).json({
        message: 'Message sent successfully',
        data: messageWithUser
      });
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ message: 'Server error sending message' });
    }
  });
};


// Get messages for a group
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