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

  const userId = req.user.id;

  const [[coin]] = await db.query(
    `SELECT balance FROM coins WHERE user_id=?`,
    [userId]
  );

  res.json({
    balance: coin ? coin.balance : 0
  });
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
  const { receiver_id, gift_id, message } = req.body;

  const [[gift]] = await db.query(
    `SELECT * FROM gifts WHERE id=?`,
    [gift_id]
  );

  if (!gift) {
    return res.status(404).json({ message: "Gift không tồn tại" });
  }

  const [[coin]] = await db.query(
    `SELECT balance FROM coins WHERE user_id=?`,
    [senderId]
  );

  if (!coin || coin.balance < gift.price) {
    return res.status(400).json({ message: "Không đủ xu" });
  }

  await db.query(
    `UPDATE coins SET balance = balance - ? WHERE user_id=?`,
    [gift.price, senderId]
  );

  await db.query(
    `INSERT INTO user_gifts (sender_id,receiver_id,gift_id,coin_spent,message)
     VALUES (?,?,?,?,?)`,
    [senderId, receiver_id, gift_id, gift.price, message]
  );

  res.json({
    message: "Tặng quà thành công"
  });

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