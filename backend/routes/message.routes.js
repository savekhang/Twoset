// routes/messages.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.get('/conversations', verifyToken, messageController.getConversations);
router.get('/with/:userId', verifyToken, messageController.getMessagesWithUser);

module.exports = router;