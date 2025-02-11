// controllers/groupMemberController.js
const db = require('../models');

exports.getGroupMembers = async (req, res) => {
  const groupId = req.params.groupId;
  if (!groupId) {
    return res.status(400).json({ message: 'Group ID is required.' });
  }
  try {
    const members = await db.GroupMember.findAll({
      where: { groupId },
      include: [{
        model: db.User,
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });
    return res.status(200).json({ members });
  } catch (err) {
    console.error("Error fetching group members:", err);
    return res.status(500).json({ message: 'Server error fetching group members.' });
  }
};

exports.inviteMember = async (req, res) => {
  const groupId = req.params.groupId;
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required for invitation.' });
  }
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User with this email not found.' });
    }
    const existing = await db.GroupMember.findOne({ where: { groupId, userId: user.id } });
    if (existing) {
      return res.status(409).json({ message: 'User is already a member of the group.' });
    }
    const member = await db.GroupMember.create({ groupId, userId: user.id, role: 'member' });
    console.log("User invited successfully:", member.toJSON());
    return res.status(201).json({ message: 'User invited successfully.', member });
  } catch (error) {
    console.error("Error inviting user:", error);
    return res.status(500).json({ message: 'Server error inviting user.' });
  }
};

exports.promoteMember = async (req, res) => {
  const groupId = req.params.groupId;
  const targetUserId = parseInt(req.params.userId, 10);
  const currentUserId = req.user.id; // set by authentication middleware

  try {
    const requesterRecord = await db.GroupMember.findOne({ where: { groupId, userId: currentUserId } });
    if (!requesterRecord || requesterRecord.role !== 'admin') {
      return res.status(403).json({ message: 'Only group admins can promote members.' });
    }
    const targetRecord = await db.GroupMember.findOne({ where: { groupId, userId: targetUserId } });
    if (!targetRecord) {
      return res.status(404).json({ message: 'User is not a member of the group.' });
    }
    if (targetRecord.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin.' });
    }
    targetRecord.role = 'admin';
    await targetRecord.save();
    console.log(`User ${targetUserId} promoted to admin in group ${groupId}.`);
    return res.status(200).json({ message: 'Member promoted to admin successfully.' });
  } catch (error) {
    console.error("Error promoting member:", error);
    return res.status(500).json({ message: 'Server error promoting member.' });
  }
};

exports.removeMember = async (req, res) => {
  const groupId = req.params.groupId;
  const targetUserId = parseInt(req.params.userId, 10);
  const currentUserId = req.user.id;
  try {
    const requesterRecord = await db.GroupMember.findOne({ where: { groupId, userId: currentUserId } });
    if (!requesterRecord || requesterRecord.role !== 'admin') {
      return res.status(403).json({ message: 'Only group admins can remove members.' });
    }
    const targetRecord = await db.GroupMember.findOne({ where: { groupId, userId: targetUserId } });
    if (!targetRecord) {
      return res.status(404).json({ message: 'User is not a member of the group.' });
    }
    if (targetRecord.role === 'admin') {
      return res.status(400).json({ message: 'Cannot remove an admin.' });
    }
    await targetRecord.destroy();
    console.log(`User ${targetUserId} removed from group ${groupId} by admin ${currentUserId}.`);
    return res.status(200).json({ message: 'Member removed from the group successfully.' });
  } catch (error) {
    console.error("Error removing member:", error);
    return res.status(500).json({ message: 'Server error removing member.' });
  }
};

exports.verifyMembership = async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;

  try {
    const member = await db.GroupMember.findOne({
      where: { groupId, userId }
    });

    if (!member) {
      return res.status(404).json({ message: 'User is not a member of this group.' });
    }

    return res.status(200).json({ role: member.role });
  } catch (error) {
    console.error("Error verifying membership:", error);
    return res.status(500).json({ message: 'Server error verifying membership.' });
  }
};

