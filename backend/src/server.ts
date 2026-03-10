import express from 'express';
import cors from 'cors';
import { env } from './config.js';
import { pool } from './db.js';
import { authRouter } from './platform/routes/auth.js';
import { billingRouter } from './platform/routes/billing.js';
import { rbacRouter } from './platform/routes/rbac.js';
import { orgAdminRouter } from './platform/routes/orgAdmin.js';
import { knowledgeRouter } from './platform/routes/knowledge.js';
import { loadModules } from './modules/loadModules.js';

const app = express();
console.log("CORS_ORIGIN ", env.CORS_ORIGIN);

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', db: 'connected' });
  } catch {
    return res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/billing', billingRouter);
app.use('/api/rbac', rbacRouter);
app.use('/api/org-admin', orgAdminRouter);
app.use('/api/knowledge', knowledgeRouter);
loadModules(app);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('MySQL connected');

    app.listen(env.PORT, () => {
      console.log(`Server started on port ${env.PORT}`);
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('MySQL connection failed:', message);
    process.exit(1);
  }
}

start();
