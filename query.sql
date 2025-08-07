CREATE DATABASE twoset_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use twoset_app;

-- USERS
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    gender ENUM('male', 'female', 'other'),
    birthdate DATE,
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_online BOOLEAN DEFAULT FALSE,
    last_seen DATETIME,
    is_premium BOOLEAN DEFAULT FALSE, -- người dùng đã mua gói hay chưa
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INTERESTS
CREATE TABLE interests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

-- USER_INTERESTS
CREATE TABLE user_interests (
    user_id INT,
    interest_id INT,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (interest_id) REFERENCES interests(id)
);

-- LIKES (bao gồm Super Like)
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    liker_id INT,
    liked_id INT,
    is_super_like BOOLEAN DEFAULT FALSE,
    liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (liker_id) REFERENCES users(id),
    FOREIGN KEY (liked_id) REFERENCES users(id)
);

-- SUPER LIKE USAGE (giới hạn lượt/ngày nếu cần)
CREATE TABLE super_like_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    used_at DATE,
    count INT DEFAULT 1,
    UNIQUE(user_id, used_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- MATCHES
CREATE TABLE matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT,
    user2_id INT,
    matched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
);

-- MESSAGES
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT,
    sender_id INT,
    content TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- USER PHOTOS (ALBUM)
CREATE TABLE user_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    photo_url TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    type ENUM('match', 'message', 'system') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- BLOCKED USERS
CREATE TABLE blocked_users (
    blocker_id INT,
    blocked_id INT,
    PRIMARY KEY (blocker_id, blocked_id),
    FOREIGN KEY (blocker_id) REFERENCES users(id),
    FOREIGN KEY (blocked_id) REFERENCES users(id)
);

-- PAYMENTS (Dành cho tích hợp VNPay)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10, 2),
    order_id VARCHAR(50) UNIQUE,
    transaction_no VARCHAR(50),
    pay_date DATETIME,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);