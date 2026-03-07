import crypto from 'node:crypto';
import { env } from '../config.js';
import type { SubscriptionTier, UserRole } from '../types.js';

type TokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  isRoot: boolean;
  organizationId?: string;
  subscription: SubscriptionTier;
  exp: number;
};

function toBase64Url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function signRaw(payloadEncoded: string): string {
  return crypto.createHmac('sha256', env.JWT_SECRET).update(payloadEncoded).digest('base64url');
}

function expiresInSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60;

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === 's') return value;
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 60 * 60;
  return value * 24 * 60 * 60;
}

export function createAuthToken(input: {
  sub: string;
  email: string;
  role: UserRole;
  isRoot: boolean;
  organizationId?: string;
  subscription: SubscriptionTier;
}): string {
  const payload: TokenPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds(env.JWT_EXPIRES_IN),
  };

  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = signRaw(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifyAuthToken(token: string): TokenPayload | null {
  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) return null;

  const expected = signRaw(payloadEncoded);
  if (expected !== signature) return null;

  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded)) as TokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
