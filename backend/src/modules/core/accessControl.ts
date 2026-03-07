import { pool } from '../../db.js';

export async function getUserEntitledModules(userId: string): Promise<string[]> {
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

  const modules = new Set<string>();

  for (const row of cachedRows as Array<{ module_name: string }>) {
    modules.add(row.module_name);
  }

  for (const row of subscriptionRows as Array<{ module_name: string }>) {
    modules.add(row.module_name);
  }

  return [...modules];
}

export async function isUserEntitledToModule(userId: string, moduleName: string): Promise<boolean> {
  const entitledModules = await getUserEntitledModules(userId);
  return entitledModules.includes(moduleName);
}
