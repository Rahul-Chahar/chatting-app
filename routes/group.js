// routes/group.js
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authenticate = require('../middleware/auth');

router.post('/', authenticate, groupController.createGroup);
router.get('/', authenticate, groupController.getUserGroups);

module.exports = router;
