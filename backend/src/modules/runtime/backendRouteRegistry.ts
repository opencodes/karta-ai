import { tasksRouter } from '../todokarta/routes/tasks.js';
import { edukartaOverviewRouter } from '../edukarta/routes/overview.js';
import { edukartaProfileRouter } from '../edukarta/routes/profile.js';
import { prepkartaExamsRouter } from '../prepkarta/routes/exams.js';
import { prepkartaPracticeRouter } from '../prepkarta/routes/practice.js';
import type { BackendRouteRegistry } from '../types.js';

export const backendRouteRegistry: BackendRouteRegistry = {
  'todokarta.tasks': tasksRouter,
  'edukarta.overview': edukartaOverviewRouter,
  'edukarta.profile': edukartaProfileRouter,
  'prepkarta.exams': prepkartaExamsRouter,
  'prepkarta.practice': prepkartaPracticeRouter,
};
