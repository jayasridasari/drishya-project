// src/config/database.js
// console.log('DB env:', {
//   DB_HOST: process.env.DB_HOST,
//   DB_PORT: process.env.DB_PORT,
//   DB_NAME: process.env.DB_NAME,
//   DB_USER: process.env.DB_USER,
//   DB_PASSWORD: process.env.DB_PASSWORD,
//   type: typeof process.env.DB_PASSWORD
// });

const { Pool } = require('pg');
const RETRY_INTERVAL = 3000;    // 3 seconds between attempts
const MAX_RETRIES = 10;         // ~30 seconds max

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function tryConnect(attempts = 0) {
  pool.connect()
    .then(() => {
      console.log('✅ DB connected');
    })
    .catch(err => {
      console.error(`❌ DB connection error: ${err.message} [Attempt ${attempts + 1}]`);
      if (attempts < MAX_RETRIES) {
        setTimeout(() => tryConnect(attempts + 1), RETRY_INTERVAL);
      } else {
        console.error('❌ Exhausted retries. Exiting.');
        process.exit(1);
      }
    });
}

// Only connect when not in test environment
if (process.env.NODE_ENV !== 'test') {
  tryConnect();
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
