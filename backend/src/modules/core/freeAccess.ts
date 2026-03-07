import { pool } from '../../db.js';

const TODO_FREE_PLAN = 'todokarta-free';

export async function ensureFreeTodoAccess(userId: string): Promise<void> {
  const [planRows] = await pool.query(
    `SELECT id
     FROM subscription_plans
     WHERE name = ?
       AND is_active = 1
     LIMIT 1`,
    [TODO_FREE_PLAN],
  );

  const planId = (planRows as Array<{ id: string }>)[0]?.id;
  if (!planId) {
    return;
  }

  await pool.query(
    `INSERT INTO user_subscriptions (id, user_id, plan_id, status, start_date, end_date, auto_renew, payment_provider)
     VALUES (UUID(), ?, ?, 'active', UTC_TIMESTAMP(), NULL, 1, 'system_default')
     ON DUPLICATE KEY UPDATE
       status = 'active',
       end_date = NULL,
       auto_renew = 1,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, planId],
  );
}
