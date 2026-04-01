const db = require('../config/db');
const { sendNotification } = require('../utils/notification');
const { generateMessageSuggestions } = require('../utils/aiSuggestion');
const ai = require('../utils/aiSuggestion');
console.log("🔥 AI MODULE:", ai);
// 🔍 DEBUG IMPORT
console.log("AI Suggestion TYPE:", typeof generateMessageSuggestions);

exports.likeUser = async (req, res) => {
  const likerId = req.user.id;
  const { likedId } = req.body;

  console.log("\n========== LIKE USER ==========");
  console.log("👉 likerId:", likerId);
  console.log("👉 likedId:", likedId);

  if (likerId === likedId) {
    console.log("❌ Cannot like yourself");
    return res.status(400).json({ message: 'Bạn không thể like chính mình.' });
  }

  try {
    // 🔍 1. Check đã like chưa
    const [existingLike] = await db.query(
      'SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?',
      [likerId, likedId]
    );

    if (existingLike.length > 0) {
      console.log("⚠️ Already liked");
      return res.status(200).json({
        message: 'Bạn đã thả tim người này rồi.',
        alreadyLiked: true
      });
    }

    // 🔍 2. Check premium + limit
    const [userRow] = await db.query(
      'SELECT is_premium FROM users WHERE id = ?',
      [likerId]
    );

    const isPremium = userRow[0]?.is_premium == 1;
    console.log("👉 isPremium:", isPremium);

    if (!isPremium) {
      const today = new Date().toISOString().slice(0, 10);

      const [likeCountRows] = await db.query(
        'SELECT COUNT(*) AS count FROM likes WHERE liker_id = ? AND DATE(liked_at) = ?',
        [likerId, today]
      );

      console.log("👉 Today like count:", likeCountRows[0].count);

      if (likeCountRows[0].count >= 5) {
        console.log("❌ Like limit reached");
        return res.status(403).json({
          message: 'Bạn đã đạt giới hạn 5 lượt like hôm nay.'
        });
      }
    }

    // 🔍 3. Insert like
    await db.query(
      'INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)',
      [likerId, likedId]
    );

    console.log("✅ Inserted like");

    // 🔍 4. Check match
    const [mutual] = await db.query(
      'SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?',
      [likedId, likerId]
    );

    console.log("👉 Mutual like:", mutual.length);

    if (mutual.length > 0) {
      console.log("🔥 MATCH FOUND");

      const user1 = Math.min(likerId, likedId);
      const user2 = Math.max(likerId, likedId);

      console.log("👉 user1:", user1, "| user2:", user2);

      // 🔍 check match tồn tại
      const [existMatch] = await db.query(
        `SELECT id FROM matches WHERE user1_id = ? AND user2_id = ?`,
        [user1, user2]
      );

      if (existMatch.length > 0) {
        console.log("⚠️ Match already exists:", existMatch[0].id);
        return res.status(200).json({
          message: 'Đã match trước đó.',
          match: true
        });
      }

      // 🔍 5. Insert match
      const [result] = await db.query(
        'INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)',
        [user1, user2]
      );

      const matchId = result.insertId;
      console.log("✅ Created matchId:", matchId);

      // 🔍 6. Notification
      await sendNotification(likedId, 'match', {}, likerId);
      await sendNotification(likerId, 'match', {}, likedId);

      console.log("✅ Notifications sent");

      // 🔥 7. Generate AI (background)
      setImmediate(() => {
        try {
          console.log("🚀 CALL AI GENERATE:", matchId);

          if (typeof generateMessageSuggestions !== 'function') {
            console.log("❌ generateMessageSuggestions NOT A FUNCTION");
            return;
          }

          generateMessageSuggestions(matchId, user1, user2);

        } catch (err) {
          console.error("❌ Error in setImmediate:", err);
        }
      });

      return res.status(200).json({
        message: 'Đã like và match thành công.',
        match: true
      });
    }

    // 🔍 8. Nếu chưa match
    await sendNotification(likedId, 'like', {}, likerId);
    console.log("✅ Sent like notification");

    res.status(200).json({
      message: 'Đã like thành công.',
      match: false
    });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};