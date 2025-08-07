const db = require('../config/db');

exports.getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT 
        m2.id AS message_id,
        m2.content AS last_message,
        m2.sent_at,
        u.id AS user_id,
        u.name,
        u.avatar_url
      FROM matches AS mt
      JOIN users AS u ON (u.id = IF(mt.user1_id = ?, mt.user2_id, mt.user1_id))
      LEFT JOIN (
        SELECT m1.*
        FROM messages m1
        INNER JOIN (
          SELECT match_id, MAX(sent_at) AS last_time
          FROM messages
          GROUP BY match_id
        ) latest ON m1.match_id = latest.match_id AND m1.sent_at = latest.last_time
      ) m2 ON m2.match_id = mt.id
      WHERE mt.user1_id = ? OR mt.user2_id = ?
      ORDER BY m2.sent_at DESC
    `, [userId, userId, userId]);

    res.json({ success: true, conversations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách trò chuyện.' });
  }
};

// Xem chi tiết tin nhắn với 1 user cụ thể
exports.getMessagesWithUser = async (req, res) => {
  const userId = req.user.id;
  const otherUserId = parseInt(req.params.userId);

  try {
    const [match] = await db.query(`
      SELECT id FROM matches
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `, [userId, otherUserId, otherUserId, userId]);

    if (match.length === 0) {
      return res.status(404).json({ message: 'Không có cuộc trò chuyện nào.' });
    }

    const matchId = match[0].id;

    const [messages] = await db.query(`
      SELECT 
        id, sender_id, content, sent_at
      FROM messages
      WHERE match_id = ?
      ORDER BY sent_at ASC
    `, [matchId]);

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy tin nhắn.' });
  }
};

// send message Socket.IO
exports.sendMessage = async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Lưu vào CSDL
    const [result] = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, content, sent_at) VALUES (?, ?, ?, NOW())',
      [sender_id, receiver_id, content]
    );

    const message = {
      id: result.insertId,
      sender_id,
      receiver_id,
      content,
      sent_at: new Date().toISOString()
    };

    // Gửi qua socket nếu người nhận online
    const receiverSocketId = global.onlineUsers.get(receiver_id);
    if (receiverSocketId) {
      global._io.to(receiverSocketId).emit('new_message', message);
    }

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};