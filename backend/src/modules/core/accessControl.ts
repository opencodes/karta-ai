import { pool } from '../../db.js';

export async function getUserEntitledModules(userId: string): Promise<string[]> {
  const [userRows] = await pool.query(
    `SELECT role
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId],
  );

  const role = (userRows as Array<{ role: 'root' | 'superadmin' | 'admin' | 'member' }>)[0]?.role;

  const [cachedRows] = await pool.query(
    `SELECT DISTINCT m.name AS module_name
     FROM user_module_access uma
     INNER JOIN modules m ON m.id = uma.module_id
     WHERE uma.user_id = ?
       AND uma.access_granted = 1
       AND (uma.expires_at IS NULL OR uma.expires_at > UTC_TIMESTAMP())
       AND m.is_active = 1`,
    [userId],
  );

  const modules = new Set<string>();

  for (const row of cachedRows as Array<{ module_name: string }>) {
    modules.add(row.module_name);
  }

  // Members should only access modules explicitly granted by org admins.
  // Subscriptions are still considered for non-member users.
  if (role && role !== 'member') {
    const [subscriptionRows] = await pool.query(
      `SELECT DISTINCT m.name AS module_name
       FROM user_subscriptions us
       INNER JOIN subscription_plans sp ON sp.id = us.plan_id AND sp.is_active = 1
       INNER JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
       INNER JOIN modules m ON m.id = pm.module_id AND m.is_active = 1
       WHERE us.user_id = ?
         AND us.status = 'active'
         AND (us.end_date IS NULL OR us.end_date > UTC_TIMESTAMP())`,
      [userId],
    );

    for (const row of subscriptionRows as Array<{ module_name: string }>) {
      modules.add(row.module_name);
    }
  }

  return [...modules];
}

export async function isOrganizationEntitledToModule(organizationId: string, moduleName: string): Promise<boolean> {
  const [rows] = await pool.query(
    `SELECT 1
     FROM organization_modules om
     INNER JOIN modules m ON m.id = om.module_id
     WHERE om.organization_id = ?
       AND m.name = ?
       AND om.status = 'active'
       AND (om.starts_at IS NULL OR om.starts_at <= UTC_TIMESTAMP())
       AND (om.expires_at IS NULL OR om.expires_at > UTC_TIMESTAMP())
       AND m.is_active = 1
     LIMIT 1`,
    [organizationId, moduleName],
  );

  return Array.isArray(rows) && rows.length > 0;
}

export async function isUserEntitledToModule(userId: string, moduleName: string): Promise<boolean> {
  const entitledModules = await getUserEntitledModules(userId);
  return entitledModules.includes(moduleName);
}
