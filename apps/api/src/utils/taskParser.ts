import type { TaskCategory } from '../types.js';

const categoryRules: Array<{ keywords: string[]; category: TaskCategory }> = [
  { keywords: ['pay', 'bill', 'invoice', 'tax'], category: 'Finance' },
  { keywords: ['call', 'meet', 'client', 'email'], category: 'Contact' },
  { keywords: ['deploy', 'review', 'build', 'bug'], category: 'Work' },
  { keywords: ['gym', 'health', 'family', 'groceries'], category: 'Personal' },
];

export function inferCategory(input: string): TaskCategory {
  const lower = input.toLowerCase();
  const match = categoryRules.find((rule) => rule.keywords.some((word) => lower.includes(word)));
  return match?.category ?? 'General';
}

export function inferDueDate(input: string): Date {
  const now = new Date();
  const due = new Date(now);
  const lower = input.toLowerCase();

  if (lower.includes('tomorrow')) {
    due.setDate(due.getDate() + 1);
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

export function parseTaskInput(rawInput: string): { title: string; category: TaskCategory; dueDate: Date } {
  const title = rawInput
    .replace(/remind me to\s*/i, '')
    .replace(/tomorrow/gi, '')
    .replace(/\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm)?/gi, '')
    .trim();

  return {
    title: title || rawInput,
    category: inferCategory(rawInput),
    dueDate: inferDueDate(rawInput),
  };
}
