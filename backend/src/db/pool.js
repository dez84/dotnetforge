import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://dotnetforge:dotnetforge@localhost:5432/dotnetforge',
  max: 10,
  idleTimeoutMillis: 30_000,
});

export const query = (text, params) => pool.query(text, params);

// Wrap a function in a transaction. Usage: await tx(async (c) => { ... })
export async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
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
