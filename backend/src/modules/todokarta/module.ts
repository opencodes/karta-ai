import type { KartaModule } from '../types.js';

export const TodoKartaModule: KartaModule = {
  name: 'todokarta',
  version: '1.0.0',
  enabled: true,
  backend: {
    routes: [
      { routeKey: 'todokarta.tasks', mountPath: '/tasks', requiresAuth: true },
    ],
  },
  prompts: [
    {
      id: 'todokarta.task-parse',
      description: 'Parses natural language task text into structured task data.',
      template: 'Parse this todo text: {{rawInput}}',
      tags: ['todo', 'task'],
    },
  ],
};
