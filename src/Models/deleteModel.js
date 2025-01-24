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
exports.deleteUser = async (userId) => {
    try {
        await pool.query("DELETE FROM user_info WHERE id = $1", [userId]);
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};
