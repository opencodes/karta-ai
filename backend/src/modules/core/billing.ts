import type { SubscriptionTier, KartaModule } from '../types.js';

export const SUBSCRIPTION_MODULE_ACCESS: Record<SubscriptionTier, string[]> = {
  FREE: ['edukarta'],
  PRO: ['edukarta', 'prepkarta'],
  ENTERPRISE: ['edukarta', 'prepkarta'],
};

export function hasModuleAccess(subscription: SubscriptionTier, moduleName: string): boolean {
  return SUBSCRIPTION_MODULE_ACCESS[subscription]?.includes(moduleName) ?? false;
}

export function hasRequiredTier(subscription: SubscriptionTier, moduleDef: KartaModule): boolean {
  const required = moduleDef.requiredSubscription;
  if (!required || required.length === 0) {
    return true;
  }
  return required.includes(subscription);
}

export function roleToSubscription(role: 'root' | 'superadmin' | 'admin' | 'member'): SubscriptionTier {
  return role === 'member' ? 'FREE' : 'ENTERPRISE';
}
