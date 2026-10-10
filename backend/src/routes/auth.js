import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { signToken, requireUser } from '../middleware/auth.js';
import { ApiError } from '../middleware/errors.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, displayName, password } = req.body || {};
    if (!email || !password || !displayName) {
      throw new ApiError(400, 'email, displayName and password are required');
    }
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters');
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (email, display_name, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, display_name`,
      [email.toLowerCase(), displayName, hash]
    );
    if (!rows.length) throw new ApiError(409, 'Email already registered', 'Conflict');

    res.status(201).json({ token: signToken(rows[0]), user: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) throw new ApiError(400, 'email and password are required');

    const { rows } = await query(
      `SELECT id, email, display_name, password_hash FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) throw new ApiError(401, 'Invalid email or password', 'Unauthorized');

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
authRouter.get('/me', requireUser, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, email, display_name, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows.length) throw new ApiError(404, 'User not found', 'Not Found');
    res.json(publicUser(rows[0]));
  } catch (err) {
    next(err);
  }
});

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.display_name,
    createdAt: u.created_at,
  };
}
