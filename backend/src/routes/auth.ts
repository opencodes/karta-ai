import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { createAuthToken } from '../utils/token.js';
import type { UserDto, UserRecord } from '../types.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function toUserDto(row: Pick<UserRecord, 'id' | 'email' | 'role'>): UserDto {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
  };
}

export const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
  const parsedBody = signupSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsedBody.error.flatten() });
  }

  const { email, password } = parsedBody.data;

  const [existingRows] = await pool.query(
    `SELECT id FROM users WHERE email = ? LIMIT 1`,
    [email],
  );

  if (Array.isArray(existingRows) && existingRows.length > 0) {
    return res.status(409).json({ error: 'Email is already registered' });
  }

  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, is_active)
     VALUES (UUID(), ?, SHA2(?, 256), 'member', 1)`,
    [email, password],
  );

  const [rows] = await pool.query(
    `SELECT * FROM users
     WHERE email = ? AND is_active = 1
     LIMIT 1`,
    [email],
  );

  const row = (rows as UserRecord[])[0];
  if (!row) {
    return res.status(500).json({ error: 'Failed to create user' });
  }

  const user = toUserDto(row);
  const token = createAuthToken({ sub: user.id, email: user.email, role: user.role });

  return res.status(201).json({ token, user });
});

authRouter.post('/login', async (req, res) => {
  const parsedBody = loginSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsedBody.error.flatten() });
  }

  const { email, password } = parsedBody.data;

  const [rows] = await pool.query(
    `SELECT * FROM users
     WHERE email = ? AND password_hash = SHA2(?, 256) AND is_active = 1
     LIMIT 1`,
    [email, password],
  );

  const row = (rows as UserRecord[])[0];
  if (!row) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = toUserDto(row);
  const token = createAuthToken({ sub: user.id, email: user.email, role: user.role });

  return res.json({ token, user });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).user.id;

  const [rows] = await pool.query(
    `SELECT * FROM users WHERE id = ? AND is_active = 1 LIMIT 1`,
    [userId],
  );

  const row = (rows as UserRecord[])[0];
  if (!row) {
    return res.status(401).json({ error: 'User not found or inactive' });
  }

  return res.json({ user: toUserDto(row) });
});
