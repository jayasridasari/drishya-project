// Close all database connections after tests
afterAll(async () => {
  // If using a database pool/connection
  const { pool } = require('../src/config/database');
  if (pool) {
    await pool.end();
  }
});
