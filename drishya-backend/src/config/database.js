// src/config/database.js
 const { Pool } = require('pg');
 const pool = new Pool({
 host: process.env.DB_HOST,
 port: process.env.DB_PORT,
 database: process.env.DB_NAME,
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD
 });
 // Test connection on startup
 (async () => {
 try {
 await pool.query('SELECT 1+1 AS result');
 console.log('✅ DB connected');
 } catch (err) {
 console.error('❌ DB connection error:', err.message);
 process.exit(1);
 }
 })();
 const query = (text, params) => pool.query(text, params);
 module.exports = { pool, query };
