import express from 'express';
import cors from 'cors';
import { env } from './config.js';
import { pool } from './db.js';
import { tasksRouter } from './routes/tasks.js';
import { authRouter } from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', db: 'connected' });
  } catch {
    return res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', requireAuth, tasksRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`karta-api running on http://localhost:${env.PORT}`);
});
