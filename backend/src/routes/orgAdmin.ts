import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const createOrgUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'superadmin', 'member']),
  status: z.enum(['active', 'invited', 'disabled']).optional().default('active'),
});

const updateOrgUserRoleSchema = z.object({
  role: z.enum(['admin', 'superadmin', 'member']),
});

const updateOrgUserStatusSchema = z.object({
  status: z.enum(['active', 'invited', 'disabled']),
});

const updateUserModuleAccessSchema = z.object({
  moduleId: z.string().uuid(),
  grant: z.boolean(),
  expiresAt: z.string().datetime().nullable().optional(),
});

const createModuleRequestSchema = z.object({
  moduleSlug: z.string().trim().min(1),
  reason: z.string().trim().max(500).optional(),
});

const resolveModuleRequestSchema = z.object({
  action: z.enum(['approved', 'rejected']),
  note: z.string().trim().max(500).optional(),
});

const createRoleSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().optional(),
});

const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()).default([]),
});

const updateModuleSchema = z.object({
  status: z.enum(['active', 'trial', 'expired', 'suspended']),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

const updateOrgSettingsSchema = z.object({
  name: z.string().trim().min(2).optional(),
  plan: z.string().trim().min(1).optional(),
});

const createApiKeySchema = z.object({
  name: z.string().trim().min(2),
});

const orgBuyModuleSchema = z.object({
  moduleName: z.string().trim().min(1),
});

export const orgAdminRouter = Router();

function isOrgAdmin(user: AuthedRequest['user']) {
  return user.isRoot || user.role === 'admin' || user.role === 'superadmin';
}

function getOrgId(user: AuthedRequest['user']) {
  return user.organizationId ?? null;
}

type OrgPlanRow = {
  subscription_id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  auto_renew: number;
  plan_id: string;
  plan_name: string;
  display_name: string | null;
  description: string | null;
  price_monthly: string | number | null;
  price_yearly: string | number | null;
  currency: string;
  modules: string | null;
  module_count: number;
};

function parseModules(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

async function enableOrganizationModulesForPlan(organizationId: string, planId: string) {
  await pool.query(
    `INSERT INTO organization_modules (id, organization_id, module_id, status, starts_at, expires_at)
     SELECT UUID(), ?, pm.module_id, 'active', UTC_TIMESTAMP(), NULL
     FROM plan_modules pm
     WHERE pm.plan_id = ?
       AND pm.is_enabled = 1
     ON DUPLICATE KEY UPDATE
       status = 'active',
       starts_at = UTC_TIMESTAMP(),
       expires_at = NULL`,
    [organizationId, planId],
  );
}

async function getOrganizationSubscriptionDetails(organizationId: string) {
  const [rows] = await pool.query(
    `SELECT os.id AS subscription_id,
            os.status,
            os.start_date,
            os.end_date,
            os.auto_renew,
            sp.id AS plan_id,
            sp.name AS plan_name,
            sp.display_name,
            sp.description,
            sp.price_monthly,
            sp.price_yearly,
            sp.currency,
            IFNULL(GROUP_CONCAT(DISTINCT m.name ORDER BY m.name SEPARATOR ','), '') AS modules,
            COUNT(DISTINCT pm.module_id) AS module_count
     FROM organization_subscriptions os
     INNER JOIN subscription_plans sp ON sp.id = os.plan_id
     LEFT JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
     LEFT JOIN modules m ON m.id = pm.module_id
     WHERE os.organization_id = ?
     GROUP BY os.id, os.status, os.start_date, os.end_date, os.auto_renew,
              sp.id, sp.name, sp.display_name, sp.description, sp.price_monthly, sp.price_yearly, sp.currency
     ORDER BY os.created_at DESC`,
    [organizationId],
  );

  return (rows as OrgPlanRow[]).map((row) => ({
    subscriptionId: row.subscription_id,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    autoRenew: Boolean(row.auto_renew),
    plan: {
      id: row.plan_id,
      name: row.plan_name,
      displayName: row.display_name,
      description: row.description,
      priceMonthly: row.price_monthly,
      priceYearly: row.price_yearly,
      currency: row.currency,
      type: row.module_count > 1 ? 'package' : 'module',
      modules: parseModules(row.modules),
    },
  }));
}

orgAdminRouter.use(requireAuth);

orgAdminRouter.post('/module-requests', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }
  if (isOrgAdmin(authed) || authed.isRoot || authed.role === 'root') {
    return res.status(403).json({ error: 'Only members can raise module access requests' });
  }

  const parsed = createModuleRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;

  const [moduleRows] = await pool.query(
    `SELECT m.id AS module_id
     FROM organization_modules
     INNER JOIN modules m ON m.id = organization_modules.module_id
     WHERE organization_id = ?
       AND m.slug = ?
       AND status IN ('active', 'trial')
     LIMIT 1`,
    [orgId, payload.moduleSlug],
  );
  const moduleId = (moduleRows as Array<{ module_id: string }>)[0]?.module_id;
  if (!moduleId) {
    return res.status(400).json({ error: 'Module is not enabled for this organization' });
  }

  await pool.query(
    `INSERT INTO module_access_requests (id, organization_id, user_id, module_id, status, reason)
     VALUES (UUID(), ?, ?, ?, 'pending', ?)` ,
    [orgId, authed.id, moduleId, payload.reason ?? null],
  );

  return res.status(201).json({ message: 'Module access request submitted' });
});

orgAdminRouter.get('/module-requests/mine', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const [rows] = await pool.query(
    `SELECT mar.id, mar.status, mar.reason, mar.review_note, mar.created_at, mar.updated_at,
            m.name AS module_name, m.display_name AS module_display_name
     FROM module_access_requests mar
     INNER JOIN modules m ON m.id = mar.module_id
     WHERE mar.organization_id = ?
       AND mar.user_id = ?
     ORDER BY mar.created_at DESC`,
    [orgId, authed.id],
  );

  return res.json({ requests: rows });
});

orgAdminRouter.get('/module-requests', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed) && !authed.isRoot && authed.role !== 'root') {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const [rows] = await pool.query(
    `SELECT mar.id, mar.status, mar.reason, mar.review_note, mar.created_at, mar.updated_at,
            mar.user_id, mar.module_id,
            u.email AS user_email,
            m.name AS module_name, m.display_name AS module_display_name
     FROM module_access_requests mar
     INNER JOIN users u ON u.id = mar.user_id
     INNER JOIN modules m ON m.id = mar.module_id
     WHERE mar.organization_id = ?
     ORDER BY mar.created_at DESC`,
    [orgId],
  );

  return res.json({ requests: rows });
});

orgAdminRouter.patch('/module-requests/:id', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed) && !authed.isRoot && authed.role !== 'root') {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = resolveModuleRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const requestId = req.params.id;
  const [rows] = await pool.query(
    `SELECT id, user_id, module_id, status
     FROM module_access_requests
     WHERE id = ?
       AND organization_id = ?
     LIMIT 1`,
    [requestId, orgId],
  );
  const requestRow = (rows as Array<{ id: string; user_id: string; module_id: string; status: string }>)[0];
  if (!requestRow) {
    return res.status(404).json({ error: 'Request not found' });
  }
  if (requestRow.status !== 'pending') {
    return res.status(400).json({ error: 'Request already processed' });
  }

  const action = parsed.data.action;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE module_access_requests
       SET status = ?, reviewed_by = ?, review_note = ?, reviewed_at = UTC_TIMESTAMP(), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [action, authed.id, parsed.data.note ?? null, requestId],
    );

    if (action === 'approved') {
      await connection.query(
        `INSERT INTO user_module_access (id, user_id, module_id, access_granted, expires_at)
         VALUES (UUID(), ?, ?, 1, NULL)
         ON DUPLICATE KEY UPDATE access_granted = 1, expires_at = NULL`,
        [requestRow.user_id, requestRow.module_id],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return res.json({ message: action === 'approved' ? 'Request approved' : 'Request rejected' });
});

orgAdminRouter.get('/overview', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const [orgRows] = await pool.query(
    `SELECT id, name, slug, plan, is_active, owner_user_id, created_at, updated_at
     FROM organizations
     WHERE id = ?
     LIMIT 1`,
    [orgId],
  );
  const orgRow = (orgRows as Array<Record<string, unknown>>)[0] ?? null;

  const [userCountRows] = await pool.query(
    `SELECT role, status, COUNT(*) AS count
     FROM users
     WHERE organization_id = ?
     GROUP BY role, status`,
    [orgId],
  );

  const [moduleRows] = await pool.query(
    `SELECT om.status, COUNT(*) AS count
     FROM organization_modules om
     WHERE om.organization_id = ?
     GROUP BY om.status`,
    [orgId],
  );

  return res.json({
    organization: orgRow ?? null,
    userBreakdown: userCountRows,
    moduleBreakdown: moduleRows,
  });
});

orgAdminRouter.get('/users', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const [rows] = await pool.query(
    `SELECT id, email, role, status, is_root, is_active, created_at, updated_at
     FROM users
     WHERE organization_id = ?
     ORDER BY created_at ASC`,
    [orgId],
  );

  return res.json({ users: rows });
});

orgAdminRouter.post('/users', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = createOrgUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;

  const [existingRows] = await pool.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [payload.email]);
  if (Array.isArray(existingRows) && existingRows.length > 0) {
    return res.status(409).json({ error: 'Email is already registered' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO users (id, email, password_hash, role, is_root, organization_id, status, is_active)
       VALUES (UUID(), ?, SHA2(?, 256), ?, 0, ?, ?, ?)`,
      [payload.email, payload.password, payload.role, orgId, payload.status, payload.status === 'disabled' ? 0 : 1],
    );

    await connection.query(
      `INSERT IGNORE INTO user_roles (id, user_id, role_id)
       SELECT UUID(), u.id, r.id
       FROM users u
       INNER JOIN roles r ON r.slug = ? AND (r.organization_id IS NULL OR r.organization_id = ?)
       WHERE u.email = ?
       LIMIT 1`,
      [payload.role, orgId, payload.email],
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

orgAdminRouter.patch('/users/:id/role', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = updateOrgUserRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const userId = req.params.id;

  const [rows] = await pool.query(
    `SELECT id, is_root
     FROM users
     WHERE id = ?
       AND organization_id = ?
     LIMIT 1`,
    [userId, orgId],
  );

  const row = (rows as Array<{ id: string; is_root: 0 | 1 }>)[0];
  if (!row) {
    return res.status(404).json({ error: 'User not found in organization' });
  }
  if (row.is_root === 1) {
    return res.status(403).json({ error: 'Root user cannot be modified' });
  }

  await pool.query(
    `UPDATE users
     SET role = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [parsed.data.role, userId],
  );

  return res.json({ message: 'User role updated' });
});

orgAdminRouter.patch('/users/:id/status', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = updateOrgUserStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const userId = req.params.id;
  const [rows] = await pool.query(
    `SELECT id, is_root
     FROM users
     WHERE id = ?
       AND organization_id = ?
     LIMIT 1`,
    [userId, orgId],
  );

  const row = (rows as Array<{ id: string; is_root: 0 | 1 }>)[0];
  if (!row) {
    return res.status(404).json({ error: 'User not found in organization' });
  }
  if (row.is_root === 1) {
    return res.status(403).json({ error: 'Root user cannot be modified' });
  }

  const status = parsed.data.status;
  await pool.query(
    `UPDATE users
     SET status = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, status === 'disabled' ? 0 : 1, userId],
  );

  return res.json({ message: 'User status updated' });
});

orgAdminRouter.get('/users/:id/modules', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const userId = req.params.id;
  const [userRows] = await pool.query(
    `SELECT id, role
     FROM users
     WHERE id = ?
       AND organization_id = ?
     LIMIT 1`,
    [userId, orgId],
  );

  const targetUser = (userRows as Array<{ id: string; role: string }>)[0];
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found in organization' });
  }
  if (targetUser.role !== 'member') {
    return res.status(400).json({ error: 'Module grants are only allowed for member users' });
  }

  const [rows] = await pool.query(
    `SELECT m.id, m.name, m.slug, m.display_name,
            om.status AS organization_module_status,
            uma.access_granted,
            uma.expires_at
     FROM organization_modules om
     INNER JOIN modules m ON m.id = om.module_id AND m.is_active = 1
     LEFT JOIN user_module_access uma
       ON uma.user_id = ?
      AND uma.module_id = m.id
     WHERE om.organization_id = ?
       AND om.status IN ('active', 'trial')
     ORDER BY m.name ASC`,
    [userId, orgId],
  );

  return res.json({ modules: rows });
});

orgAdminRouter.patch('/users/:id/modules', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const userId = req.params.id;
  const parsed = updateUserModuleAccessSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const [userRows] = await pool.query(
    `SELECT id, role
     FROM users
     WHERE id = ?
       AND organization_id = ?
     LIMIT 1`,
    [userId, orgId],
  );

  const targetUser = (userRows as Array<{ id: string; role: string }>)[0];
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found in organization' });
  }
  if (targetUser.role !== 'member') {
    return res.status(400).json({ error: 'Module grants are only allowed for member users' });
  }

  const [moduleRows] = await pool.query(
    `SELECT 1
     FROM organization_modules
     WHERE organization_id = ?
       AND module_id = ?
       AND status IN ('active', 'trial')
     LIMIT 1`,
    [orgId, payload.moduleId],
  );
  if (!Array.isArray(moduleRows) || moduleRows.length === 0) {
    return res.status(400).json({ error: 'Module is not enabled for this organization' });
  }

  await pool.query(
    `INSERT INTO user_module_access (id, user_id, module_id, access_granted, expires_at)
     VALUES (UUID(), ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       access_granted = VALUES(access_granted),
       expires_at = VALUES(expires_at)`,
    [userId, payload.moduleId, payload.grant ? 1 : 0, payload.expiresAt ?? null],
  );

  return res.json({ message: payload.grant ? 'Module access granted' : 'Module access revoked' });
});

orgAdminRouter.get('/roles', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const [rows] = await pool.query(
    `SELECT id, organization_id, name, slug, description, is_system_role, created_at, updated_at
     FROM roles
     WHERE organization_id = ?
        OR (organization_id IS NULL AND slug IN ('admin','superadmin','member'))
     ORDER BY is_system_role DESC, name ASC`,
    [orgId],
  );

  return res.json({ roles: rows });
});

orgAdminRouter.post('/roles', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = createRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  await pool.query(
    `INSERT INTO roles (id, organization_id, name, slug, description, is_system_role)
     VALUES (UUID(), ?, ?, ?, ?, 0)`,
    [orgId, payload.name, payload.slug, payload.description ?? null],
  );

  return res.status(201).json({ message: 'Role created' });
});

orgAdminRouter.get('/permissions', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const [rows] = await pool.query(
    `SELECT id, name, slug, resource, action, description
     FROM permissions
     ORDER BY resource ASC, action ASC`,
  );

  return res.json({ permissions: rows });
});

orgAdminRouter.get('/roles/:id/permissions', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const roleId = req.params.id;
  const [roleRows] = await pool.query(
    `SELECT id
     FROM roles
     WHERE id = ?
       AND (organization_id = ? OR organization_id IS NULL)
     LIMIT 1`,
    [roleId, orgId],
  );
  if (!Array.isArray(roleRows) || roleRows.length === 0) {
    return res.status(404).json({ error: 'Role not found' });
  }

  const [rows] = await pool.query(
    `SELECT p.id, p.slug
     FROM role_permissions rp
     INNER JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = ?`,
    [roleId],
  );

  return res.json({ permissions: rows });
});

orgAdminRouter.put('/roles/:id/permissions', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const roleId = req.params.id;
  const parsed = updateRolePermissionsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const [roleRows] = await pool.query(
    `SELECT id, is_system_role
     FROM roles
     WHERE id = ?
       AND (organization_id = ? OR organization_id IS NULL)
     LIMIT 1`,
    [roleId, orgId],
  );

  const role = (roleRows as Array<{ id: string; is_system_role: 0 | 1 }>)[0];
  if (!role) {
    return res.status(404).json({ error: 'Role not found' });
  }

  if (role.is_system_role === 1) {
    return res.status(403).json({ error: 'System role permissions cannot be modified here' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);

    if (parsed.data.permissionIds.length > 0) {
      await connection.query(
        `INSERT INTO role_permissions (id, role_id, permission_id)
         SELECT UUID(), ?, p.id
         FROM permissions p
         WHERE p.id IN (${parsed.data.permissionIds.map(() => '?').join(',')})`,
        [roleId, ...parsed.data.permissionIds],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return res.json({ message: 'Role permissions updated' });
});

orgAdminRouter.get('/modules', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const [rows] = await pool.query(
    `SELECT m.id, m.name, m.slug, m.display_name, m.description, m.is_core, m.is_active,
            om.id AS organization_module_id,
            om.status,
            om.starts_at,
            om.expires_at
     FROM modules m
     LEFT JOIN organization_modules om
       ON om.module_id = m.id
      AND om.organization_id = ?
     WHERE m.is_active = 1
     ORDER BY m.name ASC`,
    [orgId],
  );

  return res.json({ modules: rows });
});

orgAdminRouter.patch('/modules/:moduleId', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!authed.isRoot && authed.role !== 'root') {
    return res.status(403).json({ error: 'Root access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = updateModuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const moduleId = req.params.moduleId;
  const payload = parsed.data;

  await pool.query(
    `INSERT INTO organization_modules (id, organization_id, module_id, status, starts_at, expires_at)
     VALUES (UUID(), ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       starts_at = VALUES(starts_at),
       expires_at = VALUES(expires_at)`,
    [orgId, moduleId, payload.status, payload.startsAt ?? null, payload.expiresAt ?? null],
  );

  return res.json({ message: 'Module configuration updated' });
});

orgAdminRouter.get('/settings', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const [rows] = await pool.query(
    `SELECT id, name, slug, plan, is_active, owner_user_id, created_at, updated_at
     FROM organizations
     WHERE id = ?
     LIMIT 1`,
    [orgId],
  );

  return res.json({ organization: (rows as unknown[])[0] ?? null });
});

orgAdminRouter.patch('/settings', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = updateOrgSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  await pool.query(
    `UPDATE organizations
     SET name = COALESCE(?, name),
         plan = COALESCE(?, plan),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [payload.name ?? null, payload.plan ?? null, orgId],
  );

  return res.json({ message: 'Organization settings updated' });
});

orgAdminRouter.get('/reports', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const [userByStatus] = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM users
     WHERE organization_id = ?
     GROUP BY status`,
    [orgId],
  );

  const [userByRole] = await pool.query(
    `SELECT role, COUNT(*) AS count
     FROM users
     WHERE organization_id = ?
     GROUP BY role`,
    [orgId],
  );

  const [moduleByStatus] = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM organization_modules
     WHERE organization_id = ?
     GROUP BY status`,
    [orgId],
  );

  return res.json({ userByStatus, userByRole, moduleByStatus });
});

orgAdminRouter.get('/billing/catalog/modules', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const [rows] = await pool.query(
    `SELECT m.id AS module_id, m.name AS module_name, m.slug AS module_slug, m.display_name, m.description,
            sp.name AS plan_name, sp.display_name AS plan_display_name, sp.price_monthly, sp.price_yearly, sp.currency
     FROM modules m
     INNER JOIN plan_modules pm ON pm.module_id = m.id AND pm.is_enabled = 1
     INNER JOIN (
       SELECT plan_id
       FROM plan_modules
       WHERE is_enabled = 1
       GROUP BY plan_id
       HAVING COUNT(*) = 1
     ) single_module_plans ON single_module_plans.plan_id = pm.plan_id
     INNER JOIN subscription_plans sp ON sp.id = single_module_plans.plan_id AND sp.is_active = 1
     WHERE m.is_active = 1
       AND IFNULL(sp.price_monthly, 0) > 0
     ORDER BY m.display_name ASC`,
  );

  return res.json({ modules: rows });
});

orgAdminRouter.get('/billing/subscriptions', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const subscriptions = await getOrganizationSubscriptionDetails(orgId);
  return res.json({ subscriptions });
});

orgAdminRouter.post('/billing/buy-module', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = orgBuyModuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const [planRows] = await pool.query(
    `SELECT sp.id AS plan_id
     FROM subscription_plans sp
     INNER JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
     INNER JOIN modules m ON m.id = pm.module_id AND m.is_active = 1
     WHERE m.name = ?
       AND sp.is_active = 1
       AND IFNULL(sp.price_monthly, 0) > 0
     GROUP BY sp.id
     HAVING COUNT(pm.module_id) = 1
     LIMIT 1`,
    [parsed.data.moduleName],
  );

  const planId = (planRows as Array<{ plan_id: string }>)[0]?.plan_id;
  if (!planId) {
    return res.status(404).json({ error: 'Module purchase plan not found' });
  }

  await pool.query(
    `INSERT INTO organization_subscriptions (id, organization_id, plan_id, status, start_date, end_date, auto_renew)
     VALUES (UUID(), ?, ?, 'active', UTC_TIMESTAMP(), NULL, 1)
     ON DUPLICATE KEY UPDATE status = 'active', start_date = UTC_TIMESTAMP(), end_date = NULL, updated_at = CURRENT_TIMESTAMP`,
    [orgId, planId],
  );
  await enableOrganizationModulesForPlan(orgId, planId);

  const subscriptions = await getOrganizationSubscriptionDetails(orgId);
  return res.status(201).json({ message: 'Module purchased for organization', subscriptions });
});


orgAdminRouter.get('/billing', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const subscriptions = await getOrganizationSubscriptionDetails(orgId);
  return res.json({ subscriptions });
});

orgAdminRouter.get('/api-keys', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const [rows] = await pool.query(
    `SELECT id, name, key_prefix, is_active, last_used_at, created_at
     FROM organization_api_keys
     WHERE organization_id = ?
     ORDER BY created_at DESC`,
    [orgId],
  );

  return res.json({ apiKeys: rows });
});

orgAdminRouter.post('/api-keys', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const parsed = createApiKeySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const rawKey = `karta_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 12);

  await pool.query(
    `INSERT INTO organization_api_keys (id, organization_id, name, key_hash, key_prefix, is_active)
     VALUES (UUID(), ?, ?, ?, ?, 1)`,
    [orgId, parsed.data.name, keyHash, keyPrefix],
  );

  return res.status(201).json({ apiKey: rawKey, keyPrefix });
});

orgAdminRouter.delete('/api-keys/:id', async (req, res) => {
  const authed = (req as unknown as AuthedRequest).user;
  if (!isOrgAdmin(authed)) {
    return res.status(403).json({ error: 'Organization admin access required' });
  }

  const orgId = getOrgId(authed);
  if (!orgId) {
    return res.status(400).json({ error: 'Organization not assigned' });
  }

  const id = req.params.id;
  await pool.query(
    `UPDATE organization_api_keys
     SET is_active = 0, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND organization_id = ?`,
    [id, orgId],
  );

  return res.json({ message: 'API key revoked' });
});
