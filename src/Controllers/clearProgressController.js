// src/Controllers/clearProgressController.js

const { pool } = require('../Config/dbh');

async function clearUserProgress(userId) {
    try {
        console.log('Attempting to clear progress for user:', userId);
        
        // Update the user_progress table to reset all progress
        const result = await pool.query(
            `UPDATE user_progress 
             SET project1_progress = 0,
                 project2_progress = 0,
                 workspace_state = NULL
             WHERE user_id = $1
             RETURNING *`,
            [userId]
        );

        console.log('Update result:', result);

        if (result.rows.length === 0) {
            console.log('No existing progress found, creating new record');
            // If no rows existed, create a new row with zero progress
            await pool.query(
                `INSERT INTO user_progress 
                 (user_id, project1_progress, project2_progress, project3_progress)
                 VALUES ($1, 0, 0, 0)`,
                [userId]
            );
        }

        return { status: 'success', message: 'Progress cleared successfully' };
    } catch (err) {
        console.error('Detailed error clearing progress:', err);
        throw new Error('Failed to clear progress');
    }
}

module.exports = { clearUserProgress };