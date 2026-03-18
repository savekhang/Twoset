const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

/**
 * Tạo Stripe Checkout Session
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const amount = 4.99; // USD

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Twoset Premium Upgrade' },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL_WEB}/success.html`,
      cancel_url: `${process.env.FRONTEND_URL_WEB}/cancel.html`,
      metadata: { userId: req.user.id },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ createCheckoutSession error:', error);
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
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('🔔 checkout.session.completed event:', session);

    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('❌ userId missing in metadata');
      return res.sendStatus(400);
    }

    try {
      // 1️⃣ Upgrade user
      await db.query('UPDATE users SET is_premium = 1 WHERE id = ?', [userId]);
      console.log(`[DB] users updated for user ${userId}`);

      // 2️⃣ Unlimited super_like_usage
      await db.query('UPDATE super_like_usage SET count = NULL WHERE user_id = ?', [userId]);
      console.log(`[DB] super_like_usage updated for user ${userId}`);

      // 3️⃣ Insert payment record
      await db.query(
        'INSERT INTO payments (user_id, amount, order_id, transaction_no, pay_date, status) VALUES (?, ?, ?, ?, NOW(), ?)',
        [userId, session.amount_total / 100, session.id, session.payment_intent, 'success']
      );
      console.log(`[DB] payment record inserted for user ${userId}`);

      // 4️⃣ Insert notification
      await db.query(
        'INSERT INTO notifications (user_id, message, type, metadata, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
        [
          userId,
          'Bạn đã nâng cấp tài khoản Premium thành công! 🎉',
          'system',
          JSON.stringify({ plan: 'premium', amount: session.amount_total / 100 }),
        ]
      );
      console.log(`[DB] notification inserted for user ${userId}`);

      console.log(`✅ Premium upgrade processed successfully for user ${userId}`);
    } catch (dbErr) {
      console.error('❌ DB error:', dbErr);
      return res.sendStatus(500);
    }
  } else {
    console.log(`📌 Unhandled event type: ${event.type}`);
  }

  res.sendStatus(200);
};
