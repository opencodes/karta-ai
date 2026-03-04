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


// server.js
import { pool } from "./db.js";

async function start() {
  try {
    const conn = await pool.getConnection();
    await conn.ping(); // or: await conn.query("SELECT 1");
    conn.release();
    console.log("MySQL connected");

    app.listen(process.env.PORT || 3000, () => {
      console.log("Server started");
    });
  } catch (err) {
    console.error("MySQL connection failed:", err.message);
    process.exit(1); // stop app if DB is down
  }
}

start();
