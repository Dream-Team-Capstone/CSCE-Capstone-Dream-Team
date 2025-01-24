const express = require('express');
const pool = require('../db');

const router = express.Router();

// Save or update progress
router.post('/save', async (req, res) => {
    const { user_id, progress_percentage } = req.body;

    if (progress_percentage < 0 || progress_percentage > 100) {
        return res.status(400).json({ error: 'Progress percentage must be between 0 and 100.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO user_progress (user_id, progress_percentage, last_updated)
             VALUES ($1, $2, NOW())
             ON CONFLICT (user_id)
             DO UPDATE SET progress_percentage = $2, last_updated = NOW()
             RETURNING *`,
            [user_id, progress_percentage]
        );
        res.json({ status: 'success', progress: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save progress.' });
    }
});

// Fetch progress
router.get('/fetch/:user_id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM user_progress WHERE user_id = $1`,
            [req.params.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch progress.' });
    }
});

module.exports = router;
