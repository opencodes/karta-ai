import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { createAuthToken } from '../utils/token.js';
import type { UserDto, UserRecord } from '../types.js';
import { roleToSubscription } from '../modules/core/billing.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const updateMyProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phoneNumber: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'superadmin', 'member']),
});

const createUserByRootSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  organizationId: z.string().uuid(),
  role: z.enum(['admin', 'superadmin', 'member']),
  status: z.enum(['active', 'invited', 'disabled']).optional().default('active'),
});

const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'invited', 'disabled']),
});

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/).optional(),
  plan: z.string().trim().min(1).optional(),
  ownerUserId: z.string().uuid().optional(),
});

const updateOrganizationStatusSchema = z.object({
  isActive: z.boolean(),
});

const updateOrganizationOwnerSchema = z.object({
  ownerUserId: z.string().uuid().nullable(),
});

function toUserDto(
  row: Pick<UserRecord, 'id' | 'email' | 'role' | 'is_root'> & Partial<Pick<UserRecord, 'full_name' | 'phone_number'>>,
): UserDto {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? null,
    phoneNumber: row.phone_number ?? null,
    role: row.role,
    isRoot: row.is_root === 1,
    subscription: roleToSubscription(row.role),
  };
}

export const authRouter = Router();

function makeOrganizationSlug(email: string): string {
  const local = email.split('@')[0] ?? 'org';
  const base = local.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'org';
  return `${base}-${Date.now().toString(36)}`;
}

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

  const userId = crypto.randomUUID();
  const organizationId = crypto.randomUUID();
  const organizationName = `${email.split('@')[0] ?? 'Member'} Organization`;
  const organizationSlug = makeOrganizationSlug(email);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO organizations (id, name, slug, owner_user_id, plan, is_active)
       VALUES (?, ?, ?, NULL, 'starter', 1)`,
      [organizationId, organizationName, organizationSlug],
    );

    await connection.query(
      `INSERT INTO users (id, email, full_name, phone_number, password_hash, role, organization_id, status, is_active)
       VALUES (?, ?, ?, NULL, SHA2(?, 256), 'member', ?, 'active', 1)`,
      [userId, email, (email.split('@')[0] ?? '').slice(0, 120), password, organizationId],
    );

    await connection.query(
      `UPDATE organizations
       SET owner_user_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [userId, organizationId],
    );

    await connection.query(
      `INSERT IGNORE INTO user_roles (id, user_id, role_id)
       SELECT UUID(), ?, id
       FROM roles
       WHERE slug = 'member' AND is_system_role = 1
       LIMIT 1`,
      [userId],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

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
  const token = createAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    isRoot: user.isRoot,
    organizationId: row.organization_id ?? undefined,
    subscription: user.subscription,
  });

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
  const token = createAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    isRoot: user.isRoot,
    organizationId: row.organization_id ?? undefined,
    subscription: user.subscription,
  });

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

authRouter.patch('/me/profile', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const parsed = updateMyProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  await pool.query(
    `UPDATE users
     SET full_name = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [parsed.data.fullName, parsed.data.phoneNumber, authed.id],
  );

  const [rows] = await pool.query(
    `SELECT * FROM users WHERE id = ? AND is_active = 1 LIMIT 1`,
    [authed.id],
  );
  const row = (rows as UserRecord[])[0];
  if (!row) {
    return res.status(404).json({ error: 'User not found or inactive' });
  }

  return res.json({ user: toUserDto(row), message: 'Profile updated' });
});

authRouter.get('/users', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot) {
    return res.status(403).json({ error: 'Root access required' });
  }

  const [rows] = await pool.query(
    `SELECT u.id, u.email, u.role, u.status, u.is_root, u.is_active, u.organization_id, u.created_at,
            o.name AS organization_name, o.slug AS organization_slug
     FROM users u
     LEFT JOIN organizations o ON o.id = u.organization_id
     ORDER BY u.created_at ASC`,
  );

  const users = (rows as Array<Pick<UserRecord, 'id' | 'email' | 'role' | 'is_root' | 'organization_id' | 'status'> & {
    is_active: 0 | 1;
    created_at: Date;
    organization_name: string | null;
    organization_slug: string | null;
  }>)
    .map((row) => ({
      ...toUserDto(row),
      isActive: row.is_active === 1,
      status: row.status ?? 'active',
      organizationId: row.organization_id,
      organizationName: row.organization_name,
      organizationSlug: row.organization_slug,
      createdAt: row.created_at,
    }));

  return res.json({ users });
});

authRouter.post('/users', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot) {
    return res.status(403).json({ error: 'Root access required' });
  }

  const parsed = createUserByRootSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;

  const [existingRows] = await pool.query(
    `SELECT id FROM users WHERE email = ? LIMIT 1`,
    [payload.email],
  );
  if (Array.isArray(existingRows) && existingRows.length > 0) {
    return res.status(409).json({ error: 'Email is already registered' });
  }

  const [orgRows] = await pool.query(
    `SELECT id FROM organizations WHERE id = ? LIMIT 1`,
    [payload.organizationId],
  );
  if (!Array.isArray(orgRows) || orgRows.length === 0) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO users (id, email, password_hash, role, is_root, organization_id, status, is_active)
       VALUES (UUID(), ?, SHA2(?, 256), ?, 0, ?, ?, ?)`,
      [
        payload.email,
        payload.password,
        payload.role,
        payload.organizationId,
        payload.status,
        payload.status === 'disabled' ? 0 : 1,
      ],
    );

    await connection.query(
      `INSERT IGNORE INTO user_roles (id, user_id, role_id)
       SELECT UUID(), u.id, r.id
       FROM users u
       INNER JOIN roles r ON r.slug = ? AND r.is_system_role = 1
       WHERE u.email = ?
       LIMIT 1`,
      [payload.role, payload.email],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return res.status(201).json({ message: 'User created' });
});

authRouter.patch('/users/:id/role', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot) {
    return res.status(403).json({ error: 'Root access required' });
  }

  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { id } = req.params;

  const [targetRows] = await pool.query(
    `SELECT id, email, role, is_root
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  const target = (targetRows as UserRecord[])[0];
  if (!target) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (target.is_root === 1) {
    return res.status(403).json({ error: 'Root role cannot be modified' });
  }

  await pool.query(
    `UPDATE users
     SET role = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [parsed.data.role, id],
  );

  const [updatedRows] = await pool.query(
    `SELECT id, email, role, is_root
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  const updated = (updatedRows as UserRecord[])[0];
  return res.json({ user: toUserDto(updated) });
});

authRouter.patch('/users/:id/status', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot) {
    return res.status(403).json({ error: 'Root access required' });
  }

  const parsed = updateUserStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { id } = req.params;

  const [targetRows] = await pool.query(
    `SELECT id, is_root
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  const target = (targetRows as Array<{ id: string; is_root: 0 | 1 }>)[0];
  if (!target) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (target.is_root === 1) {
    return res.status(403).json({ error: 'Root user status cannot be modified' });
  }

  const status = parsed.data.status;
  const isActive = status !== 'disabled' ? 1 : 0;

  await pool.query(
    `UPDATE users
     SET status = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, isActive, id],
  );

  return res.json({ message: 'User status updated' });
});

authRouter.get('/organizations', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot) {
    return res.status(403).json({ error: 'Root access required' });
  }

  const [rows] = await pool.query(
    `SELECT o.id, o.name, o.slug, o.plan, o.is_active, o.owner_user_id, o.created_at, o.updated_at,
            owner.email AS owner_email,
            COUNT(u.id) AS user_count
     FROM organizations o
     LEFT JOIN users owner ON owner.id = o.owner_user_id
     LEFT JOIN users u ON u.organization_id = o.id
     GROUP BY o.id, o.name, o.slug, o.plan, o.is_active, o.owner_user_id, o.created_at, o.updated_at, owner.email
     ORDER BY o.created_at ASC`,
  );

  return res.json({
    organizations: (rows as Array<{
      id: string;
      name: string;
      slug: string;
      plan: string;
      is_active: 0 | 1;
      owner_user_id: string | null;
      owner_email: string | null;
      user_count: number;
      created_at: Date;
      updated_at: Date;
    }>).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      isActive: row.is_active === 1,
      ownerUserId: row.owner_user_id,
      ownerEmail: row.owner_email,
      userCount: Number(row.user_count ?? 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
});

authRouter.post('/organizations', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot) {
    return res.status(403).json({ error: 'Root access required' });
  }

  const parsed = createOrganizationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const slug = payload.slug ?? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  await pool.query(
    `INSERT INTO organizations (id, name, slug, owner_user_id, plan, is_active)
     VALUES (UUID(), ?, ?, ?, ?, 1)`,
    [payload.name, slug, payload.ownerUserId ?? null, payload.plan ?? 'starter'],
  );

  return res.status(201).json({ message: 'Organization created' });
});

authRouter.patch('/organizations/:id/status', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot) {
    return res.status(403).json({ error: 'Root access required' });
  }

  const parsed = updateOrganizationStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { id } = req.params;
  await pool.query(
    `UPDATE organizations
     SET is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [parsed.data.isActive ? 1 : 0, id],
  );

  return res.json({ message: 'Organization status updated' });
});

authRouter.patch('/organizations/:id/owner', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot) {
    return res.status(403).json({ error: 'Root access required' });
  }

  const parsed = updateOrganizationOwnerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { id } = req.params;
  const ownerUserId = parsed.data.ownerUserId;

  if (ownerUserId) {
    const [userRows] = await pool.query(
      `SELECT id
       FROM users
       WHERE id = ?
         AND organization_id = ?
       LIMIT 1`,
      [ownerUserId, id],
    );
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return res.status(400).json({ error: 'Owner user must belong to the same organization' });
    }
  }

  await pool.query(
    `UPDATE organizations
     SET owner_user_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [ownerUserId, id],
  );

  return res.json({ message: 'Organization owner updated' });
});
