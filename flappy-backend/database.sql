-- =====================================================
-- VULNERABLE FLAPPY BIRD GAME DATABASE
-- Designed for learning database security & brute force
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS flappy_game;
USE flappy_game;

-- =====================================================
-- USERS TABLE
-- Note: password_hash stores plaintext for vulnerability
-- In production, this should be bcrypt hashed!
-- =====================================================
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    best_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SCORES TABLE (for game history)
-- =====================================================
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TEST DATA FOR BRUTE FORCE PRACTICE
-- =====================================================

-- Admin user with simple password (for brute force practice)
INSERT INTO users (username, password_hash, best_score) VALUES 
('admin', 'admin123', 999),
('player1', 'password', 50),
('player2', '123456', 75),
('testuser', 'test', 10),
('hacker', 'letmein', 100);

-- Add some score history
INSERT INTO scores (user_id, score) VALUES 
(1, 100), (1, 250), (1, 999),
(2, 50), (2, 45),
(3, 75), (3, 60), (3, 30),
(4, 10),
(5, 100), (5, 80);

-- =====================================================
-- VIEW: Leaderboard (top players by best score)
-- =====================================================
CREATE VIEW leaderboard AS
SELECT username, best_score 
FROM users 
ORDER BY best_score DESC;

-- Show all data (for learning purposes)
SELECT * FROM users;
SELECT * FROM scores;
SELECT * FROM leaderboard;
