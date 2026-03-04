import { z } from 'zod';
import type { TaskCategory } from '../types.js';
import { env } from '../config.js';
import { HuggingFaceClient } from '../services/huggingFaceClient.js';
import { buildTodoTaskParserPrompt } from '../config/prompts/index.js';

const categoryRules: Array<{ keywords: string[]; category: TaskCategory }> = [
  { keywords: ['pay', 'bill', 'invoice', 'tax'], category: 'Finance' },
  { keywords: ['call', 'meet', 'client', 'email'], category: 'Contact' },
  { keywords: ['deploy', 'review', 'build', 'bug'], category: 'Work' },
  { keywords: ['gym', 'health', 'family', 'groceries'], category: 'Personal' },
];

export type ParsedTaskInput = {
  title: string;
  category: TaskCategory;
  tags: string[];
  time: string;
  date: string;
  dueDate: Date;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
};

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

export function parseTaskInput(rawInput: string): ParsedTaskInput {
  const title = rawInput
    .replace(/remind me to\s*/i, '')
    .replace(/tomorrow/gi, '')
    .replace(/\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm)?/gi, '')
    .trim();

  const dueDate = inferDueDate(rawInput);

  return {
    title: title || rawInput,
    category: inferCategory(rawInput),
    tags: [],
    time: toHHmm(dueDate),
    date: toYYYYMMDD(dueDate),
    dueDate,
    recurring: inferRecurring(rawInput),
  };
}

const aiParsedTaskSchema = z.object({
  title: z.string().trim().min(1),
  category: z.enum(['Finance', 'Personal', 'Work', 'Contact', 'General']),
  tags: z.array(z.string().trim().min(1)),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().trim().min(1),
  recurring: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']),
});

const hfClient = new HuggingFaceClient();

export async function parseTaskInputWithAi(rawInput: string): Promise<ParsedTaskInput> {
  const fallback = parseTaskInput(rawInput);

  if (!env.HF_TOKEN || !hfClient.isAvailable()) {
    return fallback;
  }

  const prompt = buildTodoTaskParserPrompt(rawInput);

  const response = await hfClient.generate(prompt, env.HF_MAX_TOKENS);

  if (!response) {
    return fallback;
  }

  const extracted = extractJsonObject(response);
  if (!extracted) {
    return fallback;
  }

  const parsed = aiParsedTaskSchema.safeParse(extracted);
  if (!parsed.success) {
    return fallback;
  }

  const dueDate = normalizeAiDueDate(parsed.data.dueDate, parsed.data.date, parsed.data.time);
  if (Number.isNaN(dueDate.getTime())) {
    return fallback;
  }

  return {
    title: parsed.data.title,
    category: parsed.data.category,
    tags: parsed.data.tags,
    time: parsed.data.time,
    date: parsed.data.date,
    dueDate,
    recurring: parsed.data.recurring,
  };
}

function normalizeAiDueDate(dueDateIso: string, date: string, time: string): Date {
  const direct = new Date(dueDateIso);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  // Fallback if model returns separate date/time correctly but malformed dueDate.
  return new Date(`${date}T${time}:00.000Z`);
}

function toHHmm(value: Date): string {
  const h = String(value.getHours()).padStart(2, '0');
  const m = String(value.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function toYYYYMMDD(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function inferRecurring(input: string): 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' {
  const lower = input.toLowerCase();
  if (lower.includes('every day') || lower.includes('daily')) return 'daily';
  if (lower.includes('every week') || lower.includes('weekly')) return 'weekly';
  if (lower.includes('every month') || lower.includes('monthly')) return 'monthly';
  if (lower.includes('every year') || lower.includes('yearly')) return 'yearly';
  return 'none';
}

function extractJsonObject(text: string): unknown | null {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch {
      return null;
    }
  }

  const match = text.match(/\{[\s\S]*\}/);
  const candidate = match?.[0] ?? text;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}
