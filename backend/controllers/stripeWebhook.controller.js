const db = require('../config/db');
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('❌ Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customer_email = session.customer_email;

      try {
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [customer_email]);
        if (!user) {
          console.log(`❌ Không tìm thấy user với email ${customer_email}`);
          return res.status(404).send('User not found');
        }

        const userId = user.id;

        // 1. Cập nhật tài khoản premium
        await db.query('UPDATE users SET is_premium = 1 WHERE id = ?', [userId]);

        // 2. Ghi vào bảng payments
        await db.query(
          'INSERT INTO payments (user_id, amount, order_id, transaction_no, pay_date, status) VALUES (?, ?, ?, ?, NOW(), ?)',
          [userId, 1.00, session.id, session.payment_intent, 'success']
        );

        // 3. Cập nhật super_like_usage (vô hạn: NULL hoặc -1 tùy logic)
        await db.query(
          `UPDATE super_like_usage SET count = NULL WHERE user_id = ?`,
          [userId]
        );

        // 4. Tạo thông báo nâng cấp
        await db.query(
          `INSERT INTO notifications (user_id, message, type, metadata) VALUES (?, ?, ?, ?)`,
          [
            userId,
            'Tài khoản của bạn đã được nâng cấp lên Premium 🎉',
            'system',
            JSON.stringify({ type: 'premium_upgrade' })
          ]
        );

        console.log('✅ Đã xử lý nâng cấp Premium cho:', customer_email);
      } catch (err) {
        console.error('❌ Lỗi xử lý webhook:', err);
        return res.status(500).send('Internal Server Error');
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
