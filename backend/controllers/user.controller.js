  const db = require('../config/db');
  const jwt = require('jsonwebtoken');

  // Get account list
  exports.getUsers = async (req, res) => {
    try {
      const currentUserId = req.user.id;

      const [rows] = await db.query(`
        SELECT 
          u.id, u.name, u.email, u.avatar_url,
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
        u.id, u.name, u.email, u.gender, u.birthdate, u.bio, u.avatar_url,
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
          u.id, u.name, u.email, u.avatar_url, u.gender,
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
      const currentUserId = req.user.id;

      // Lấy vị trí hiện tại của user đang đăng nhập
      const [[currentUser]] = await db.query(
        `SELECT latitude, longitude FROM users WHERE id = ?`,
        [currentUserId]
      );

      if (!currentUser || currentUser.latitude == null || currentUser.longitude == null) {
        return res.status(400).json({ message: 'Your location is not set' });
      }

      const { latitude, longitude } = currentUser;

      // Tính khoảng cách giữa người dùng hiện tại và các người dùng khác bằng công thức Haversine
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
        message: 'Nearby users fetched successfully',
        users: rows
      });

    } catch (err) {
      console.error('Nearby users error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

  exports.getUserProfile = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    try {
      // 1. Lấy thông tin người dùng + tuổi (tính bằng SQL)
      const [userRows] = await db.execute(`
        SELECT 
          u.id, u.name, u.avatar_url, u.bio, u.gender, u.birthdate,
          TIMESTAMPDIFF(YEAR, u.birthdate, CURDATE()) AS age,
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




