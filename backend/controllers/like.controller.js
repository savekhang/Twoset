const db = require('../config/db');
const { sendNotification } = require('../utils/notification');

exports.likeUser = async (req, res) => {
  const likerId = req.user.id;
  const { likedId } = req.body;

  if (likerId === likedId) {
    return res.status(400).json({ message: 'Bạn không thể like chính mình.' });
  }

  try {
    // Kiểm tra đã like chưa
    const [existingLike] = await db.query(
      'SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?',
      [likerId, likedId]
    );
    if (existingLike.length > 0) {
      return res.status(200).json({
        message: 'Bạn đã thả tim người này rồi. Bạn có muốn hủy tim?',
        alreadyLiked: true
      });
    }

    // Kiểm tra giới hạn nếu không phải tài khoản premium
      const [userRow] = await db.query('SELECT is_premium FROM users WHERE id = ?', [likerId]);
      const isPremium = userRow[0]?.is_premium == 1;

      if (!isPremium) {
        const today = new Date().toISOString().slice(0, 10);
        const [likeCountRows] = await db.query(
          'SELECT COUNT(*) AS count FROM likes WHERE liker_id = ? AND DATE(liked_at) = ?',
          [likerId, today]
        );
        if (likeCountRows[0].count >= 5) {
          return res.status(403).json({ message: 'Bạn đã đạt giới hạn 5 lượt like hôm nay.' });
        }
      }

    // Thêm like mới
    await db.query('INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)', [likerId, likedId]);

    // Kiểm tra nếu đối phương đã like lại (match)
    const [mutual] = await db.query(
      'SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?',
      [likedId, likerId]
    );

    if (mutual.length > 0) {
      // Ghi nhận match
      await db.query('INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)', [likerId, likedId]);

      // Gửi thông báo match cho cả hai
      await sendNotification(likedId, 'match', {}, likerId);
      await sendNotification(likerId, 'match', {}, likedId);

      return res.status(200).json({ message: 'Đã like và match thành công.', match: true });
    }

    // Nếu chưa match thì chỉ gửi thông báo like
    await sendNotification(likedId, 'like', {}, likerId);

    res.status(200).json({ message: 'Đã like thành công.', match: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
