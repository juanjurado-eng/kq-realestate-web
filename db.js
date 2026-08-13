const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'postgres',
  port: +(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'n8n',
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 8,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
});

pool.on('error', (err) => console.error('PG pool error', err.message));

module.exports = { pool, q: (text, params) => pool.query(text, params) };
