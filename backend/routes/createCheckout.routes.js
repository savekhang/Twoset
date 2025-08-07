// File: routes/createCheckout.routes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const verifyToken = require('../middlewares/auth.middleware');
const db = require('../config/db');

// 1️⃣ Tạo checkout session
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tài khoản Premium',
              description: 'Nâng cấp tài khoản Premium cho TwoSet App',
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
      success_url: 'twoset://checkout-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'twoset://checkout-cancel',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Lỗi khi tạo checkout session:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2️⃣ Xác minh session từ frontend deeplink
router.post('/verify-session', async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const userId = session.metadata.userId;

    // Kiểm tra user có tồn tại không
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    // Cập nhật premium
    await db.query('UPDATE users SET is_premium = 1 WHERE id = ?', [userId]);

    // Ghi log thanh toán
    await db.query(
      'INSERT INTO payments (user_id, amount, order_id, transaction_no, pay_date, status) VALUES (?, ?, ?, ?, NOW(), ?)',
      [userId, 1.00, session.id, session.payment_intent, 'success']
    );

    // Cập nhật super_like_usage
    await db.query('UPDATE super_like_usage SET count = NULL WHERE user_id = ?', [userId]);

    // Gửi thông báo
    await db.query(
      'INSERT INTO notifications (user_id, message, type, metadata) VALUES (?, ?, ?, ?)',
      [
        userId,
        'Tài khoản của bạn đã được nâng cấp lên Premium 🎉',
        'system',
        JSON.stringify({ type: 'premium_upgrade' })
      ]
    );

    console.log('✅ Xác minh thành công cho userId:', userId);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi verify session:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
