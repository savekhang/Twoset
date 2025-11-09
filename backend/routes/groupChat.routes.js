const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const groupChatController = require('../controllers/groupChat.controller');

router.post('/create', verifyToken, groupChatController.createGroupChat);
router.post('/join', verifyToken, groupChatController.joinGroupChat);
router.get('/interest/:interest_id', verifyToken, groupChatController.getGroupChatsByInterest);
router.get('/messages/:chat_id', verifyToken, groupChatController.getGroupMessages);

module.exports = router;
