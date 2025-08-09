// controllers/payment.controller.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

/**
 * Tạo Stripe Checkout Session
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const amount = 4.99; // Giá cố định $4.99

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Twoset Premium Upgrade' },
            unit_amount: Math.round(amount * 100), // $4.99 = 499 cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL_WEB}/success.html`,
      cancel_url: `${process.env.FRONTEND_URL_WEB}/cancel.html`,
      metadata: {
        userId: req.user.id,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe createCheckoutSession error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Xử lý Stripe Webhook
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    try {
      // 1. Nâng cấp user thành Premium
      await db.query(
        'UPDATE users SET is_premium = 1 WHERE id = ?',
        [userId]
      );

      // 2. Xóa hoặc set NULL trong super_like_usage để không giới hạn
      await db.query(
        'UPDATE super_like_usage SET count = NULL WHERE user_id = ?',
        [userId]
      );

      // 3. Ghi vào bảng payments
      await db.query(
        'INSERT INTO payments (user_id, amount, status, created_at) VALUES (?, ?, ?, NOW())',
        [userId, 4.99, 'success']
      );

      // 4. Thêm thông báo vào bảng notifications (không dùng socket)
      await db.query(
                'INSERT INTO notifications (user_id, message, type, is_read, metadata, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [
                    userId,
                    'Bạn đã nâng cấp tài khoản Premium thành công!',
                    'system',
                    0,
                    JSON.stringify({ plan: 'premium', amount: 4.99 })
                ]
            );
            console.log(`[DB] Inserted premium upgrade notification for user ${userId}`);
    } catch (dbErr) {
      console.error('❌ Lỗi cập nhật DB:', dbErr);
    }
  }

  res.sendStatus(200);
};
