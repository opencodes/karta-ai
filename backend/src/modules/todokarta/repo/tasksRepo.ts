import { pool } from '../../../db.js';
import type { TaskRecord } from '../../../types.js';

export type CreateTaskInput = {
  id: string;
  rawInput: string;
  title: string;
  category: TaskRecord['category'];
  tags: string[];
  time: string;
  date: string;
  recurring: TaskRecord['recurring'];
  dueDate: Date;
};

export async function createTask(input: CreateTaskInput): Promise<TaskRecord | null> {
  await pool.execute(
    `INSERT INTO tasks (id, raw_input, title, category, tags, task_time, task_date, recurring, due_date, featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending')`,
    [
      input.id,
      input.rawInput,
      input.title,
      input.category,
      JSON.stringify(input.tags),
      input.time,
      input.date,
      input.recurring,
      input.dueDate,
    ],
  );

  const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ? LIMIT 1', [input.id]);
  return (rows as TaskRecord[])[0] ?? null;
}

export async function listTasks(): Promise<TaskRecord[]> {
  const [rows] = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC');
  return rows as TaskRecord[];
}

export async function setTaskFeatured(id: string, featured: boolean): Promise<TaskRecord | null> {
  const featureValue = featured ? 1 : 0;
  const [result] = await pool.execute(
    'UPDATE tasks SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [featureValue, id],
  );
  const affected = (result as { affectedRows: number }).affectedRows;
  if (!affected) {
    return null;
  }

  const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ? LIMIT 1', [id]);
  return (rows as TaskRecord[])[0] ?? null;
}
