require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/payment.routes');
const paymentController = require('./controllers/payment.controller');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// Global Socket.IO
global._io = io;
global.onlineUsers = new Map();

// Import socket logic
require('./socket')(io, global.onlineUsers);

  app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);
  


// 2️⃣ Body parser (sau raw)
app.use(express.json());

// 3️⃣ Define all routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/like', require('./routes/like.routes'));
app.use('/api/noti', require('./routes/noti.routes'));
app.use('/api/mess', require('./routes/message.routes'));
app.use('/api', require('./routes/common.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/qr', require('./routes/vietqr.routes'));
app.use('/api/payments', paymentRoutes);

// 4️⃣ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server (HTTP + Socket.IO) running at http://localhost:${PORT}`);
});
