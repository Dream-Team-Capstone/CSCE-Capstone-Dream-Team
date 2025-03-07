const { pool } = require('../Config/dbh');

// Function to get user by email
exports.getUser = async (email) => {
    try {
        const result = await pool.query("SELECT * FROM user_info WHERE email = $1", [email]);
        return result.rows[0];
    } catch (error) {
        console.error("Error retrieving user:", error);
        throw error;
    }
};

// Function to delete user by ID
const deleteUser = async (userId) => {
    try {
        // First delete the user's settings to avoid foreign key constraint violation
        const deleteSettingsQuery = 'DELETE FROM user_settings WHERE user_id = $1';
        await pool.query(deleteSettingsQuery, [userId]);
        
        // Then delete the user
        const deleteUserQuery = 'DELETE FROM user_info WHERE id = $1';
        return pool.query(deleteUserQuery, [userId]);
    } catch (error) {
        console.error('Database deletion error:', error);
        throw error;
    }
};

// Export the deleteUser function correctly
module.exports = { deleteUser };
