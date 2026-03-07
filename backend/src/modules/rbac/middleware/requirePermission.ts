import type { NextFunction, Request, Response } from 'express';
import { canUser } from '../services/rbacService.js';
import type { AuthedRequest } from '../../../middleware/auth.js';

export function requirePermission(permissionSlug: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authed = req as AuthedRequest;
      if (!authed.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const check = await canUser(authed.user.id, permissionSlug);
      if (!check.allowed) {
        return res.status(403).json({ error: check.reason ?? 'Forbidden' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
