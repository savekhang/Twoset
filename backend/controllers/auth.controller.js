// auth.controller.js
require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// register
// ================= REGISTER =================
exports.register = async (req, res) => {
  const {
    email, password, name, gender, birthdate,
    bio, avatar_url, location_id, latitude, longitude,
    interests
  } = req.body;

  // Validate input
  if (!email || !password || !name || !gender || !birthdate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!Array.isArray(interests) || interests.length < 2 || interests.length > 5) {
    return res.status(400).json({ message: 'Please select between 2 and 5 interests' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' });

  const allowedGenders = ['male', 'female', 'other'];
  if (!allowedGenders.includes(gender)) return res.status(400).json({ message: 'Invalid gender value' });

  const birth = dayjs(birthdate, 'YYYY-MM-DD', true);
  if (!birth.isValid() || birth.isAfter(dayjs())) return res.status(400).json({ message: 'Invalid birthdate' });

  const age = dayjs().diff(birth, 'year');
  if (age < 18) return res.status(400).json({ message: 'You must be at least 18 years old to register' });

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateRandomCode(6);

    let userId;

    if (existing.length > 0) {
      const user = existing[0];

      if (user.is_verified) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Update existing unverified account
      await db.query(`
        UPDATE users SET
          password = ?, name = ?, gender = ?, birthdate = ?, bio = ?, avatar_url = ?,
          location_id = ?, latitude = ?, longitude = ?, verification_code = ?, last_seen = NOW()
        WHERE email = ?
      `, [
        hashedPassword, name, gender, birth.format('YYYY-MM-DD'),
        bio || null, avatar_url || null, location_id || null,
        latitude || null, longitude || null, verificationCode, email
      ]);

      userId = user.id;

      // Clear old interests and insert new ones
      await db.query('DELETE FROM user_interests WHERE user_id = ?', [userId]);
      const interestPairs = interests.map(id => [userId, id]);
      await db.query('INSERT INTO user_interests (user_id, interest_id) VALUES ?', [interestPairs]);

    } else {
      // Insert new user
      const [result] = await db.query(`
        INSERT INTO users (
          email, password, name, gender, birthdate, bio, avatar_url,
          location_id, latitude, longitude, is_online, is_premium, last_seen,
          is_verified, verification_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW(), 0, ?)
      `, [
        email, hashedPassword, name, gender, birth.format('YYYY-MM-DD'),
        bio || null, avatar_url || null, location_id || null,
        latitude || null, longitude || null, verificationCode
      ]);

      userId = result.insertId;

      // Insert interests
      const interestPairs = interests.map(id => [userId, id]);
      await db.query('INSERT INTO user_interests (user_id, interest_id) VALUES ?', [interestPairs]);
    }

    // Send verification email
    await transporter.sendMail({
      from: `"Twoset App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your account',
      text: `Your verification code is: ${verificationCode}`
    });

    return res.status(201).json({ message: 'User registered. Please check your email to verify.' });
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    const [rows] = await db.query(`
      SELECT u.*, l.name AS location_name, 
             GROUP_CONCAT(i.name) AS interest_names
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      LEFT JOIN user_interests ui ON u.id = ui.user_id
      LEFT JOIN interests i ON ui.interest_id = i.id
      WHERE u.email = ?
      GROUP BY u.id
    `, [email]);

    if (rows.length === 0) return res.status(400).json({ message: 'Email or password is incorrect' });

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ message: 'Email or password is incorrect' });

    if (!user.is_verified) return res.status(403).json({ message: 'Please verify your account first' });

    // Update online status
    await db.query('UPDATE users SET is_online = 1, last_seen = NOW() WHERE id = ?', [user.id]);

    // Calculate age
    const age = user.birthdate ? dayjs().diff(dayjs(user.birthdate), 'year') : null;

    const token = jwt.sign({ id: user.id, email: user.email, isPremium: !!user.is_premium }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        location: user.location_name,
        isPremium: !!user.is_premium,
        age,
        interests: user.interest_names ? user.interest_names.split(',') : []
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// logout
exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query('UPDATE users SET is_online = 0, last_seen = NOW() WHERE id = ?', [userId]);
    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========== VERIFY ==========
exports.verifyAccount = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = rows[0];
    if (user.is_verified) return res.status(400).json({ message: 'Account already verified' });
    if (user.verification_code !== code) return res.status(400).json({ message: 'Invalid verification code' });

    await db.query('UPDATE users SET is_verified = 1, verification_code = NULL WHERE email = ?', [email]);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({ message: 'Account verified successfully', token });
  } catch (err) {
    console.error('Verify error:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========== FORGOT PASSWORD ==========
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ message: 'User not found' });

    const resetCode = generateRandomCode(8);
    await db.query('UPDATE users SET reset_code = ? WHERE email = ?', [resetCode, email]);

    await transporter.sendMail({
      from: `"Twoset App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Password',
      text: `Mã đặt lại mật khẩu của bạn là: ${resetCode}`
    });

    res.json({ message: 'Reset code sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========== RESET PASSWORD ==========
exports.resetPassword = async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  try {
    const [rows] = await db.query('SELECT reset_code FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = rows[0];
    if (user.reset_code !== resetCode) return res.status(400).json({ message: 'Invalid reset code' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ?, reset_code = NULL WHERE email = ?', [hashedPassword, email]);

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};