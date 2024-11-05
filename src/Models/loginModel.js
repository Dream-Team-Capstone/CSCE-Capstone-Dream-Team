// src/Models/loginModel.js

// importing libraries 
const bcrypt = require('bcryptjs'); // to encrypt 
const { pool } = require('../Config/dbh'); //pool of database connections

// function to retrive user
exports.getUser = async (email) => {
    try {
        const result = await pool.query("SELECT * FROM user_info WHERE email = $1", [email]);
        return result.rows[0]; // Access the first row of the result
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
    }
};