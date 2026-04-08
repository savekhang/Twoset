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
router.put("/update-profile", verifyToken, userController.updateProfile);
router.post('/add-album-photo', verifyToken, userController.addPhoto)
router.get("/random", verifyToken, userController.getRandomUser);
router.get("/swipe-premium", verifyToken, userController.getPremiumMatches);
router.get('/popular', verifyToken, userController.getPopularUsers);
router.post("/upload-avatar", userController.updateAvatarNoToken);


module.exports = router;
