const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/noti.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Lấy danh sách thông báo
router.get('/', verifyToken, notificationController.getNotifications);
// Xoá một thông báo
router.delete('/:id', verifyToken, notificationController.deleteNotification);
// Xoá tất cả thông báo
router.delete('/', verifyToken, notificationController.deleteAllNotifications);
// Đánh dấu tất cả thông báo là đã đọc
router.put('/markAllAsRead', verifyToken, notificationController.markAllAsRead);

module.exports = router;
