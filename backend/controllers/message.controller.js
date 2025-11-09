// controllers/message.controller.js
const db = require("../config/db");

// ✅ Lấy danh sách các cuộc trò chuyện (match list)
exports.getMatchList = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        m.id AS match_id,
        CASE 
          WHEN m.user1_id = ? THEN m.user2_id 
          ELSE m.user1_id 
        END AS partner_id,
        u.name AS partner_name,
        u.avatar_url AS partner_avatar,
        (
          SELECT content 
          FROM messages 
          WHERE match_id = m.id 
          ORDER BY sent_at DESC 
          LIMIT 1
        ) AS last_message,
        (
          SELECT sent_at 
          FROM messages 
          WHERE match_id = m.id 
          ORDER BY sent_at DESC 
          LIMIT 1
        ) AS last_time
      FROM matches m
      JOIN users u 
        ON u.id = CASE 
          WHEN m.user1_id = ? THEN m.user2_id 
          ELSE m.user1_id 
        END
      WHERE (m.user1_id = ? OR m.user2_id = ?)
      ORDER BY last_time DESC;
      `,
      [userId, userId, userId, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy tin nhắn:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách tin nhắn" });
  }
};

// ✅ Lấy tin nhắn trong 1 match cụ thể
exports.getMessagesByMatch = async (req, res) => {
  try {
    const { match_id } = req.params;

    const [messages] = await db.query(
      `
      SELECT 
        m.*, 
        u.name AS sender_name, 
        u.avatar_url AS sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.match_id = ?
      ORDER BY m.sent_at ASC
      `,
      [match_id]
    );

    res.json({ messages });
  } catch (error) {
    console.error("❌ Lỗi khi lấy tin nhắn:", error);
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn" });
  }
};

// ✅ Gửi tin nhắn mới (qua HTTP, không socket)
exports.sendMessage = async (req, res) => {
  try {
    const { match_id, sender_id, receiver_id, content } = req.body;
    console.log("📤 Gửi tin nhắn:", req.body);

    if (!match_id || !sender_id || !receiver_id || !content)
      return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc" });

    const [result] = await db.query(
      `INSERT INTO messages (match_id, sender_id, receiver_id, content, sent_at) VALUES (?, ?, ?, ?, NOW())`,
      [match_id, sender_id, receiver_id, content]
    );

    const [newMsg] = await db.query("SELECT * FROM messages WHERE id = ?", [
      result.insertId,
    ]);

    console.log("✅ Tin nhắn đã lưu:", newMsg[0]);
    return res.status(201).json({ message: newMsg[0] });
  } catch (error) {
    console.error("❌ Lỗi khi gửi tin nhắn (chi tiết):", error);
    res.status(500).json({ error: error.message || "Lỗi khi gửi tin nhắn" });
  }
};

