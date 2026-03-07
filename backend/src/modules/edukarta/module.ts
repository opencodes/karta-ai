import type { KartaModule } from '../types.js';

export const EduKartaModule: KartaModule = {
  name: 'edukarta',
  version: '1.0.0',
  enabled: true,
  requiredSubscription: ['PRO', 'ENTERPRISE'],
  backend: {
    routes: [
      { routeKey: 'edukarta.overview', mountPath: '/overview', requiresAuth: true },
    ],
  },
  prompts: [
    {
      id: 'edukarta.lesson-plan',
      description: 'Generate lesson plans from a target learning goal.',
      template: 'Create a lesson plan for {{goal}}.',
      tags: ['education', 'lesson-plan'],
    },
  ],
};
