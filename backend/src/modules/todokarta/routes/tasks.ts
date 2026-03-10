import { Router } from 'express';
import { z } from 'zod';
import { toTaskDto, isInNextHours } from '../../../utils/taskMapper.js';
import type { TaskRecord } from '../../../types.js';
import { createTaskFromRawInput, getTasks, updateTaskFeatured } from '../services/tasksService.js';

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
  const row = await createTaskFromRawInput(rawInput);

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

  const rows = await getTasks();
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
  const row = await updateTaskFeatured(id, parsedBody.data.featured);

  if (!row) {
    return res.status(404).json({ error: 'Task not found' });
  }

  return res.json({ task: toTaskDto(row) });
});
