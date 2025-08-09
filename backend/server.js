require('dotenv').config();
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Stripe webhook raw parser phải đặt TRƯỚC express.json()
app.post(
  '/api/payment/stripe/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/payment.controller').handleWebhook
);

// Middleware parse JSON cho các route còn lại
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/like', require('./routes/like.routes'));
app.use('/api/noti', require('./routes/noti.routes'));
app.use('/api/mess', require('./routes/message.routes'));
app.use('/api', require('./routes/common.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/qr', require('./routes/vietqr.routes'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
