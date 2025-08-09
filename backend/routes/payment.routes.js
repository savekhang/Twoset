const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/payment.controller');
const VerifyToken = require('../middlewares/auth.middleware');

// Chỉ user đã đăng nhập mới tạo session thanh toán
router.post('/stripe/create-session', VerifyToken, createCheckoutSession);

module.exports = router;
