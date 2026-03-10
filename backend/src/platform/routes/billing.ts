import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../db.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { getUserEntitledModules } from '../../modules/core/accessControl.js';

const buyModuleSchema = z.object({
  moduleName: z.string().trim().min(1),
});

const createModuleSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  displayName: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  icon: z.string().trim().optional().nullable(),
  routePrefix: z.string().trim().optional().nullable(),
  version: z.string().trim().optional().nullable(),
  isCore: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

const resolveOrgSubscriptionSchema = z.object({
  action: z.enum(['approved', 'rejected']),
});

export const billingRouter = Router();

type PlanRow = {
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

function parseModules(value: PlanRow['modules']): string[] {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

async function getUserSubscriptionDetails(userId: string) {
  const [rows] = await pool.query(
    `SELECT us.id AS subscription_id,
            us.status,
            us.start_date,
            us.end_date,
            us.auto_renew,
            us.payment_provider,
            us.provider_subscription_id,
            sp.id AS plan_id,
            sp.name AS plan_name,
            sp.display_name,
            sp.description,
            sp.price_monthly,
            sp.price_yearly,
            sp.currency,
            IFNULL(GROUP_CONCAT(DISTINCT m.name ORDER BY m.name SEPARATOR ','), '') AS modules,
            COUNT(DISTINCT pm.module_id) AS module_count
     FROM user_subscriptions us
     INNER JOIN subscription_plans sp ON sp.id = us.plan_id
     LEFT JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
     LEFT JOIN modules m ON m.id = pm.module_id
     WHERE us.user_id = ?
     GROUP BY us.id, us.status, us.start_date, us.end_date, us.auto_renew, us.payment_provider, us.provider_subscription_id,
              sp.id, sp.name, sp.display_name, sp.description, sp.price_monthly, sp.price_yearly, sp.currency
     ORDER BY us.created_at DESC`,
    [userId],
  );

  return (rows as Array<PlanRow & {
    subscription_id: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    auto_renew: number;
    payment_provider: string | null;
    provider_subscription_id: string | null;
  }>).map((row) => ({
    subscriptionId: row.subscription_id,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    renewDate: row.end_date,
    autoRenew: Boolean(row.auto_renew),
    paymentProvider: row.payment_provider,
    providerSubscriptionId: row.provider_subscription_id,
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

billingRouter.get('/catalog/modules', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT m.name AS module_name, m.display_name, m.description, m.icon, m.route_prefix, m.version,
            sp.name AS plan_name, sp.price_monthly, sp.price_yearly, sp.currency
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

billingRouter.get('/admin/modules', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot && authed.role !== 'root') {
    return res.status(403).json({ error: 'Root access required' });
  }

  const [rows] = await pool.query(
    `SELECT id, name, slug, display_name, description, icon, route_prefix, version, is_core, is_active, created_at
     FROM modules
     ORDER BY name ASC`,
  );

  return res.json({ modules: rows });
});

billingRouter.post('/admin/modules', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot && authed.role !== 'root') {
    return res.status(403).json({ error: 'Root access required' });
  }

  const parsed = createModuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;

  const [existingRows] = await pool.query(
    `SELECT id
     FROM modules
     WHERE slug = ? OR name = ?
     LIMIT 1`,
    [payload.slug, payload.name],
  );

  if (Array.isArray(existingRows) && existingRows.length > 0) {
    return res.status(409).json({ error: 'Module name or slug already exists' });
  }

  await pool.query(
    `INSERT INTO modules (id, name, slug, display_name, description, icon, route_prefix, version, is_core, is_active)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.slug,
      payload.displayName ?? null,
      payload.description ?? null,
      payload.icon ?? null,
      payload.routePrefix ?? null,
      payload.version ?? null,
      payload.isCore ? 1 : 0,
      payload.isActive ? 1 : 0,
    ],
  );

  return res.status(201).json({ message: 'Module created' });
});

billingRouter.get('/admin/org-module-requests', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot && authed.role !== 'root') {
    return res.status(403).json({ error: 'Root access required' });
  }

  const [rows] = await pool.query(
    `SELECT os.id AS subscription_id,
            os.organization_id,
            os.plan_id,
            os.status,
            os.start_date,
            os.end_date,
            os.created_at,
            os.updated_at,
            o.name AS organization_name,
            o.slug AS organization_slug,
            sp.name AS plan_name,
            sp.display_name AS plan_display_name,
            IFNULL(GROUP_CONCAT(DISTINCT m.name ORDER BY m.name SEPARATOR ','), '') AS modules
     FROM organization_subscriptions os
     INNER JOIN organizations o ON o.id = os.organization_id
     INNER JOIN subscription_plans sp ON sp.id = os.plan_id
     LEFT JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
     LEFT JOIN modules m ON m.id = pm.module_id
     WHERE os.status IN ('pending_approval', 'approved', 'rejected')
     GROUP BY os.id, os.organization_id, os.plan_id, os.status, os.start_date, os.end_date, os.created_at, os.updated_at,
              o.name, o.slug, sp.name, sp.display_name
     ORDER BY os.updated_at DESC`,
  );

  const requests = (rows as Array<{
    subscription_id: string;
    organization_id: string;
    plan_id: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
    organization_name: string;
    organization_slug: string;
    plan_name: string;
    plan_display_name: string | null;
    modules: string | null;
  }>).map((row) => ({
    subscriptionId: row.subscription_id,
    organizationId: row.organization_id,
    planId: row.plan_id,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizationName: row.organization_name,
    organizationSlug: row.organization_slug,
    planName: row.plan_name,
    planDisplayName: row.plan_display_name,
    modules: parseModules(row.modules),
  }));

  return res.json({ requests });
});

billingRouter.patch('/admin/org-module-requests/:subscriptionId', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;
  if (!authed.isRoot && authed.role !== 'root') {
    return res.status(403).json({ error: 'Root access required' });
  }

  const parsed = resolveOrgSubscriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const subscriptionId = req.params.subscriptionId;
  const [rows] = await pool.query(
    `SELECT id, organization_id, plan_id, status
     FROM organization_subscriptions
     WHERE id = ?
     LIMIT 1`,
    [subscriptionId],
  );

  const subscription = (rows as Array<{
    id: string;
    organization_id: string;
    plan_id: string;
    status: string;
  }>)[0];

  if (!subscription) {
    return res.status(404).json({ error: 'Organization module request not found' });
  }

  if (subscription.status !== 'pending_approval') {
    return res.status(400).json({ error: 'Only pending requests can be processed' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (parsed.data.action === 'approved') {
      await connection.query(
        `UPDATE organization_subscriptions
         SET status = 'approved', start_date = UTC_TIMESTAMP(), end_date = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [subscriptionId],
      );

      await connection.query(
        `INSERT INTO organization_modules (id, organization_id, module_id, status, starts_at, expires_at)
         SELECT UUID(), ?, pm.module_id, 'active', UTC_TIMESTAMP(), NULL
         FROM plan_modules pm
         WHERE pm.plan_id = ?
           AND pm.is_enabled = 1
         ON DUPLICATE KEY UPDATE
           status = 'active',
           starts_at = UTC_TIMESTAMP(),
           expires_at = NULL`,
        [subscription.organization_id, subscription.plan_id],
      );
      await connection.query(
        `UPDATE organization_subscriptions
         SET status = 'active', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [subscriptionId],
      );
    } else {
      await connection.query(
        `UPDATE organization_subscriptions
         SET status = 'rejected', end_date = UTC_TIMESTAMP(), updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [subscriptionId],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return res.json({ message: parsed.data.action === 'approved' ? 'Request approved' : 'Request rejected' });
});

billingRouter.get('/my-access', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user;

  if (authed.isRoot || authed.role === 'root') {
    const [rows] = await pool.query(
      `SELECT name FROM modules WHERE is_active = 1 ORDER BY name ASC`,
    );

    const modules = (rows as Array<{ name: string }>).map((row) => row.name);
    return res.json({ modules });
  }

  const userId = authed.id;
  const modules = await getUserEntitledModules(userId);

  return res.json({ modules });
});

billingRouter.get('/my-subscriptions', requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).user.id;
  const subscriptions = await getUserSubscriptionDetails(userId);

  return res.json({ subscriptions });
});

billingRouter.post('/buy-module', requireAuth, async (req, res) => {
  const parsed = buyModuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const authed = (req as AuthedRequest).user;
  if (authed.role === 'admin' || authed.role === 'superadmin') {
    return res.status(403).json({ error: 'Organization admins must use organization billing purchase flow' });
  }

  const userId = authed.id;
  const { moduleName } = parsed.data;

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
    [moduleName],
  );

  const planId = (planRows as Array<{ plan_id: string }>)[0]?.plan_id;
  if (!planId) {
    return res.status(404).json({ error: 'Module purchase plan not found' });
  }

  await pool.query(
    `INSERT INTO user_subscriptions (id, user_id, plan_id, status, start_date, end_date, auto_renew)
     VALUES (UUID(), ?, ?, 'active', UTC_TIMESTAMP(), NULL, 1)
     ON DUPLICATE KEY UPDATE status = 'active', start_date = UTC_TIMESTAMP(), end_date = NULL, updated_at = CURRENT_TIMESTAMP`,
    [userId, planId],
  );

  const modules = await getUserEntitledModules(userId);
  return res.status(201).json({ message: 'Module purchased', modules });
});
