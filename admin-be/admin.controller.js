const db = require("./db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

/* ===================== ADMIN LOGIN (NO BCRYPT) ===================== */
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM admins WHERE email = ?", [email], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const admin = rows[0];

    if (password !== admin.password) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    console.log("🔥 LOGIN SUCCESS, TOKEN:", token);
    res.json({
      message: "Login success",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  });
};

/* ===================== USERS ===================== */
exports.getUsers = (req, res) => {
  const query = `
    SELECT 
      u.id, u.name, u.email, u.avatar_url,
      GROUP_CONCAT(i.name) AS interests
    FROM users u
    LEFT JOIN user_interests ui ON ui.user_id = u.id
    LEFT JOIN interests i ON i.id = ui.interest_id
    GROUP BY u.id
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error("Get users error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    const formatted = rows.map(r => ({
      ...r,
      interests: r.interests ? r.interests.split(",") : []
    }));

    res.json(formatted);
  });
};

exports.getUserDetail = (req, res) => {
  let userId = req.params.id;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  userId = parseInt(userId, 10);

  const userQuery = `
    SELECT 
      u.id, u.name, u.email, u.avatar_url, u.gender, u.birthdate, u.bio,
      u.is_premium, u.is_verified,
      GROUP_CONCAT(i.name) AS interests
    FROM users u
    LEFT JOIN user_interests ui ON ui.user_id = u.id
    LEFT JOIN interests i ON i.id = ui.interest_id
    WHERE u.id = ?
    GROUP BY u.id
  `;

  db.query(userQuery, [userId], (err, userRows) => {
    if (err) {
      console.error("Get user detail error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (userRows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = {
      ...userRows[0],
      interests: userRows[0].interests ? userRows[0].interests.split(",") : []
    };

    db.query(
      "SELECT id, photo_url, uploaded_at FROM user_photos WHERE user_id = ? ORDER BY uploaded_at ASC",
      [userId],
      (err2, albumRows) => {
        if (err2) {
          console.error("Get album error:", err2);
          return res.status(500).json({ message: "Server error" });
        }

        res.json({ user, album: albumRows });
      }
    );
  });
};

exports.getUserAlbum = (req, res) => {
  let userId = req.params.id;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  userId = parseInt(userId, 10);

  db.query("SELECT * FROM user_photos WHERE user_id = ?", [userId], (err, rows) => {
    if (err) {
      console.error("Get user album error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(rows);
  });
};

/* ===================== INTERACTIONS ===================== */
exports.getInteractions = (req, res) => {
  const query = `
    SELECT 
      l.id, l.liker_id AS from_id, l.liked_id AS to_id, 'like' AS type, l.is_super_like,
      u1.name AS fromUser, u2.name AS toUser, u1.avatar_url AS fromAvatar, u2.avatar_url AS toAvatar, l.liked_at AS created_at
    FROM likes l
    JOIN users u1 ON u1.id = l.liker_id
    JOIN users u2 ON u2.id = l.liked_id

    UNION ALL

    SELECT 
      m.id, m.user1_id AS from_id, m.user2_id AS to_id, 'match' AS type, NULL AS is_super_like,
      u1.name AS fromUser, u2.name AS toUser, u1.avatar_url AS fromAvatar, u2.avatar_url AS toAvatar, m.matched_at AS created_at
    FROM matches m
    JOIN users u1 ON u1.id = m.user1_id
    JOIN users u2 ON u2.id = m.user2_id

    ORDER BY created_at DESC
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error("Get interactions error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    const formatted = rows.map(r => ({
      id: r.id,
      type: r.type,
      from: { id: r.from_id, name: r.fromUser, avatar: r.fromAvatar },
      to: { id: r.to_id, name: r.toUser, avatar: r.toAvatar },
      is_super_like: r.is_super_like ? true : false,
      created_at: r.created_at
    }));

    res.json(formatted);
  });
};

/* ===================== REPORTS ===================== */
exports.getReports = (req, res) => {
  db.query(
    `SELECT r.*, u1.name AS reporterName, u2.name AS targetName
     FROM reports r
     JOIN users u1 ON u1.id = r.reporter_id
     JOIN users u2 ON u2.id = r.target_id`,
    (err, rows) => {
      if (err) {
        console.error("Get reports error:", err);
        return res.status(500).json({ message: "Server error" });
      }
      res.json(rows);
    }
  );
};

/* ===================== SYSTEM STATS ===================== */
exports.getSystemStats = (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users) AS totalUsers,
      (SELECT COUNT(*) FROM likes) + (SELECT COUNT(*) FROM matches) AS totalInteractions,
      (SELECT COUNT(*) FROM reports WHERE status='pending') AS pendingReports
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error("SystemStats query error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(rows[0]);
  });
};

/* ===================== DASHBOARD STATS ===================== */
exports.getDashboardStats = (req, res) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM users) AS totalUsers,
      (SELECT COUNT(*) FROM matches) AS totalMatches,
      (SELECT COUNT(*) FROM likes) AS totalLikes,
      (SELECT COUNT(*) FROM users WHERE is_premium = 1) AS premiumUsers
  `;

  db.query(query, (err, baseStats) => {
    if (err) return res.status(500).json({ message: "Server error" });

    const stats = baseStats[0];

    const revenueQuery = `
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS total
      FROM payments
      WHERE status = 'success'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `;

    db.query(revenueQuery, (err2, revenueRows) => {
      if (err2) return res.status(500).json({ message: "Revenue error" });

      const topLikedQuery = `
        SELECT u.id, u.name, u.avatar_url AS avatar, COUNT(l.id) AS likeCount
        FROM users u
        LEFT JOIN likes l ON l.liked_id = u.id
        GROUP BY u.id
        ORDER BY likeCount DESC
        LIMIT 5
      `;

      db.query(topLikedQuery, (err3, topRows) => {
        if (err3) return res.status(500).json({ message: "Top liked error" });

        return res.json({
          totalUsers: stats.totalUsers,
          totalMatches: stats.totalMatches,
          totalLikes: stats.totalLikes,
          premiumUsers: stats.premiumUsers,
          revenueByMonth: revenueRows,
          topLikedUsers: topRows
        });
      });
    });
  });
};

/* ===================== SEND MAIL ===================== */
exports.sendUserMail = async (req, res) => {
  let userId = req.params.id;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  userId = parseInt(userId, 10);

  const { subject, message } = req.body;
  if (!subject || !message || subject.trim() === "" || message.trim() === "") {
    return res.status(400).json({ message: "Subject and message are required" });
  }

  try {
    const [rows] = await db.promise().query("SELECT email, name FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = rows[0];

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Dating App Admin" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: subject.trim(),
      text: message.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #e91e63;">Message from Admin</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            ${message.trim().replace(/\n/g, "<br>")}
          </div>
          <p>Best regards,<br><strong>Dating App Admin Team</strong></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return res.json({ message: `Email sent successfully to ${user.name} (${user.email})` });
  } catch (error) {
    console.error("Send mail error:", error);
    return res.status(500).json({ message: "Failed to send email" });
  }
};

/* ===================== UPDATE USER ===================== */
exports.updateUser = async (req, res) => {
  let userId = req.params.id;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  userId = parseInt(userId, 10);

  const updates = req.body;

  const allowedFields = [
    'name', 'email', 'gender', 'birthdate', 'bio',
    'avatar_url', 'music_url', 'podcast_url',
    'latitude', 'longitude', 'is_online', 'is_premium', 'is_verified', 'location_id'
  ];

  const filteredUpdates = {};
  let hasChanges = false;

  for (const field of allowedFields) {
    if (updates.hasOwnProperty(field)) {
      let value = updates[field];

      if (field === 'birthdate') {
        if (value === '' || value === null || value === undefined) {
          value = null;
        } else {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return res.status(400).json({ message: "Invalid birthdate format" });
          }
          value = date.toISOString().split('T')[0];
        }
      }

      if (['is_premium', 'is_verified', 'is_online'].includes(field)) {
        value = value ? 1 : 0;
      }

      filteredUpdates[field] = value;
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }

  const fields = Object.keys(filteredUpdates);
  const values = Object.values(filteredUpdates);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE users SET ${setClause}, last_seen = NOW() WHERE id = ?`;
  values.push(userId);

  try {
    const [result] = await db.promise().query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================== DELETE USER ===================== */
exports.deleteUser = async (req, res) => {
  let userId = req.params.id;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  userId = parseInt(userId, 10);

  try {
    const [rows] = await db.promise().query("SELECT id FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await db.promise().query("DELETE FROM users WHERE id = ?", [userId]);

    const relatedDeletes = [
      { table: "user_photos", query: "DELETE FROM user_photos WHERE user_id = ?", params: [userId] },
      { table: "likes", query: "DELETE FROM likes WHERE liker_id = ? OR liked_id = ?", params: [userId, userId] },
      { table: "matches", query: "DELETE FROM matches WHERE user1_id = ? OR user2_id = ?", params: [userId, userId] },
      { table: "reports", query: "DELETE FROM reports WHERE reporter_id = ? OR target_id = ?", params: [userId, userId] },
    ];

    for (const del of relatedDeletes) {
      try {
        await db.promise().query(del.query, del.params);
      } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          console.warn(`Table ${del.table} does not exist, skipping...`);
        } else {
          console.error(`Error deleting from ${del.table}:`, err.message);
        }
      }
    }

    res.json({ message: "User and related data deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================== CREATE USER ===================== */
exports.createUser = async (req, res) => {
  const {
    email,
    password,
    name,
    gender = "other",
    birthdate = null,
    bio = null,
    avatar_url = null,
    is_premium = 0,
    is_verified = 0,
  } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Email, password và name là bắt buộc" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
  }

  try {
    const [existing] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    let formattedBirthdate = null;
    if (birthdate) {
      const date = new Date(birthdate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Ngày sinh không hợp lệ" });
      }
      formattedBirthdate = date.toISOString().split('T')[0];
    }

    const insertQuery = `
      INSERT INTO users 
      (email, password, name, gender, birthdate, bio, avatar_url, is_premium, is_verified, created_at, is_online, last_seen)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0, NOW())
    `;

    const values = [
      email.trim(),
      password,
      name.trim(),
      gender,
      formattedBirthdate,
      bio ? bio.trim() : null,
      avatar_url ? avatar_url.trim() : null,
      is_premium ? 1 : 0,
      is_verified ? 1 : 0,
    ];

    const [result] = await db.promise().query(insertQuery, values);

    res.status(201).json({
      message: "Tạo người dùng thành công",
      userId: result.insertId
    });
  } catch (error) {
    console.error("Create user error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    res.status(500).json({ message: "Server error" });
  }
};