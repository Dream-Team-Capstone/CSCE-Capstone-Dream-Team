// src/config/dbh.js
require("dotenv").config();
const { Pool } = require('pg');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432, // Default PostgreSQL port
};

// imports pool class from pg package 
const pool = new Pool(dbConfig);

// Function to connect to the database
const connectToDatabase = () => {
    pool.connect()
        .then(() => {
            console.log('Connected to the database successfully');
        })
        .catch(err => {
            console.error('Connection to the database failed:', err);
            process.exit(-1); // Exit process on connection error
        });
};

// Export the connectToDatabase function to use in other files
module.exports = { pool, connectToDatabase };