const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Route này đang mount tại `/api/payments/webhook`, nên path ở đây chỉ là '/'
router.post(
  '/', // ✅ Đúng: Vì bạn đã mount từ ngoài vào
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('❌ Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Xử lý event Stripe
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('✅ checkout.session.completed:', event.data.object.id);
        break;
      case 'payment_intent.succeeded':
        console.log('✅ payment_intent.succeeded:', event.data.object.id);
        break;
      default:
        console.log(`📌 Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
