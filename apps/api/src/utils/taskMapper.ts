import type { TaskDto, TaskRecord } from '../types.js';

export function toTaskDto(row: TaskRecord): TaskDto {
  return {
    id: row.id,
    rawInput: row.raw_input,
    title: row.title,
    category: row.category,
    dueDate: new Date(row.due_date).toISOString(),
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
