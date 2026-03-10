import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../../../middleware/auth.js';
import { env } from '../../../config.js';
import {
  fetchChapterQa,
  fetchProgressProfile,
  fetchStudentProfile,
  fetchSubjectChapters,
  saveChapterQa,
  saveProgressProfile,
  saveStudentProfile,
  saveSubjectChapters,
  summarizeChapter,
  suggestChapters,
  extractChaptersFromImage,
} from '../services/profileService.js';
import type {
  EduKartaChapterQaRow,
  EduKartaSubjectChapterRow,
} from '../repo/profileRepo.js';

const upsertStudentProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  board: z.string().trim().min(2).max(80),
  classLevel: z.string().trim().min(1).max(20),
  subjects: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
});

const saveSubjectChaptersSchema = z.object({
  subject: z.string().trim().min(1).max(80),
  chapters: z.array(z.string().trim().min(1).max(500)).max(200),
});

const suggestChaptersSchema = z.object({
  subject: z.string().trim().min(1).max(80),
  isbn: z.string().trim().min(10).max(20).optional(),
});

const extractChaptersFromImageSchema = z.object({
  subject: z.string().trim().min(1).max(80),
  imageDataUrl: z
    .string()
    .trim()
    .regex(/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i),
});

const summarizeChapterSchema = z.object({
  subject: z.string().trim().min(1).max(80),
  chapter: z.string().trim().min(1).max(200),
  ask: z.string().trim().max(400).optional(),
  history: z.array(z.object({
    question: z.string().trim().min(1).max(400),
    answer: z.string().trim().min(1).max(4000),
  })).max(8).optional(),
});

const saveChapterQaSchema = z.object({
  subject: z.string().trim().min(1).max(80),
  chapter: z.string().trim().min(1).max(200),
  question: z.string().trim().min(1).max(400),
  answer: z.string().trim().min(1).max(8000),
});

const listChapterQaQuerySchema = z.object({
  subject: z.string().trim().min(1).max(80),
  chapter: z.string().trim().min(1).max(200),
});

const progressRowSchema = z.object({
  done: z.boolean(),
  bookType: z.string().trim().max(120),
  noWork: z.boolean(),
  startDate: z.string().trim().max(20),
  submissionDate: z.string().trim().max(20),
  returnedDate: z.string().trim().max(20),
});

const progressSubjectSchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  bookTypes: z.array(z.string().trim().min(1).max(120)).max(50),
  yearlyBookTypes: z.array(z.string().trim().min(1).max(120)).max(50),
  noWorkBookTypes: z.array(z.string().trim().min(1).max(120)).max(50),
});

const saveProgressSchema = z.object({
  subjects: z.array(progressSubjectSchema).max(80),
  terms: z.array(z.string().trim().min(1).max(80)).max(40),
  selectedSubjectId: z.string().trim().max(80).optional(),
  selectedTerm: z.string().trim().max(80).optional(),
  selectedBookTypeBySubject: z.record(z.string().trim().max(120)).default({}),
  progressState: z.record(z.record(z.record(z.record(progressRowSchema)))).default({}),
});

export const edukartaProfileRouter = Router();

edukartaProfileRouter.get('/', async (req, res) => {
  const authed = (req as AuthedRequest).user;

  const row = await fetchStudentProfile(authed.id);
  if (!row) {
    return res.json({ profile: null });
  }

  const subjects = normalizeSubjects(row.subjects);

  return res.json({
    profile: {
      name: row.name,
      board: row.board,
      classLevel: row.class_level,
      subjects,
      completedAt: row.completed_at instanceof Date ? row.completed_at.toISOString() : row.completed_at,
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    },
  });
});

edukartaProfileRouter.put('/', async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const parsed = upsertStudentProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const subjectsJson = JSON.stringify(payload.subjects);

  await saveStudentProfile({
    userId: authed.id,
    organizationId: authed.organizationId ?? null,
    name: payload.name,
    board: payload.board,
    classLevel: payload.classLevel,
    subjectsJson,
  });

  return res.json({ message: 'EduKarta student profile saved' });
});

edukartaProfileRouter.get('/chapters', async (req, res) => {
  const authed = (req as AuthedRequest).user;

  const rows = await fetchSubjectChapters(authed.id);

  const grouped = (rows as EduKartaSubjectChapterRow[]).reduce<Record<string, string[]>>((acc, row) => {
    if (!acc[row.subject]) {
      acc[row.subject] = [];
    }
    acc[row.subject].push(row.chapter_name);
    return acc;
  }, {});

  return res.json({ chaptersBySubject: grouped });
});

edukartaProfileRouter.put('/chapters', async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const parsed = saveSubjectChaptersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const dedupedChapters = Array.from(
    new Set(
      payload.chapters
        .map((item) => sanitizeChapterForStore(item))
        .filter((item) => item.length > 0),
    ),
  );

  await saveSubjectChapters({
    userId: authed.id,
    organizationId: authed.organizationId ?? null,
    subject: payload.subject,
    chapters: dedupedChapters,
  });

  return res.json({ message: 'Subject chapters saved', subject: payload.subject, count: dedupedChapters.length });
});

edukartaProfileRouter.post('/chapters/suggest', async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const parsed = suggestChaptersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { subject } = parsed.data;
  const isbn = parsed.data.isbn ? normalizeIsbn(parsed.data.isbn) : undefined;
  if (isbn && !isValidIsbn(isbn)) {
    return res.status(400).json({ error: 'Invalid ISBN format. Use a valid ISBN-10 or ISBN-13.' });
  }

  const result = await suggestChapters({ userId: authed.id, subject, isbn });
  return res.json({ chapters: result.chapters, source: result.source });
});

edukartaProfileRouter.post('/chapters/extract-from-image', async (req, res) => {
  const parsed = extractChaptersFromImageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  if (!env.HF_TOKEN) {
    return res.status(400).json({ error: 'AI vision is not configured. Please set HF_TOKEN.' });
  }

  const { subject, imageDataUrl } = parsed.data;
  const chapters = await extractChaptersFromImage({ subject, imageDataUrl });
  if (chapters.length === 0) {
    return res.status(422).json({ error: 'Could not extract chapters from the image. Try a clearer TOC photo.' });
  }

  return res.json({ chapters, source: 'ocr-ai' });
});

edukartaProfileRouter.post('/chapters/summary', async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const parsed = summarizeChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  if (!env.HF_TOKEN) {
    return res.status(400).json({ error: 'AI summary is not configured. Please set HF_TOKEN.' });
  }

  const summary = await summarizeChapter({
    userId: authed.id,
    subject: parsed.data.subject,
    chapter: parsed.data.chapter,
    ask: parsed.data.ask,
    history: parsed.data.history ?? [],
  });
  if (!summary) {
    return res.status(502).json({ error: 'Failed to generate chapter summary. Please try again.' });
  }

  return res.json(summary);
});

edukartaProfileRouter.get('/chapters/qa', async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const parsed = listChapterQaQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
  }

  const rows = await fetchChapterQa({
    userId: authed.id,
    subject: parsed.data.subject,
    chapter: parsed.data.chapter,
  });

  const turns = (rows as EduKartaChapterQaRow[]).map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }));

  return res.json({ turns });
});

edukartaProfileRouter.post('/chapters/qa', async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const parsed = saveChapterQaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const row = await saveChapterQa({
    userId: authed.id,
    organizationId: authed.organizationId ?? null,
    subject: payload.subject,
    chapter: payload.chapter,
    question: payload.question,
    answer: payload.answer,
  });

  return res.status(201).json({
    turn: {
      id: row?.id ?? '',
      question: row?.question ?? payload.question,
      answer: row?.answer ?? payload.answer,
      createdAt: row?.created_at instanceof Date ? row.created_at.toISOString() : String(row?.created_at ?? new Date().toISOString()),
    },
  });
});

edukartaProfileRouter.get('/progress', async (req, res) => {
  const authed = (req as AuthedRequest).user;

  const row = await fetchProgressProfile(authed.id);
  if (!row) {
    return res.json({ progress: null });
  }

  return res.json({
    progress: row.progress_data,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  });
});

edukartaProfileRouter.put('/progress', async (req, res) => {
  const authed = (req as AuthedRequest).user;
  const parsed = saveProgressSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const progressDataJson = JSON.stringify(payload);

  await saveProgressProfile({
    userId: authed.id,
    organizationId: authed.organizationId ?? null,
    progressDataJson,
  });

  return res.json({ message: 'EduKarta progress saved' });
});

function normalizeIsbn(raw: string): string {
  return raw.replace(/[^0-9Xx]/g, '').toUpperCase();
}

function isValidIsbn(isbn: string): boolean {
  if (/^\d{13}$/.test(isbn)) return isValidIsbn13(isbn);
  if (/^\d{9}[\dX]$/.test(isbn)) return isValidIsbn10(isbn);
  return false;
}

function isValidIsbn10(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += (i + 1) * Number(isbn[i]);
  }
  const checkChar = isbn[9];
  const checkValue = checkChar === 'X' ? 10 : Number(checkChar);
  sum += 10 * checkValue;
  return sum % 11 === 0;
}

function isValidIsbn13(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const digit = Number(isbn[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const expected = (10 - (sum % 10)) % 10;
  return expected === Number(isbn[12]);
}

function normalizeSubjects(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  if (raw && typeof raw === 'object') {
    const values = Object.values(raw as Record<string, unknown>);
    return values.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function sanitizeChapterForStore(value: string): string {
  const cleaned = value
    .replace(/\s{2,}/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/\s*-\s*$/g, '')
    .trim();

  // DB column chapter_name is VARCHAR(255); keep insert safe.
  return cleaned.slice(0, 255);
}
