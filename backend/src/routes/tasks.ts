import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { toTaskDto, isInNextHours } from '../utils/taskMapper.js';
import { parseTaskInputWithAi } from '../utils/taskParser.js';
import type { TaskRecord } from '../types.js';

const createTaskSchema = z.object({
  rawInput: z.string().trim().min(1),
});

const listQuerySchema = z.object({
  bucket: z.enum(['all', 'now', 'later', 'featured']).optional(),
});

const featureSchema = z.object({
  featured: z.boolean(),
});

export const tasksRouter = Router();

tasksRouter.post('/parse-create', async (req, res) => {
  const parsedBody = createTaskSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsedBody.error.flatten() });
  }

  const { rawInput } = parsedBody.data;
  const parsed = await parseTaskInputWithAi(rawInput);
  const id = crypto.randomUUID();

  await pool.execute(
    `INSERT INTO tasks (id, raw_input, title, category, due_date, featured, status)
     VALUES (?, ?, ?, ?, ?, 0, 'pending')`,
    [id, rawInput, parsed.title, parsed.category, parsed.dueDate],
  );

  const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ? LIMIT 1', [id]);
  const row = (rows as TaskRecord[])[0];

  if (!row) {
    return res.status(500).json({ error: 'Task creation failed' });
  }

  return res.status(201).json({ task: toTaskDto(row) });
});

tasksRouter.get('/', async (req, res) => {
  const parsedQuery = listQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsedQuery.error.flatten() });
  }

  const bucket = parsedQuery.data.bucket ?? 'all';

  const [rows] = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC');
  let tasks = (rows as TaskRecord[]).map(toTaskDto);

  if (bucket === 'featured') {
    tasks = tasks.filter((task) => task.featured);
  } else if (bucket === 'now') {
    tasks = tasks.filter((task) => isInNextHours(task.dueDate, 4));
  } else if (bucket === 'later') {
    tasks = tasks.filter((task) => !isInNextHours(task.dueDate, 4));
  }

  return res.json({ tasks });
});

tasksRouter.patch('/:id/feature', async (req, res) => {
  const parsedBody = featureSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsedBody.error.flatten() });
  }

  const { id } = req.params;
  const featureValue = parsedBody.data.featured ? 1 : 0;

  const [result] = await pool.execute('UPDATE tasks SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [featureValue, id]);
  const affected = (result as { affectedRows: number }).affectedRows;

  if (!affected) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ? LIMIT 1', [id]);
  const row = (rows as TaskRecord[])[0];

  if (!row) {
    return res.status(404).json({ error: 'Task not found' });
  }

  return res.json({ task: toTaskDto(row) });
});
