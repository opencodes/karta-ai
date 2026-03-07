import type { KartaModule } from '../types.js';
import { TodoKartaModule } from '../todokarta/module.js';
import { EduKartaModule } from '../edukarta/module.js';
import { PrepKartaModule } from '../prepkarta/module.js';

export const modules: KartaModule[] = [
  TodoKartaModule,
  EduKartaModule,
  PrepKartaModule,
];

export function getEnabledModules(): KartaModule[] {
  return modules.filter((moduleDef) => moduleDef.enabled !== false);
}
