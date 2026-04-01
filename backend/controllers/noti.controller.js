const db = require('../config/db');

// Lấy danh sách thông báo của user đang đăng nhập
exports.getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT id, type, message, metadata, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const notifications = rows.map(n => {
  let parsedMetadata = {};
  try {
    if (typeof n.metadata === 'string') {
      parsedMetadata = JSON.parse(n.metadata);
    } else {
      parsedMetadata = n.metadata || {};
    }
  } catch (e) {
    console.warn(' Metadata không hợp lệ:', n.metadata);
  }

  return {
    id: n.id,
    type: n.type,
    message: n.message,
    metadata: parsedMetadata,
    is_read: n.is_read,
    created_at: n.created_at
  };
});

console.log(' Notifications trả về:', notifications);


    res.json({
      success: true,
      notifications
    });

  } catch (err) {
    console.error('❌ Lỗi khi lấy notifications:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Xoá một thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Thông báo không tồn tại hoặc không thuộc về bạn.' });
    }

    await db.query('DELETE FROM notifications WHERE id = ?', [notificationId]);

    res.json({ message: 'Đã xóa thông báo.' });
  } catch (err) {
    console.error('Lỗi xóa thông báo:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa thông báo.' });
  }
};

// Xoá tất cả thông báo
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query('DELETE FROM notifications WHERE user_id = ?', [userId]);

    res.json({ message: 'Đã xóa tất cả thông báo.' });
  } catch (err) {
    console.error('Lỗi xóa tất cả thông báo:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa tất cả thông báo.' });
  }
};


// Đánh dấu tất cả là đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    res.json({ success: true, message: 'Tất cả thông báo đã được đánh dấu là đã đọc.' });
  } catch (err) {
    console.error('Lỗi cập nhật thông báo:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

