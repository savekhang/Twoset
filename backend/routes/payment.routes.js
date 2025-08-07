const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Tạo session Stripe
router.post('/stripe/create-session', verifyToken, paymentController.createStripeSession);

// Webhook Stripe callback
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

module.exports = router;
