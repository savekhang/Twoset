const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.get('/users',verifyToken, userController.getUsers);
router.get('/profile', verifyToken, userController.getProfile);
router.post('/search', verifyToken, userController.searchUsers);
router.post('/nearby', verifyToken, userController.getNearbyUsers);
router.get('/userProfile/:id', verifyToken, userController.getUserProfile);
router.post('/update-avatar', verifyToken, userController.updateAvatar);
router.post('/add-album-photo', verifyToken, userController.addPhoto)

module.exports = router;
