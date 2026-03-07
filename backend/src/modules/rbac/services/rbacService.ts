import { pool } from '../../../db.js';
import { getCached, setCached } from './cache.js';
import type { CanResult, UserAuthzContext } from '../models/types.js';

const PERMISSION_TTL_MS = 60_000;
const MODULE_TTL_MS = 30_000;
const CONTEXT_TTL_MS = 30_000;

function permissionCacheKey(userId: string, organizationId: string | null) {
  return `rbac:permissions:${userId}:${organizationId ?? 'none'}`;
}

function moduleCacheKey(organizationId: string) {
  return `rbac:modules:${organizationId}`;
}

function contextCacheKey(userId: string) {
  return `rbac:context:${userId}`;
}

export async function getUserContext(userId: string): Promise<UserAuthzContext | null> {
  const cached = getCached<UserAuthzContext | null>(contextCacheKey(userId));
  if (cached !== null) {
    return cached;
  }

  const [rows] = await pool.query(
    `SELECT id, organization_id, role, is_root, status
     FROM users
     WHERE id = ?
       AND is_active = 1
     LIMIT 1`,
    [userId],
  );

  const row = (rows as Array<{
    id: string;
    organization_id: string | null;
    role: string;
    is_root: 0 | 1;
    status: 'active' | 'invited' | 'disabled' | null;
  }>)[0];

  if (!row) {
    setCached(contextCacheKey(userId), null, CONTEXT_TTL_MS);
    return null;
  }

  const context: UserAuthzContext = {
    userId: row.id,
    organizationId: row.organization_id,
    role: row.role,
    isRoot: row.is_root === 1 || row.role === 'root',
    status: row.status ?? 'active',
  };

  setCached(contextCacheKey(userId), context, CONTEXT_TTL_MS);
  return context;
}

export async function ensureLegacyRoleBound(userId: string, organizationId: string | null, legacyRole: string) {
  const [boundRows] = await pool.query(
    `SELECT 1
     FROM user_roles
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );

  if (Array.isArray(boundRows) && boundRows.length > 0) {
    return;
  }

  const [roleRows] = await pool.query(
    `SELECT id
     FROM roles
     WHERE slug = ?
       AND (
         (organization_id IS NULL AND is_system_role = 1)
         OR organization_id = ?
       )
     ORDER BY is_system_role DESC
     LIMIT 1`,
    [legacyRole, organizationId],
  );

  const roleId = (roleRows as Array<{ id: string }>)[0]?.id;
  if (!roleId) {
    return;
  }

  await pool.query(
    `INSERT IGNORE INTO user_roles (id, user_id, role_id)
     VALUES (UUID(), ?, ?)`,
    [userId, roleId],
  );
}

export async function getUserPermissions(userId: string, organizationId: string | null, legacyRole: string): Promise<Set<string>> {
  await ensureLegacyRoleBound(userId, organizationId, legacyRole);

  const key = permissionCacheKey(userId, organizationId);
  const cached = getCached<string[]>(key);
  if (cached) {
    return new Set(cached);
  }

  const [rows] = await pool.query(
    `SELECT DISTINCT p.slug
     FROM user_roles ur
     INNER JOIN roles r ON r.id = ur.role_id
     INNER JOIN role_permissions rp ON rp.role_id = r.id
     INNER JOIN permissions p ON p.id = rp.permission_id
     WHERE ur.user_id = ?
       AND (
         r.organization_id IS NULL
         OR r.organization_id = ?
       )`,
    [userId, organizationId],
  );

  const permissions = (rows as Array<{ slug: string }>).map((row) => row.slug);
  setCached(key, permissions, PERMISSION_TTL_MS);
  return new Set(permissions);
}

export async function getOrganizationActiveModules(organizationId: string): Promise<Set<string>> {
  const key = moduleCacheKey(organizationId);
  const cached = getCached<string[]>(key);
  if (cached) {
    return new Set(cached);
  }

  const [rows] = await pool.query(
    `SELECT DISTINCT m.slug
     FROM organization_modules om
     INNER JOIN modules m ON m.id = om.module_id
     WHERE om.organization_id = ?
       AND om.status = 'active'
       AND (om.starts_at IS NULL OR om.starts_at <= UTC_TIMESTAMP())
       AND (om.expires_at IS NULL OR om.expires_at > UTC_TIMESTAMP())
       AND m.is_active = 1`,
    [organizationId],
  );

  const moduleSlugs = (rows as Array<{ slug: string }>).map((row) => row.slug);
  setCached(key, moduleSlugs, MODULE_TTL_MS);
  return new Set(moduleSlugs);
}

export async function getPermissionRequiredModule(permissionSlug: string): Promise<string | null> {
  const [rows] = await pool.query(
    `SELECT m.slug
     FROM module_permissions mp
     INNER JOIN modules m ON m.id = mp.module_id
     INNER JOIN permissions p ON p.id = mp.permission_id
     WHERE p.slug = ?
     LIMIT 1`,
    [permissionSlug],
  );

  return (rows as Array<{ slug: string }>)[0]?.slug ?? null;
}

export async function isOrganizationActive(organizationId: string): Promise<boolean> {
  const [rows] = await pool.query(
    `SELECT 1
     FROM organizations
     WHERE id = ?
       AND is_active = 1
     LIMIT 1`,
    [organizationId],
  );

  return Array.isArray(rows) && rows.length > 0;
}

export async function canUser(userId: string, permissionSlug: string): Promise<CanResult> {
  const context = await getUserContext(userId);
  if (!context) {
    return { allowed: false, reason: 'User not found' };
  }

  if (context.isRoot) {
    return { allowed: true };
  }

  if (context.status !== 'active') {
    return { allowed: false, reason: `User status ${context.status} is not allowed` };
  }

  if (!context.organizationId) {
    return { allowed: false, reason: 'User organization is not assigned' };
  }

  const orgActive = await isOrganizationActive(context.organizationId);
  if (!orgActive) {
    return { allowed: false, reason: 'Organization is not active' };
  }

  const permissions = await getUserPermissions(userId, context.organizationId, context.role);
  if (!permissions.has(permissionSlug)) {
    return { allowed: false, reason: `Missing permission: ${permissionSlug}` };
  }

  const requiredModuleSlug = await getPermissionRequiredModule(permissionSlug);
  if (!requiredModuleSlug) {
    return { allowed: true };
  }

  const activeModules = await getOrganizationActiveModules(context.organizationId);
  if (!activeModules.has(requiredModuleSlug)) {
    return {
      allowed: false,
      reason: `Module not enabled: ${requiredModuleSlug}`,
    };
  }

  return { allowed: true };
}

export async function getUserAuthorizationSnapshot(userId: string) {
  const context = await getUserContext(userId);
  if (!context) {
    return null;
  }

  if (context.isRoot) {
    return {
      context,
      roles: ['root'],
      permissions: ['*'],
      modules: ['*'],
    };
  }

  const [rolesRows] = await pool.query(
    `SELECT DISTINCT r.slug
     FROM user_roles ur
     INNER JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = ?
       AND (
         r.organization_id IS NULL
         OR r.organization_id = ?
       )`,
    [userId, context.organizationId],
  );

  const roles = (rolesRows as Array<{ slug: string }>).map((row) => row.slug);
  const permissions = Array.from(await getUserPermissions(userId, context.organizationId, context.role));

  const modules = context.organizationId
    ? Array.from(await getOrganizationActiveModules(context.organizationId))
    : [];

  return {
    context,
    roles,
    permissions,
    modules,
  };
}
