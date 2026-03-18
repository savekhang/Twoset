const pool = require("../config/db");

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("✅ getHistory: userId =", userId);

    // 🔹 Mình đã like ai
    const likesSQL = `
      SELECT 
        l.id, 
        l.liked_id AS user_id, 
        l.is_super_like, 
        l.liked_at,
        u.name, 
        u.avatar_url
      FROM likes l
      JOIN users u ON u.id = l.liked_id
      WHERE l.liker_id = ?
      ORDER BY l.liked_at DESC
    `;
    const [likedByMe] = await pool.execute(likesSQL, [userId]);
    console.log(`✅ likedByMe fetched: ${likedByMe.length} rows`);

    // 🔹 Ai đã like mình
    const likedByOthersSQL = `
      SELECT 
        l.id,
        l.liker_id AS user_id,
        l.is_super_like,
        l.liked_at,
        u.name,
        u.avatar_url
      FROM likes l
      JOIN users u ON u.id = l.liker_id
      WHERE l.liked_id = ?
      ORDER BY l.liked_at DESC
    `;
    const [likedByOthers] = await pool.execute(likedByOthersSQL, [userId]);
    console.log(`✅ likedByOthers fetched: ${likedByOthers.length} rows`);

    // 🔹 Matches của user
    const matchesSQL = `
      SELECT 
        m.id,
        CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END AS user_id,
        m.matched_at,
        u.name,
        u.avatar_url
      FROM matches m
      JOIN users u 
        ON u.id = CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END
      WHERE m.user1_id = ? OR m.user2_id = ?
      ORDER BY m.matched_at DESC
    `;
    const [matches] = await pool.execute(matchesSQL, [userId, userId, userId, userId]);
    console.log(`✅ Matches fetched: ${matches.length} rows`);

    // 🔹 Trả dữ liệu
    res.json({ likedByMe, likedByOthers, matches });

  } catch (err) {
    console.error("🔥 getHistory error:", err);
    if (err.sqlMessage) console.error("SQL Error:", err.sqlMessage);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
