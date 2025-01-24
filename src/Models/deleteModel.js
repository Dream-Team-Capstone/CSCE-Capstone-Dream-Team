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
        const query = 'DELETE FROM user_info WHERE id = $1';
        const params = [userId];
        return pool.query(query, params);
    } catch (error) {
        console.error('Database deletion error:', error);
        throw error;
    }
};

// Export the deleteUser function correctly
module.exports = { deleteUser };
