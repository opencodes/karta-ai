import { tasksRouter } from '../../routes/tasks.js';
import { edukartaOverviewRouter } from '../edukarta/routes/overview.js';
import { prepkartaExamsRouter } from '../prepkarta/routes/exams.js';
import type { BackendRouteRegistry } from '../types.js';

export const backendRouteRegistry: BackendRouteRegistry = {
  'todokarta.tasks': tasksRouter,
  'edukarta.overview': edukartaOverviewRouter,
  'prepkarta.exams': prepkartaExamsRouter,
};
