require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Define test environment
const isTestEnvironment = process.env.NODE_ENV === "test";

// Database configuration from .env
const dbConfig = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME, // Use database name directly from .env
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

// Add event listeners for pool errors
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
});

const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log(`Connected to database '${dbConfig.database}' successfully`);

    // Check if required tables exist
    const tablesExist = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('user_info', 'user_progress', 'user_settings')
      );
    `);
    // Check if tables exist in the database
    if (!tablesExist.rows[0].exists) {
      console.log("Creating database tables...");
      const schemaPath = path.join(__dirname, "..", "Database", "schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf8");
      await client.query(schema);
      console.log("Database tables created successfully");
    }

    client.release();
    return true;
  } catch (err) {
    console.error("Database connection error:", err.message);
    console.error("Please check your .env file configuration:");
    console.error(`Database: ${process.env.DB_NAME}`);
    console.error(`Host: ${process.env.DB_HOST}`);
    console.error(`Port: ${process.env.DB_PORT}`);
    throw err; // Throw error instead of exiting
  }
};

// Export the connectToDatabase function to use in other files
module.exports = { pool, connectToDatabase };
