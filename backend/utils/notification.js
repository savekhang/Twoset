const db = require('../config/db');

/**
 * Gửi thông báo tới 1 user
 * @param {number} userId - ID người nhận thông báo
 * @param {string} type - Loại thông báo ('like', 'match', 'unlike', 'system',...)
 * @param {object} metadata - Dữ liệu JSON để frontend dùng xử lý
 * @param {number} [fromUserId] - Người gửi (nếu có, dùng để lấy tên hiển thị)
 */
async function sendNotification(userId, type = 'system', metadata = {}, fromUserId = null) {
  let message = 'Bạn có thông báo mới.';

  try {
    let senderName = 'Một người dùng';

    if (fromUserId) {
      const [rows] = await db.query('SELECT name FROM users WHERE id = ?', [fromUserId]);
      if (rows.length > 0 && rows[0].name) {
        senderName = rows[0].name;
      } else {
        console.warn(`⚠️ Không tìm thấy tên người gửi với ID = ${fromUserId}`);
      }
    }

    // Tuỳ theo loại thông báo, định nghĩa nội dung và metadata phù hợp
    if (type === 'like' && fromUserId) {
      message = `Bạn đã được ${senderName} thả tim 💖.`;
      metadata.userId = metadata.userId || fromUserId;
      metadata.action = metadata.action || 'getUserProfile';
    } else if (type === 'match' && fromUserId) {
      message = `Bạn và ${senderName} đã match 💘. Hãy trò chuyện ngay!`;
      metadata.withUserId = fromUserId;
      metadata.action = metadata.action || 'openChat';
    } else if (type === 'unlike' && fromUserId) {
      message = `${senderName} đã hủy thả tim bạn.`;
      metadata.userId = metadata.userId || fromUserId;
      metadata.action = metadata.action || 'getUserProfile';
    }

    await db.query(
      'INSERT INTO notifications (user_id, type, message, metadata) VALUES (?, ?, ?, ?)',
      [userId, type, message, JSON.stringify(metadata)]
    );

    console.log(`✅ Đã gửi thông báo ${type} tới user ${userId}`);
  } catch (error) {
    console.error('Lỗi gửi thông báo:', error);
  }
}

module.exports = { sendNotification };
