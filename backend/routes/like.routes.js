const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/like', verifyToken, likeController.likeUser);
//router.delete('/unlike/:likedUserId', verifyToken, likeController.unlikeUser);

module.exports = router;
