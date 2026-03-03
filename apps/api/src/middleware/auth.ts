import type { Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from '../utils/token.js';
import type { UserRole } from '../types.js';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type AuthedRequest = Request & { user: AuthUser };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice('Bearer '.length);
  const payload = verifyAuthToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  (req as AuthedRequest).user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };

  return next();
}
