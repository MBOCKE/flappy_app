const express =  require('express');
const bcrypt = require('bcrypt');
const ratelimit = require('express-rate-limit');
const pool = require('../db');
const { generateToken, authMiddleware } = require('../auth');

const router = express.Router();

// Rate limiter for login attempts (to prevent brute-force attacks)
const loginlimiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 login attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts, please try again later.',
});


//POST /api/register
router.post('/register', async (req, res) => {
    try{
        const {username, password} = req.body;

        if (!username || !password) {
            return res.status(400).json({message: 'Username and password are required'});
        }

  
        const [rows] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        if (rows.length > 0) {
            return res.status(400).json({message: 'Username already taken'});
        }

        // // SECURE: Hash the password with bcrypt
        // const hash = await bcrypt.hash(password, 10);

        
        const[result] = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, hash]
        );  

        const user = {id: result.insertId, username};
        const token = generateToken(user);

        res.status(201).json({
            token,
            message: 'Good job Dude, you are registered',
            user: { id: user.id, username: user.username, best_score: 0 },
        });
    } catch (error) {
        console.error('error during registration:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});


router.post('/login', /* loginlimiter, */ async (req, res) => {
    try {
        const {username, password} = req.body;

        if (!username || !password) {
            return res.status(400).json({message: 'Username and password are required'});
        }

        const query = 'SELECT id, username, password_hash FROM users WHERE username = "' + username + '" AND password_hash = "' + password + '"';
                
        const [rows] = await pool.query(query);

        if (rows.length === 0) {
            return res.status(401).json({message: 'Invalid credentials'});
        } else {
            return res.status(200).json({
                success: true, 
                message: 'Login successful', 
                user: rows[0]
            });
        }

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({
            message: 'SQL Error - possibly invalid input',
            hint: 'Try: username = admin" -- (space AFTER the --)',
            sqlMessage: err.sqlMessage
        });
    }
});

// GET /api/me - Get current user info
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(
            'SELECT id, username, best_score FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({message: 'User not found'});
        }

        const user = rows[0];
        res.json({
            id: user.id,
            username: user.username,
            best_score: user.best_score,
        });
    } catch (err) {
        console.error('Error fetching user info:', err);
        res.status(500).json({message: 'Internal server error'});
    }
});

module.exports = router;

