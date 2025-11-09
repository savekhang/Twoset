const db = require('../config/db');
const bcrypt = require('bcrypt');

// 🔹 Tạo phòng chat (chỉ Premium)
exports.createGroupChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, interest_id, password } = req.body;

    const [[user]] = await db.query(`SELECT is_premium FROM users WHERE id = ?`, [userId]);
    if (!user || !user.is_premium)
      return res.status(403).json({ message: "Chỉ user Premium mới có thể tạo phòng." });

    // kiểm tra interest hợp lệ
    const [[interest]] = await db.query(`SELECT * FROM interests WHERE id = ?`, [interest_id]);
    if (!interest) return res.status(400).json({ message: "Chủ đề không hợp lệ" });

    const hashedPass = password ? await bcrypt.hash(password, 10) : null;

    const [result] = await db.query(
      `INSERT INTO group_chats (name, created_by, interest_id, password) VALUES (?, ?, ?, ?)`,
      [name, userId, interest_id, hashedPass]
    );

    await db.query(
      `INSERT INTO group_chat_members (chat_id, user_id) VALUES (?, ?)`,
      [result.insertId, userId]
    );

    res.json({
      message: "Tạo phòng thành công",
      chat_id: result.insertId,
      name,
      interest_id,
    });
  } catch (err) {
    console.error("Create group chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Tham gia phòng (có thể có mật khẩu)
exports.joinGroupChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chat_id, password } = req.body;

    const [[chat]] = await db.query(
      `SELECT id, password, interest_id FROM group_chats WHERE id = ?`,
      [chat_id]
    );
    if (!chat) return res.status(404).json({ message: "Phòng không tồn tại" });

    // chỉ user có cùng sở thích mới được vào
    const [[hasInterest]] = await db.query(
      `SELECT 1 FROM user_interests WHERE user_id = ? AND interest_id = ?`,
      [userId, chat.interest_id]
    );
    if (!hasInterest) return res.status(403).json({ message: "Bạn không có sở thích này nên không thể tham gia." });

    // nếu có mật khẩu
    if (chat.password) {
      const match = await bcrypt.compare(password || "", chat.password);
      if (!match) return res.status(401).json({ message: "Sai mật khẩu phòng." });
    }

    await db.query(
      `INSERT IGNORE INTO group_chat_members (chat_id, user_id) VALUES (?, ?)`,
      [chat_id, userId]
    );

    res.json({ message: "Tham gia phòng thành công" });
  } catch (err) {
    console.error("Join group chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Lấy danh sách phòng theo sở thích
exports.getGroupChatsByInterest = async (req, res) => {
  try {
    const { interest_id } = req.params;
    const [rooms] = await db.query(
      `SELECT gc.id, gc.name, gc.created_at, u.name AS creator_name
       FROM group_chats gc
       JOIN users u ON gc.created_by = u.id
       WHERE gc.interest_id = ?`,
      [interest_id]
    );
    res.json({ rooms });
  } catch (err) {
    console.error("Get group chats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Lấy tin nhắn trong phòng
exports.getGroupMessages = async (req, res) => {
  try {
    const { chat_id } = req.params;
    const [messages] = await db.query(
      `SELECT gm.id, gm.content, gm.sent_at, u.name AS sender_name, u.avatar_url
       FROM group_messages gm
       JOIN users u ON gm.sender_id = u.id
       WHERE gm.chat_id = ?
       ORDER BY gm.sent_at ASC`,
      [chat_id]
    );
    res.json({ messages });
  } catch (err) {
    console.error("Get group messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
