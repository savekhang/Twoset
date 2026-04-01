// routes/message.routes.js
const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const messageController = require("../controllers/message.controller");

// Danh sách match
router.get("/match-list", verifyToken, messageController.getMatchList);

// Lấy tin nhắn theo match_id
router.get("/:match_id", verifyToken, messageController.getMessagesByMatch);

// Lấy AI suggestions cho match
router.get("/:match_id/suggestions", verifyToken, messageController.getMessageSuggestions);

// Gửi tin nhắn
router.post("/", verifyToken, messageController.sendMessage);

module.exports = router;
