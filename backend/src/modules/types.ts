import type { Router } from 'express';

export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export type PromptDefinition = {
  id: string;
  description?: string;
  template: string;
  tags?: string[];
};

export type BackendRouteConfig = {
  routeKey: string;
  mountPath: string;
  requiresAuth?: boolean;
};

export type KartaModule = {
  name: string;
  version: string;
  enabled?: boolean;
  requiredSubscription?: SubscriptionTier[];
  backend?: {
    routes: BackendRouteConfig[];
    services?: unknown[];
  };
  prompts?: PromptDefinition[];
};

export type BackendRouteRegistry = Record<string, Router>;
