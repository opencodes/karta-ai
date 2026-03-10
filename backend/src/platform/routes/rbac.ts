import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requirePermission } from '../../modules/rbac/middleware/requirePermission.js';
import { canUser, getUserAuthorizationSnapshot } from '../../modules/rbac/services/rbacService.js';

export const rbacRouter = Router();

rbacRouter.get('/me', requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).user.id;
  const snapshot = await getUserAuthorizationSnapshot(userId);

  if (!snapshot) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(snapshot);
});

rbacRouter.get('/can/:permission', requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).user.id;
  const permission = req.params.permission;
  const result = await canUser(userId, permission);

  return res.json(result);
});

rbacRouter.post('/test/users/create', requireAuth, requirePermission('users.create'), (_req, res) => {
  return res.json({ ok: true, message: 'users.create permission granted' });
});

rbacRouter.post('/test/tickets/assign', requireAuth, requirePermission('tickets.assign'), (_req, res) => {
  return res.json({ ok: true, message: 'tickets.assign permission granted' });
});

rbacRouter.get('/test/billing/view', requireAuth, requirePermission('billing.view'), (_req, res) => {
  return res.json({ ok: true, message: 'billing.view permission granted' });
});
