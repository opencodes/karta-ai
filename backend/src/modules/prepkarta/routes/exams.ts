import { Router } from 'express';

export const prepkartaExamsRouter = Router();

prepkartaExamsRouter.get('/', (_req, res) => {
  return res.json({
    module: 'prepkarta',
    exams: ['JEE', 'NEET', 'SAT'],
  });
});
