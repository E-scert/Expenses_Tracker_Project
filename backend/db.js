require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'expense_trancter_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'prince',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});

/**
 * Runs `fn(client)` inside a transaction with `app.current_user_id`
 * set as a LOCAL (transaction-scoped) config value, so the schema's
 * row-level-security policies (which read current_setting('app.current_user_id'))
 * are honoured for every statement run inside `fn`.
 *
 * Pass `userId = null` for operations that happen before a user context
 * exists yet (e.g. creating a brand new user).
 */
async function runWithUser(userId, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (userId !== null && userId !== undefined) {
      // set_config(..., true) => LOCAL, scoped to this transaction only
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(userId)]);
    }
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, runWithUser };
