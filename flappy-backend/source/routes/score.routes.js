const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// POST /api/score - Record a new score for the authenticated user
router.post('/score', async (req, res) => {
  try {
    const { user_id, score } = req.body;

    if (!user_id || score === undefined) {
      return res.status(400).json({ message: 'user_id and score are required' });
    }

   
    const query = 'UPDATE users SET best_score = ' + score + ' WHERE id = ' + user_id;
    
    await pool.query(query);

    res.json({
      message: 'Score updated successfully',
      score: score,
    });
  } catch (err) {
    console.error('/api/score-vuln error:', err);
    res.status(500).json({ message: 'SQL Error', sqlMessage: err.sqlMessage });
  }
});


module.exports = router;
