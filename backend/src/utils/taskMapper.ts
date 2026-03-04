import type { TaskDto, TaskRecord } from '../types.js';

export function toTaskDto(row: TaskRecord): TaskDto {
  const dueDate = new Date(row.due_date);
  const parsedTags = normalizeTags(row.tags);
  const time = String(row.task_time).slice(0, 5);
  const date = normalizeDate(row.task_date);

  return {
    id: row.id,
    rawInput: row.raw_input,
    title: row.title,
    category: row.category,
    tags: parsedTags,
    time,
    date,
    recurring: row.recurring,
    dueDate: dueDate.toISOString(),
    featured: row.featured === 1,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function isInNextHours(dateIso: string, hours: number): boolean {
  const now = Date.now();
  const due = new Date(dateIso).getTime();
  return due >= now && due <= now + hours * 60 * 60 * 1000;
}

function normalizeTags(value: TaskRecord['tags']): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeDate(value: TaskRecord['task_date']): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}
