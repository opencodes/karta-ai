import type { NextFunction, Request, Response } from 'express';
import type { KartaModule } from '../modules/types.js';
import type { AuthedRequest } from './auth.js';
import { isUserEntitledToModule } from '../modules/core/accessControl.js';

export function requireModuleAccess(moduleDef: KartaModule) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authed = req as AuthedRequest;

      if (!authed.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (authed.user.isRoot || authed.user.role === 'root') {
        return next();
      }

      if (authed.user.role === 'admin' || authed.user.role === 'superadmin') {
        return res.status(403).json({ error: 'Organization admins cannot access module workspaces' });
      }

      const hasAccess = await isUserEntitledToModule(authed.user.id, moduleDef.name);
      if (!hasAccess) {
        return res.status(403).json({ error: `Purchase required for module: ${moduleDef.name}` });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
