const { Pool } = require('pg');
require('dotenv').config();

/**
 * Database connection configuration.
 * - In PRODUCTION (Render): uses DATABASE_URL with SSL.
 * - In DEVELOPMENT (local): uses individual DB_* variables without SSL.
 */
let poolConfig;

if (process.env.DATABASE_URL) {
  // Production / Render — single connection string with SSL
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  };
} else {
  // Development — individual environment variables
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 's_park',
    port: parseInt(process.env.DB_PORT) || 5432,
  };
}

const pool = new Pool(poolConfig);

// Log connection mode on startup
pool.on('connect', () => {
  const mode = process.env.DATABASE_URL ? 'DATABASE_URL' : 'DB_* variables';
  console.log(`✅ PostgreSQL connected via ${mode}`);
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query
};
