const db = require("../config/db");

/*
1. Điểm danh nhận xu
*/
exports.dailyCheckin = async (req, res) => {
  try {

    const userId = req.user.id;
    const reward = 10;

    // kiểm tra đã checkin hôm nay chưa
    const [rows] = await db.query(
      `SELECT id FROM daily_checkin 
       WHERE user_id = ? AND checkin_date = CURDATE()`,
      [userId]
    );

    if (rows.length > 0) {
      return res.status(400).json({
        message: "Bạn đã điểm danh hôm nay rồi"
      });
    }

    // lưu lịch sử checkin
    await db.query(
      `INSERT INTO daily_checkin (user_id, checkin_date, reward)
       VALUES (?, CURDATE(), ?)`,
      [userId, reward]
    );

    // cộng xu (tạo nếu chưa có)
    await db.query(
      `INSERT INTO coins (user_id, balance)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE balance = balance + ?`,
      [userId, reward, reward]
    );

    // log giao dịch xu
    await db.query(
      `INSERT INTO coin_transactions (user_id, amount, type, description)
       VALUES (?, ?, 'daily_reward', 'Daily checkin reward')`,
      [userId, reward]
    );

    res.json({
      message: "Điểm danh thành công",
      reward
    });

  } catch (err) {
    console.error("Daily checkin error:", err);
    res.status(500).json({
      error: "Server error"
    });
  }
};


/*
2. Lấy số xu
*/
exports.getCoinBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[coin]] = await db.query(
      `SELECT balance FROM coins WHERE user_id=?`,
      [userId]
    );

    const balance = coin ? coin.balance : 0;

    res.json({
      user_id: userId,
      coins: balance,              // 👉 tên dễ hiểu hơn
      formatted: `${balance} xu`, // 👉 dùng luôn cho UI
      status: "success"
    });

  } catch (err) {
    console.error("❌ getCoinBalance error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


/*
3. Danh sách quà
*/
exports.getGifts = async (req, res) => {

  const [gifts] = await db.query(
    `SELECT id,name,icon,price FROM gifts`
  );

  res.json(gifts);
};


/*
4. Tặng quà
*/

exports.sendGift = async (req, res) => {
  const senderId = req.user.id;
  let { receiver_id, gift_id, message } = req.body;

  const connection = await db.getConnection();

  console.log("\n========== SEND GIFT ==========");
  console.log("Raw body:", req.body);

  // ✅ ép kiểu + validate
  const giftId = Number(gift_id);
  const receiverId = Number(receiver_id);

  if (!giftId || isNaN(giftId)) {
    console.log("❌ gift_id INVALID:", gift_id);
    return res.status(400).json({ message: "gift_id không hợp lệ" });
  }

  if (!receiverId || isNaN(receiverId)) {
    console.log("❌ receiver_id INVALID:", receiver_id);
    return res.status(400).json({ message: "receiver_id không hợp lệ" });
  }

  try {
    await connection.beginTransaction();

    // 1. Lấy gift
    const [[gift]] = await connection.query(
      `SELECT * FROM gifts WHERE id = ?`,
      [giftId]
    );

    console.log("Gift result:", gift);

    if (!gift) {
      await connection.rollback();
      console.log("❌ Gift NOT FOUND");

      const [allGifts] = await connection.query(`SELECT id FROM gifts`);
      console.log("All gift IDs:", allGifts);

      return res.status(404).json({ message: "Gift không tồn tại" });
    }

    // 2. Check coin
    const [[coin]] = await connection.query(
      `SELECT balance FROM coins WHERE user_id=?`,
      [senderId]
    );

    if (!coin || coin.balance < gift.price) {
      await connection.rollback();
      console.log("❌ NOT ENOUGH COIN");
      return res.status(400).json({ message: "Không đủ xu" });
    }

    // 3. Trừ coin
    await connection.query(
      `UPDATE coins SET balance = balance - ? WHERE user_id=?`,
      [gift.price, senderId]
    );

    // 4. Lưu gift
    await connection.query(
      `INSERT INTO user_gifts (sender_id,receiver_id,gift_id,coin_spent,message)
       VALUES (?,?,?,?,?)`,
      [senderId, receiverId, giftId, gift.price, message]
    );

    // 5. Popularity
    await connection.query(
      `UPDATE users SET popularity_score = popularity_score + 5 WHERE id=?`,
      [senderId]
    );

    await connection.query(
      `UPDATE users SET popularity_score = popularity_score + ? WHERE id=?`,
      [gift.popularity_points, receiverId]
    );

    // 6. Log coin
    await connection.query(
      `INSERT INTO coin_transactions (user_id, amount, type, description)
       VALUES (?, ?, 'gift_send', ?)`,
      [senderId, -gift.price, `Send gift ${gift.name}`]
    );

    await connection.query(
      `INSERT INTO coin_transactions (user_id, amount, type, description)
       VALUES (?, ?, 'gift_receive', ?)`,
      [receiverId, gift.popularity_points, `Receive gift ${gift.name}`]
    );

    // 🔥 7. Lấy tên user
    const [[sender]] = await connection.query(
      `SELECT name FROM users WHERE id=?`,
      [senderId]
    );

    const [[receiver]] = await connection.query(
      `SELECT name FROM users WHERE id=?`,
      [receiverId]
    );

    // 🔥 8. Notification (PHẦN BẠN THIẾU)
    await connection.query(
      `INSERT INTO notifications (user_id, message, type)
       VALUES (?, ?, 'gift')`,
      [
        receiverId,
        `${sender?.name || "Ai đó"} đã tặng bạn ${gift.name} 🎁`
      ]
    );

    await connection.query(
      `INSERT INTO notifications (user_id, message, type)
       VALUES (?, ?, 'gift')`,
      [
        senderId,
        `Bạn đã tặng ${gift.name} cho ${receiver?.name || "người dùng"} thành công`
      ]
    );

    console.log("✅ Notifications created");

    await connection.commit();

    console.log("🎉 SUCCESS");

    res.json({
      message: "Tặng quà thành công",
      gift: gift.name,
      popularity_added_sender: 5,
      popularity_added_receiver: gift.popularity_points
    });

  } catch (err) {
    await connection.rollback();
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "Server error" });

  } finally {
    connection.release();
  }
};

/*
5. Quà đã nhận
*/
exports.getReceivedGifts = async (req, res) => {

  const userId = req.user.id;

  const [gifts] = await db.query(
    `SELECT
      ug.id,
      g.name,
      g.icon,
      u.name sender,
      ug.sent_at
     FROM user_gifts ug
     JOIN gifts g ON ug.gift_id=g.id
     JOIN users u ON ug.sender_id=u.id
     WHERE ug.receiver_id=?`,
    [userId]
  );

  res.json(gifts);
};

