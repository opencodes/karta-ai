import type { Express } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/moduleAccess.js';
import { getEnabledModules } from './config/modules.js';
import { backendRouteRegistry } from './runtime/backendRouteRegistry.js';

export function loadModules(app: Express) {
  for (const moduleDef of getEnabledModules()) {
    for (const routeDef of moduleDef.backend?.routes ?? []) {
      const router = backendRouteRegistry[routeDef.routeKey];

      if (!router) {
        console.warn(`[module-loader] route key not found: ${routeDef.routeKey}`);
        continue;
      }

      const mountPath = `/api/${moduleDef.name}${routeDef.mountPath}`;

      if (routeDef.requiresAuth) {
        app.use(mountPath, requireAuth, requireModuleAccess(moduleDef), router);
      } else {
        app.use(mountPath, router);
      }
    }
  }
}
