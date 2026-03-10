import crypto from 'node:crypto';
import { parseTaskInputWithAi } from '../../../utils/taskParser.js';
import { createTask, listTasks, setTaskFeatured } from '../repo/tasksRepo.js';

export async function createTaskFromRawInput(rawInput: string) {
  const parsed = await parseTaskInputWithAi(rawInput);
  const id = crypto.randomUUID();

  return createTask({
    id,
    rawInput,
    title: parsed.title,
    category: parsed.category,
    tags: parsed.tags,
    time: parsed.time,
    date: parsed.date,
    recurring: parsed.recurring,
    dueDate: parsed.dueDate,
  });
}

export async function getTasks() {
  return listTasks();
}

export async function updateTaskFeatured(id: string, featured: boolean) {
  return setTaskFeatured(id, featured);
}
