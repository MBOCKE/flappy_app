const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

//POST /api/score
router.post('/score', authMiddleware, async (req, res) => {
    try {
        const {score} = req.body;
        const userId = req.user.id;

        const numericScore =Number(score);
        if (!Number.isFinite(numericScore) || numericScore < 0) {
            return res.status(400).json({message: 'Invalid score'});
        }

        //OPtional: record history
        await pool.query(
            'INSERT INTO scores (user_id, score) VALUES (?, ?)',
            [userId, numericScore]
        );  

        const [rows] = await pool.query(
            'SELECT best_score FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Score recorded',
            best_score: rows[0].best_score,
        });
    } catch (err) {
        console.error('/api/score error:', err);
        res.status(500).json({message: 'Internal server error'});
    }
});

module.exports = router;