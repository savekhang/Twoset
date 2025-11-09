require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const db = require('./config/db'); // ✅ Import kết nối MySQL

const app = express();
const server = http.createServer(app);

// ✅ Stripe webhook raw parser phải đặt TRƯỚC express.json()
app.post(
  '/api/payment/stripe/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/payment.controller').handleWebhook
);

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/like', require('./routes/like.routes'));
app.use('/api/noti', require('./routes/noti.routes'));
app.use('/api/mess', require('./routes/message.routes'));
app.use('/api', require('./routes/common.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/qr', require('./routes/vietqr.routes'));

// Cấu hình Socket.IO
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Map lưu userId -> socketId
let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // User đăng nhập -> map userId với socketId
  socket.on('registerUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} online as ${socket.id}`);
  });

  // Gửi tin nhắn
  socket.on("sendMessage", async (data) => {
    try {
      const { match_id, sender_id, receiver_id, content } = data;

      if (!match_id || !sender_id || !receiver_id || !content) {
        console.warn("⚠️ Thiếu dữ liệu gửi tin nhắn:", data);
        return;
      }

      // Lưu tin nhắn vào DB
      const [result] = await db.query(
        `INSERT INTO messages (match_id, sender_id, receiver_id, content, sent_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [match_id, sender_id, receiver_id, content]
      );

      // Lấy tin nhắn vừa lưu
      const [newMsg] = await db.query(
        `SELECT * FROM messages WHERE id = ?`,
        [result.insertId]
      );

      const message = newMsg[0];

      // Chỉ gửi realtime cho receiver nếu online
      const receiverSocket = onlineUsers.get(receiver_id);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", message);
        console.log(`💬 Realtime sent: ${sender_id} → ${receiver_id}: ${content}`);
      } else {
        console.log(`💾 Receiver ${receiver_id} offline. Tin nhắn lưu DB: ${content}`);
      }

    } catch (err) {
      console.error("❌ Lỗi khi xử lý tin nhắn:", err);
    }
  });

  // ✅ User tham gia phòng nhóm
  socket.on('joinGroup', async ({ chat_id, user_id }) => {
    try {
      socket.join(`group_${chat_id}`);
      console.log(`👥 User ${user_id} joined group_${chat_id}`);
    } catch (err) {
      console.error('❌ Lỗi joinGroup:', err);
    }
  });

  // ✅ Gửi tin nhắn nhóm
  socket.on('sendGroupMessage', async (data) => {
    try {
      const { chat_id, sender_id, content } = data;
      if (!chat_id || !sender_id || !content) return;

      // Lưu vào DB
      const [result] = await db.query(
        `INSERT INTO group_messages (chat_id, sender_id, content, sent_at)
         VALUES (?, ?, ?, NOW())`,
        [chat_id, sender_id, content]
      );

      // Lấy tin nhắn vừa lưu kèm thông tin người gửi
      const [[newMsg]] = await db.query(
        `SELECT gm.id, gm.chat_id, gm.content, gm.sent_at,
                u.id AS sender_id, u.name AS sender_name, u.avatar_url
         FROM group_messages gm
         JOIN users u ON gm.sender_id = u.id
         WHERE gm.id = ?`,
        [result.insertId]
      );

      // Gửi realtime tới tất cả thành viên trong phòng
      io.to(`group_${chat_id}`).emit('receiveGroupMessage', newMsg);
      console.log(`📢 Group ${chat_id}: ${newMsg.sender_name} → ${content}`);
    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn nhóm:', err);
    }
  });

  // User ngắt kết nối
  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`🔴 User ${userId} disconnected`);
        break;
      }
    }
  });
});

// ✅ Chạy server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
