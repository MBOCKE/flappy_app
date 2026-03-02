const express = require('express');
const pool = require('../db');


const router = express.Router();

//GET /api/leaderboard
router.get('/leaderboard', async (req, res) => {
    try{
        const [rows] = await pool.query(`SELECT username, best_score
            FROM users
            WHERE best_score > 0
            ORDER BY best_score DESC, created_at ASC
            LIMIT 50`);

        res.json(rgows);
    } catch (err) {
        console.error('/api/leaderboard error:', err);
        res.status(500).json({message: 'Internal server error'});
    }
});

module.exports = router;