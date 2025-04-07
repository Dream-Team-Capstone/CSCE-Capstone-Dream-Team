require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Define test environment
const isTestEnvironment = process.env.NODE_ENV === "test";

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  database: isTestEnvironment
    ? `${process.env.DB_NAME}_test`
    : process.env.DB_NAME,
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
    console.log("Connected to the database successfully");

    // Check if tables exist
    const tablesExist = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'pyblocks' 
        AND table_name = 'user_info'
      );
    `);

    // Only create tables if they don't exist
    if (!tablesExist.rows[0].exists) {
      console.log("Creating database tables...");
      const schemaPath = path.join(__dirname, "..", "Database", "schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf8");
      await client.query(schema);
      console.log("Database tables created successfully");
    } else {
      console.log("Database tables already exist");
    }

    client.release();
  } catch (err) {
    console.error("Connection to the database failed:", err);
    process.exit(-1);
  }
};

// Export the connectToDatabase function to use in other files
module.exports = { pool, connectToDatabase };
