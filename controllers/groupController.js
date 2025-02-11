// controllers/groupController.js
const db = require('../models');

exports.createGroup = async (req, res) => {
  const { name, createdBy } = req.body;
  if (!name || !createdBy) {
    return res.status(400).json({ message: 'Group name and createdBy are required.' });
  }
  try {
    const group = await db.Group.create({ name, createdBy });
    // Automatically add the creator as an admin.
    await db.GroupMember.create({ userId: createdBy, groupId: group.id, role: 'admin' });
    return res.status(201).json({ message: 'Group created successfully.', group });
  } catch (err) {
    console.error("Error creating group:", err);
    return res.status(500).json({ message: 'Server error creating group.' });
  }
};

exports.getUserGroups = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }
  try {
    const groups = await db.Group.findAll({
      include: [{
        model: db.User,
        where: { id: userId },
        through: { attributes: [] }
      }],
      attributes: ['id', 'name']
    });
    return res.status(200).json({ groups });
  } catch (err) {
    console.error("Error fetching groups:", err);
    return res.status(500).json({ message: 'Server error retrieving groups.' });
  }
};
