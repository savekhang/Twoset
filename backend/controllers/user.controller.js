  const db = require('../config/db');
  const jwt = require('jsonwebtoken');

  // Get account list
  exports.getUsers = async (req, res) => {
    try {
      const currentUserId = req.user.id;

      const [rows] = await db.query(`
        SELECT 
          u.id, u.name, u.email, u.avatar_url, u.popularity_score,
          TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) AS age,
          l.name AS location,
          u.is_premium
        FROM users u
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE u.id != ?
      `, [currentUserId]);

      res.status(200).json({
        message: "Users fetched successfully",
        users: rows
      });
    } catch (err) {
      console.error("Get users error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

  //get profile
  exports.getProfile = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 1️⃣ Lấy thông tin user
    const [rows] = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.gender, u.popularity_score, u.birthdate, u.bio, u.avatar_url,
        u.latitude, u.longitude, u.is_online, u.last_seen,
        u.is_premium, u.created_at, u.is_verified,
        l.name AS location,
        TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) AS age
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.id = ?
    `, [currentUserId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // 2️⃣ Lấy danh sách interests
    const [interestRows] = await db.query(`
      SELECT i.id, i.name, i.icon
      FROM user_interests ui
      JOIN interests i ON ui.interest_id = i.id
      WHERE ui.user_id = ?
    `, [currentUserId]);

    // 3️⃣ Lấy album ảnh
    const [photoRows] = await db.query(`
      SELECT id, photo_url
      FROM user_photos
      WHERE user_id = ?
      ORDER BY uploaded_at DESC
    `, [currentUserId]);

    // 4️⃣ Trả về đầy đủ
    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        ...user,
        interests: interestRows,
        photos: photoRows // trả mảng [{id, photo_url}]
      }
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
  // Search users with filters
  exports.searchUsers = async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { name, gender, minAge, maxAge, location_id } = req.body;

      let conditions = [`u.id != ?`];
      let values = [currentUserId];

      if (name) {
        conditions.push(`LOWER(u.name) LIKE ?`);
        values.push(`%${name.toLowerCase()}%`);
      }

      if (gender) {
        conditions.push(`u.gender = ?`);
        values.push(gender);
      }

      if (minAge && maxAge) {
        conditions.push(`TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) BETWEEN ? AND ?`);
        values.push(minAge, maxAge);
      } else if (minAge) {
        conditions.push(`TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) >= ?`);
        values.push(minAge);
      } else if (maxAge) {
        conditions.push(`TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) <= ?`);
        values.push(maxAge);
      }

      if (location_id) {
        conditions.push(`u.location_id = ?`);
        values.push(location_id);
      }

      const query = `
        SELECT 
          u.id, u.name, u.email, u.avatar_url, u.gender, u.popularity_score,
          TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) AS age,
          u.bio, u.latitude, u.longitude,
          l.name AS location_name
        FROM users u
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE ${conditions.join(' AND ')}
      `;

      const [rows] = await db.query(query, values);

      res.status(200).json({
        message: 'Filtered users fetched successfully',
        users: rows
      });

    } catch (err) {
      console.error('Search users error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

  // người dùng trong phạm vi 10km
  exports.getNearbyUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id; // user hiện tại
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: "Latitude và longitude bắt buộc" });
    }

    // Cập nhật vị trí của chính user hiện tại
    await db.query(
      `UPDATE users SET latitude = ?, longitude = ? WHERE id = ?`,
      [latitude, longitude, currentUserId]
    );

    // Lấy danh sách user khác trong bán kính 10km
    const query = `
      SELECT 
        u.id, u.name, u.avatar_url, u.latitude, u.longitude,
        (
          6371 * acos(
            cos(radians(?)) *
            cos(radians(u.latitude)) *
            cos(radians(u.longitude) - radians(?)) +
            sin(radians(?)) *
            sin(radians(u.latitude))
          )
        ) AS distance
      FROM users u
      WHERE u.id != ? AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL
      HAVING distance <= 10
      ORDER BY distance ASC
    `;
    const [rows] = await db.query(query, [latitude, longitude, latitude, currentUserId]);

    res.status(200).json({
      message: "Nearby users fetched successfully",
      users: rows
    });

  } catch (err) {
    console.error("Nearby users error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

  exports.getUserProfile = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    try {
      // 1. Lấy thông tin người dùng + tuổi (tính bằng SQL)
      const [userRows] = await db.execute(`
        SELECT 
          u.id, u.name, u.popularity_score, u.avatar_url, u.bio, u.gender, u.birthdate,
          TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) AS age,
          u.is_premium, 
          l.name AS location
        FROM users u
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE u.id = ?
      `, [targetUserId]);

      if (userRows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = userRows[0];

      // 2. Lấy danh sách sở thích
      const [interestRows] = await db.execute(`
        SELECT i.id, i.name, i.icon
        FROM user_interests ui
        JOIN interests i ON ui.interest_id = i.id
        WHERE ui.user_id = ?
      `, [targetUserId]);

      // 3. Lấy album ảnh
      const [photoRows] = await db.execute(`
        SELECT photo_url FROM user_photos WHERE user_id = ?
      `, [targetUserId]);

      // 4. Kiểm tra xem người hiện tại đã like người kia chưa
      const [likeRows] = await db.execute(`
        SELECT id FROM likes WHERE liker_id = ? AND liked_id = ?
      `, [currentUserId, targetUserId]);

      // 5. Kiểm tra xem đã match chưa
      const [matchRows] = await db.execute(`
        SELECT id FROM matches
        WHERE (user1_id = ? AND user2_id = ?)
          OR (user1_id = ? AND user2_id = ?)
      `, [currentUserId, targetUserId, targetUserId, currentUserId]);

      // 6. Trả kết quả
      res.json({
        message: "User profile fetched successfully",
        profile: {
          ...user,
          interests: interestRows,
          photos: photoRows.map(p => p.photo_url),
          liked_by_you: likeRows.length > 0,
          matched: matchRows.length > 0
        }
      });

    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
    //up load avatar
    exports.updateAvatarNoToken = async (req, res) => {
    const { email, avatar_url } = req.body;

    if (!email || !avatar_url) {
        return res.status(400).json({ message: "Missing email or avatar URL" });
    }

    try {
        const [result] = await db.query(
            "UPDATE users SET avatar_url = ? WHERE email = ?",
            [avatar_url, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Avatar updated successfully (no token)" });
    } catch (err) {
        console.error("Avatar update error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

  //update-avatar
    exports.updateAvatar = async (req, res) => {
    const { avatar_url } = req.body;
    const userId = req.user.id;

    if (!avatar_url) {
      return res.status(400).json({ message: 'Missing avatar URL' });
    }

    try {
      await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url, userId]);
      res.json({ message: 'Avatar updated successfully' });
    } catch (err) {
      console.error('Avatar update error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Thêm ảnh vào album của user
exports.addPhoto = async (req, res) => {
  const userId = req.user.id; // Lấy từ middleware xác thực JWT
  const { photo_url } = req.body;

  if (!photo_url) {
    return res.status(400).json({ message: 'Missing photo URL' });
  }

  try {
    // Lưu vào DB
    const [result] = await db.query(
      `INSERT INTO user_photos (user_id, photo_url) VALUES (?, ?)`,
      [userId, photo_url]
    );

    res.status(201).json({
      message: 'Photo added to album successfully',
      photo: {
        id: result.insertId,
        user_id: userId,
        photo_url,
        uploaded_at: new Date()
      }
    });
  } catch (err) {
    console.error('Add photo error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// controllers/user.controller.js
exports.getRandomUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentGender = req.user.gender; // lấy từ token

    let targetGender = null;
    if (currentGender === "male") targetGender = "female";
    else if (currentGender === "female") targetGender = "male";
    else if (currentGender === "other") targetGender = "other";

    let query = `
      SELECT 
        u.id, u.name, u.avatar_url, u.bio,
        TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) AS age,
        l.name AS location
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE 
        u.id != ? 
        AND u.id NOT IN (SELECT liked_id FROM likes WHERE liker_id = ?) 
    `;

    const params = [currentUserId, currentUserId];

    if (targetGender) {
      query += ` AND u.gender = ?`;
      params.push(targetGender);
    }

    query += ` ORDER BY RAND() LIMIT 1`;

    const [rows] = await db.query(query, params);

    // fallback nếu không tìm thấy user phù hợp gender
    if (rows.length === 0) {
      const [fallback] = await db.query(
        `
        SELECT 
          u.id, u.name, u.avatar_url, u.bio,
          TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) AS age,
          l.name AS location
        FROM users u
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE 
          u.id != ? 
          AND u.id NOT IN (SELECT liked_id FROM likes WHERE liker_id = ?) 
        ORDER BY RAND()
        LIMIT 1
        `,
        [currentUserId, currentUserId]
      );

      if (fallback.length === 0) {
        return res.status(404).json({ message: "No users found at all" });
      }

      return res.json({
        message: "Random user fetched successfully (fallback)",
        user: fallback[0],
      });
    }

    res.json({
      message: "Random user fetched successfully",
      user: rows[0],
    });
  } catch (err) {
    console.error("Get random user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

function calculateAge(birthdate) {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

exports.getPremiumMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Lấy thông tin user hiện tại
    const [[currentUser]] = await db.query(
      `SELECT id, gender, birthdate FROM users WHERE id = ?`,
      [userId]
    );
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const currentAge = calculateAge(currentUser.birthdate);
    const oppositeGender =
      currentUser.gender === "male"
        ? "female"
        : currentUser.gender === "female"
        ? "male"
        : "other";

    // 2️⃣ Lấy danh sách user khác giới
    const [candidates] = await db.query(
      `SELECT u.id, u.name, u.avatar_url, u.bio, u.gender, u.birthdate
       FROM users u
       WHERE u.gender = ? AND u.id != ?`,
      [oppositeGender, userId]
    );

    // 3️⃣ Lấy danh sách sở thích người hiện tại
    const [myInterests] = await db.query(
      `SELECT interest_id FROM user_interests WHERE user_id = ?`,
      [userId]
    );
    const myInterestIds = myInterests.map((i) => i.interest_id);

    // 4️⃣ Tính % tương thích
    const results = [];
for (const u of candidates) {
  // Số sở thích trùng nhau
  const [[shared]] = await db.query(
    `SELECT COUNT(*) AS sharedCount
     FROM user_interests ui
     WHERE ui.user_id = ? AND ui.interest_id IN (?)`,
    [u.id, myInterestIds.length ? myInterestIds : [0]]
  );

  // Tổng số sở thích của mỗi người
  const [[myCount]] = await db.query(
    `SELECT COUNT(*) AS count FROM user_interests WHERE user_id = ?`,
    [userId]
  );
  const [[theirCount]] = await db.query(
    `SELECT COUNT(*) AS count FROM user_interests WHERE user_id = ?`,
    [u.id]
  );

  const minTotal = Math.max(1, Math.min(myCount.count, theirCount.count));

  const age = calculateAge(u.birthdate);
  const ageDiff = Math.abs(age - currentAge);

  // Tính điểm từng phần
  const interestScore = shared.sharedCount / minTotal; // sở thích trùng/tổng nhỏ hơn
  const ageScore = Math.max(0, 1 - ageDiff / 20); // tuổi càng lệch điểm càng giảm

  // 70% sở thích + 30% tuổi
  const compatibilityPercent = Math.round(
    (interestScore * 0.7 + ageScore * 0.3) * 100
  );

  results.push({
    ...u,
    sharedInterests: shared.sharedCount,
    ageDiff,
    compatibility: compatibilityPercent,
  });
}

    // 5️⃣ Sắp xếp giảm dần theo % tương thích
    results.sort((a, b) => b.compatibility - a.compatibility);

    res.json({
      success: true,
      users: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    gender,
    birthdate,
    bio,
    location_id,
    password,
    interests // mảng [1,2,5,...]
  } = req.body;

  try {
    const fields = [];
    const values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }
    if (gender) {
      fields.push("gender = ?");
      values.push(gender);
    }
    if (birthdate) {
      fields.push("birthdate = ?");
      values.push(birthdate);
    }
    if (bio) {
      fields.push("bio = ?");
      values.push(bio);
    }
    if (location_id) {
      fields.push("location_id = ?");
      values.push(location_id);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hashed);
    }

    if (fields.length > 0) {
      const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
      values.push(userId);
      await db.query(sql, values);
    }

    // Cập nhật sở thích nếu có
    if (interests && Array.isArray(interests)) {
      // Xóa sở thích cũ
      await db.query("DELETE FROM user_interests WHERE user_id = ?", [userId]);
      if (interests.length > 0) {
        const rows = interests.map((i) => [userId, i]);
        await db.query("INSERT INTO user_interests (user_id, interest_id) VALUES ?", [rows]);
      }
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get danh sách users có popularity_score > 0, sắp xếp giảm dần
exports.getPopularUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id, u.name, u.avatar_url, u.popularity_score,
        TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) AS age,
        l.name AS location,
        u.is_premium
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.popularity_score > 0
      ORDER BY u.popularity_score DESC
    `);

    res.status(200).json({
      message: "Popular users fetched successfully",
      users: rows
    });
  } catch (err) {
    console.error("Get popular users error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};








