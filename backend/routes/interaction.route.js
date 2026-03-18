const express = require("express");
const router = express.Router();
const interactionController = require("../controllers/interaction.controller");
const verifyToken = require('../middlewares/auth.middleware');

router.get("/history", verifyToken, interactionController.getHistory);

module.exports = router;
