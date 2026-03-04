import { z } from 'zod';
import type { TaskCategory } from '../types.js';
import { env } from '../config.js';
import { HuggingFaceClient } from '../services/huggingFaceClient.js';

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

const aiParsedTaskSchema = z.object({
  title: z.string().trim().min(1),
  category: z.enum(['Finance', 'Personal', 'Work', 'Contact', 'General']),
  dueDate: z.string().trim().min(1),
});

const hfClient = new HuggingFaceClient();

export async function parseTaskInputWithAi(rawInput: string): Promise<{ title: string; category: TaskCategory; dueDate: Date }> {
  const fallback = parseTaskInput(rawInput);

  if (!env.HF_TOKEN || !hfClient.isAvailable()) {
    return fallback;
  }

  const prompt = buildTaskParserPrompt(rawInput);
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

  const dueDate = new Date(parsed.data.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return fallback;
  }

  return {
    title: parsed.data.title,
    category: parsed.data.category,
    dueDate,
  };
}

function buildTaskParserPrompt(rawInput: string): string {
  return `You are a task command parser.
Return ONLY valid JSON. No markdown. No explanation.
Categories allowed exactly: Finance, Personal, Work, Contact, General.
dueDate must be ISO-8601 UTC timestamp.

Output schema:
{
  "title": "clean task title",
  "category": "one allowed category",
  "dueDate": "YYYY-MM-DDTHH:mm:ss.sssZ"
}

If time is missing, choose one hour from now.
If date is missing, choose today (or tomorrow if explicitly stated).

Command: ${rawInput}`;
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
