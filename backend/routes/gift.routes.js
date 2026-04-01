const express = require("express");
const router = express.Router();

const controller = require("../controllers/giftController");
const verifyToken = require("../middlewares/auth.middleware");

router.get("/coins", verifyToken, controller.getCoinBalance);

router.post("/checkin", verifyToken, controller.dailyCheckin);

router.get("/gifts", verifyToken, controller.getGifts);

router.post("/send-gift", verifyToken, controller.sendGift);

router.get("/received-gifts", verifyToken, controller.getReceivedGifts);

module.exports = router;                                                                                                                                        