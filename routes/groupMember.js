// routes/groupMember.js
const express = require('express');
const router = express.Router();
const groupMemberController = require('../controllers/groupMemberController');
const authenticate = require('../middleware/auth');

router.get('/:groupId/members', authenticate, groupMemberController.getGroupMembers);
router.post('/:groupId/invite', authenticate, groupMemberController.inviteMember);
router.put('/:groupId/members/:userId/promote', authenticate, groupMemberController.promoteMember);
router.delete('/:groupId/members/:userId', authenticate, groupMemberController.removeMember);
router.get('/:groupId/verify-membership', authenticate, groupMemberController.verifyMembership);

module.exports = router;
