const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');
const { sendNotification } = require('../utils/notification');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8081';

exports.createStripeSession = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID from token' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Twoset Premium Account' },
          unit_amount: 100, // $1.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment-cancelled`,
      metadata: { userId: userId.toString() },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Lỗi tạo Stripe session:', err);
    res.status(500).json({ error: 'Could not create Stripe session' });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = parseInt(session.metadata.userId);

    try {
      // Cập nhật user thành premium
      await db.execute('UPDATE users SET is_premium = 1 WHERE id = ?', [userId]);

      // Gửi thông báo nâng cấp
      await sendNotification(userId, 'Bạn đã nâng cấp tài khoản Premium thành công!', 'system');

      // Ghi lịch sử thanh toán
      await db.execute(`
        INSERT INTO payments (user_id, amount, status, method)
        VALUES (?, ?, ?, ?)`,
        [userId, 1.0, 'success', 'stripe']
      );

      console.log(`✅ Premium upgraded for user ${userId}`);
    } catch (err) {
      console.error('❌ Error updating user after payment:', err.message);
    }
  }

  res.json({ received: true });
};
