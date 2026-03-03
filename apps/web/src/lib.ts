import type { TaskCategory, TaskItem } from './types';

const categoryMap: Array<{ keywords: string[]; category: TaskCategory }> = [
  { keywords: ['pay', 'bill', 'invoice', 'tax'], category: 'Finance' },
  { keywords: ['call', 'meet', 'client', 'email'], category: 'Contact' },
  { keywords: ['deploy', 'review', 'build', 'bug'], category: 'Work' },
  { keywords: ['gym', 'health', 'family', 'groceries'], category: 'Personal' },
];

function computeDueDate(input: string): Date {
  const now = new Date();
  const lower = input.toLowerCase();
  const due = new Date(now);

  if (lower.includes('tomorrow')) {
    due.setDate(now.getDate() + 1);
  }

  const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (timeMatch) {
    let hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2] ?? 0);
    const meridiem = timeMatch[3];

    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    due.setHours(hour, minute, 0, 0);
  } else {
    due.setHours(now.getHours() + 1, 0, 0, 0);
  }

  return due;
}

function inferCategory(input: string): TaskCategory {
  const lower = input.toLowerCase();
  const found = categoryMap.find((entry) => entry.keywords.some((k) => lower.includes(k)));
  return found?.category ?? 'General';
}

export function parseTask(rawInput: string): TaskItem {
  const title = rawInput
    .replace(/remind me to\s*/i, '')
    .replace(/tomorrow/gi, '')
    .replace(/\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm)?/gi, '')
    .trim();

  return {
    id: crypto.randomUUID(),
    rawInput,
    title: title.length > 0 ? title : rawInput,
    category: inferCategory(rawInput),
    dueDate: computeDueDate(rawInput).toISOString(),
    status: 'pending',
    featured: false,
  };
}

export function inNextHours(dateIso: string, hours: number): boolean {
  const now = Date.now();
  const due = new Date(dateIso).getTime();
  return due >= now && due <= now + hours * 60 * 60 * 1000;
}
