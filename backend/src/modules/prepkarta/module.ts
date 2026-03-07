import type { KartaModule } from '../types.js';

export const PrepKartaModule: KartaModule = {
  name: 'prepkarta',
  version: '1.0.0',
  enabled: true,
  requiredSubscription: ['PRO', 'ENTERPRISE'],
  backend: {
    routes: [
      { routeKey: 'prepkarta.exams', mountPath: '/exams', requiresAuth: true },
    ],
  },
  prompts: [
    {
      id: 'prepkarta.study-plan',
      description: 'Build a weekly exam prep plan.',
      template: 'Generate a study plan for {{exam}} over {{weeks}} weeks.',
      tags: ['exam', 'prep'],
    },
  ],
};
