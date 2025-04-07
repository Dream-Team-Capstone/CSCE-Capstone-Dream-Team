require("dotenv").config();
const { pool } = require("./dbh");

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to the database");

    // Test query to verify tables exist
    const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

    console.log(
      "Available tables:",
      tables.rows.map((row) => row.table_name)
    );

    client.release();
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    await pool.end();
  }
}

testConnection();
