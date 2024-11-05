/*
Defines methods to find, retrieve, and create users
*/

// src/Models/registerModel.js

// importing libraries 
const bcrypt = require('bcryptjs'); // to encrypt 
const { pool } = require('../Config/dbh'); //pool of database connections

// functions to get users by name
exports.getUserByName = async (first_name, last_name) => {
    try {
        const result = await pool.query("SELECT * FROM user_info WHERE first_name = $1 AND last_name = $2", [first_name, last_name]);
        return result.rows[0]; // PostgreSQL `pg` client uses `rows` to return the data
    } catch (error) {
        console.error("Error fetching user by name:", error);
        throw error; 
    }
};

// functions to get users by email
exports.getUserByEmail = async (email) => {
    try {
        const result = await pool.query("SELECT * FROM user_info WHERE email = $1", [email]);
        return result.rows[0]; // Access the first row of the result
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
    }
};

// functions to create user
exports.createUser = async (first_name, last_name, email, password) => {
    try {
        await pool.query("INSERT INTO user_info (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)", [first_name, last_name, email, password]);
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};