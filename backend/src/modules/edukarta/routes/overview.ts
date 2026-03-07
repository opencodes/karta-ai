import { Router } from 'express';

export const edukartaOverviewRouter = Router();

edukartaOverviewRouter.get('/', (_req, res) => {
  return res.json({
    module: 'edukarta',
    status: 'active',
    features: ['tasks', 'lesson-plan'],
  });
});
