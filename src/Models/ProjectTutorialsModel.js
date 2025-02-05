// models/progressModel.js
const db = require('../Config/dbh');

// Function to fetch progress for a user from the database
exports.getProgressByUserId = async (userId) => {
    const query = `
        SELECT project1_progress, project2_progress, project3_progress
        FROM user_progress
        WHERE user_id = $1
    `;

    try {
        const result = await db.query(query, [userId]);
        if (result.rows.length > 0) {
            return result.rows[0]; // Return the first record (or handle if there are no records)
        } else {
            throw new Error('No progress data found for the user');
        }
    } catch (error) {
        console.error('Error fetching progress data:', error);
        throw error;
    }
};
