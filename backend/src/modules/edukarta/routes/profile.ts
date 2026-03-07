import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../../db.js';
import type { AuthedRequest } from '../../../middleware/auth.js';
import { env } from '../../../config.js';
import { HuggingFaceClient } from '../../../services/huggingFaceClient.js';

const upsertStudentProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  board: z.string().trim().min(2).max(80),
  classLevel: z.string().trim().min(1).max(20),
  subjects: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
});

type EduKartaStudentProfileRow = {
  user_id: string;
  name: string;
  board: string;
  class_level: string;
  subjects: unknown;
  completed_at: Date | string;
  updated_at: Date | string;
};

type EduKartaSubjectChapterRow = {
  subject: string;
  chapter_name: string;
};

const saveSubjectChaptersSchema = z.object({
  subject: z.string().trim().min(1).max(80),
  chapters: z.array(z.string().trim().min(1).max(500)).min(1).max(200),
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

const hfClient = new HuggingFaceClient();

const fallbackChapterSuggestions: Record<string, string[]> = {
  mathematics: ['Number Systems', 'Algebra', 'Geometry', 'Mensuration', 'Statistics', 'Probability'],
  english: ['Grammar Fundamentals', 'Reading Comprehension', 'Writing Skills', 'Poetry', 'Prose', 'Vocabulary Building'],
  science: ['Matter and Materials', 'Force and Motion', 'Energy', 'Life Processes', 'Natural Resources', 'Environment'],
  physics: ['Units and Measurements', 'Motion', 'Laws of Motion', 'Work and Energy', 'Waves', 'Electricity'],
  chemistry: ['Atomic Structure', 'Chemical Bonding', 'Acids and Bases', 'Metals and Non-metals', 'Organic Basics', 'Periodic Classification'],
  biology: ['Cell Structure', 'Plant Physiology', 'Human Physiology', 'Genetics', 'Ecology', 'Reproduction'],
  'social science': ['History', 'Geography', 'Civics', 'Economics', 'Map Work', 'Contemporary Issues'],
  history: ['Ancient Civilizations', 'Medieval Period', 'Modern World', 'National Movements', 'Revolutions', 'Post-Independence'],
  geography: ['Earth Structure', 'Climate', 'Natural Resources', 'Agriculture', 'Industries', 'Population'],
  economics: ['Basic Concepts', 'Demand and Supply', 'Market Structures', 'National Income', 'Money and Banking', 'Public Finance'],
  'computer science': ['Programming Basics', 'Data Types', 'Algorithms', 'Data Structures', 'Databases', 'Networks'],
};

export const edukartaProfileRouter = Router();

edukartaProfileRouter.get('/', async (req, res) => {
  const authed = (req as AuthedRequest).user;

  const [rows] = await pool.query(
    `SELECT user_id, name, board, class_level, subjects, completed_at, updated_at
     FROM edukarta_student_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [authed.id],
  );

  const row = (rows as EduKartaStudentProfileRow[])[0];
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

  await pool.query(
    `INSERT INTO edukarta_student_profiles (
       user_id, organization_id, name, board, class_level, subjects, completed_at, updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE
       organization_id = VALUES(organization_id),
       name = VALUES(name),
       board = VALUES(board),
       class_level = VALUES(class_level),
       subjects = VALUES(subjects),
       updated_at = CURRENT_TIMESTAMP`,
    [authed.id, authed.organizationId ?? null, payload.name, payload.board, payload.classLevel, subjectsJson],
  );

  return res.json({ message: 'EduKarta student profile saved' });
});

edukartaProfileRouter.get('/chapters', async (req, res) => {
  const authed = (req as AuthedRequest).user;

  const [rows] = await pool.query(
    `SELECT subject, chapter_name
     FROM edukarta_subject_chapters
     WHERE user_id = ?
     ORDER BY subject ASC, created_at ASC`,
    [authed.id],
  );

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

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM edukarta_subject_chapters
       WHERE user_id = ? AND subject = ?`,
      [authed.id, payload.subject],
    );

    if (dedupedChapters.length > 0) {
      const placeholders = dedupedChapters.map(() => '(UUID(), ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)').join(', ');
      const values = dedupedChapters.flatMap((chapter) => [authed.id, authed.organizationId ?? null, payload.subject, chapter]);
      await connection.query(
        `INSERT INTO edukarta_subject_chapters
         (id, user_id, organization_id, subject, chapter_name, created_at, updated_at)
         VALUES ${placeholders}`,
        values,
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

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

  const [profileRows] = await pool.query(
    `SELECT board, class_level
     FROM edukarta_student_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [authed.id],
  );

  const profile = (profileRows as Array<{ board: string; class_level: string }>)[0];
  const board = profile?.board ?? 'General';
  const classLevel = profile?.class_level ?? 'General';

  const bookChapters = isbn ? await fetchBookChaptersByIsbn(isbn) : [];
  if (bookChapters.length > 0) {
    return res.json({ chapters: bookChapters, source: 'book' });
  }

  const aiSuggestions = await suggestChaptersWithAi(subject, board, classLevel, isbn);
  if (aiSuggestions.length > 0) {
    return res.json({ chapters: aiSuggestions, source: 'ai' });
  }

  return res.json({ chapters: getFallbackSuggestions(subject), source: 'fallback' });
});

edukartaProfileRouter.post('/chapters/extract-from-image', async (req, res) => {
  const parsed = extractChaptersFromImageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  if (!env.HF_TOKEN || !hfClient.isAvailable()) {
    return res.status(400).json({ error: 'AI vision is not configured. Please set HF_TOKEN.' });
  }

  const { subject, imageDataUrl } = parsed.data;
  const chapters = await extractChaptersFromImage(subject, imageDataUrl);
  if (chapters.length === 0) {
    return res.status(422).json({ error: 'Could not extract chapters from the image. Try a clearer TOC photo.' });
  }

  return res.json({ chapters, source: 'ocr-ai' });
});

async function suggestChaptersWithAi(subject: string, board: string, classLevel: string, isbn?: string): Promise<string[]> {
  if (!env.HF_TOKEN || !hfClient.isAvailable()) {
    return [];
  }

  const prompt = [
    'You are an academic curriculum assistant.',
    `Generate up to 12 chapter names for Subject: ${subject}, Board: ${board}, Class: ${classLevel}.`,
    isbn ? `ISBN context (if recognized): ${isbn}. Match chapter names to that textbook if possible.` : 'No ISBN provided.',
    'Return ONLY a JSON array of strings.',
    'No markdown. No explanations. No extra keys.',
    'Example format: ["Chapter 1", "Chapter 2"]',
  ].join('\n');

  const response = await hfClient.generate(prompt, env.HF_MAX_TOKENS);
  if (!response) return [];

  const parsed = extractStringArray(response);
  return parsed.slice(0, 12);
}

function extractStringArray(input: string): string[] {
  const fenced = input.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] ?? input;
  const arrMatch = candidate.match(/\[[\s\S]*\]/);
  const jsonRaw = arrMatch?.[0] ?? candidate;

  try {
    const parsed = JSON.parse(jsonRaw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(
        parsed
          .filter((item) => typeof item === 'string')
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      ),
    );
  } catch {
    return extractCandidatesFromFreeText(candidate);
  }
}

function getFallbackSuggestions(subject: string): string[] {
  const key = subject.trim().toLowerCase();
  if (fallbackChapterSuggestions[key]) {
    return fallbackChapterSuggestions[key];
  }

  const fuzzy = Object.keys(fallbackChapterSuggestions).find((candidate) => key.includes(candidate) || candidate.includes(key));
  if (fuzzy) {
    return fallbackChapterSuggestions[fuzzy];
  }

  return ['Introduction', 'Core Concepts', 'Practice Set 1', 'Practice Set 2', 'Revision', 'Assessment'];
}

async function fetchBookChaptersByIsbn(isbn: string): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`, {
      method: 'GET',
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      table_of_contents?: Array<{ title?: string; label?: string }>;
      contents?: Array<{ title?: string; label?: string }>;
    };
    const items = [...(data.table_of_contents ?? []), ...(data.contents ?? [])];
    if (items.length === 0) return [];
    return Array.from(
      new Set(
        items
          .map((item) => item.title ?? item.label ?? '')
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      ),
    ).slice(0, 20);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function extractChaptersFromImage(subject: string, imageDataUrl: string): Promise<string[]> {
  const ocrText = await extractTextWithOcrModel(imageDataUrl);
  const ocrChapters = parseChaptersFromOcrText(ocrText);
  if (ocrChapters.length > 0) {
    return sanitizeExtractedEntries(ocrChapters);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const payload = {
      model: env.HF_VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: [
                `Subject: ${subject}`,
                'This is a textbook table of contents / index page.',
                'Extract ONLY text that is clearly visible on the page.',
                'Return ONLY one JSON array of strings.',
                'Do not return markdown. Do not return explanation.',
                'Rules:',
                '1) Include chapter titles and visible subtopic bullets.',
                '2) Keep original wording from image; do not paraphrase.',
                '3) Do NOT invent or expand numbering.',
                '4) Do NOT repeat same title with different numbering variants.',
                '5) Exclude page numbers, section banners, grade labels, and decorative text.',
                '6) If a bullet belongs to a chapter, format as "<Chapter Title> - <Bullet>".',
                'Example output:',
                '["Create with Krita","Create with Krita - Digital painting","The Language of the Universe"]',
              ].join('\n'),
            },
            {
              type: 'image_url',
              image_url: { url: imageDataUrl },
            },
          ],
        },
      ],
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: env.HF_MAX_TOKENS,
    };

    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim() ?? '';
    if (!content) return [];

    return sanitizeExtractedEntries(extractStringArray(content)).slice(0, 80);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function extractTextWithOcrModel(imageDataUrl: string): Promise<string> {
  const binary = imageDataUrlToBuffer(imageDataUrl);
  if (!binary) return '';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(env.HF_OCR_MODEL)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: binary,
      signal: controller.signal,
    });

    if (!res.ok) {
      return '';
    }

    const data = (await res.json()) as unknown;
    return extractTextFromOcrPayload(data);
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function extractTextFromOcrPayload(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    const joined = payload.map((item) => extractTextFromOcrPayload(item)).filter(Boolean).join('\n');
    return joined.trim();
  }

  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const record = payload as Record<string, unknown>;
  const direct =
    (typeof record.generated_text === 'string' ? record.generated_text : '') ||
    (typeof record.text === 'string' ? record.text : '') ||
    (typeof record.output_text === 'string' ? record.output_text : '') ||
    (typeof record.response === 'string' ? record.response : '');

  if (direct.trim()) {
    return direct.trim();
  }

  const candidateKeys = ['result', 'results', 'data', 'output', 'outputs', 'content', 'prediction'];
  for (const key of candidateKeys) {
    if (key in record) {
      const nested = extractTextFromOcrPayload(record[key]);
      if (nested) return nested;
    }
  }

  const fromValues = Object.values(record)
    .map((value) => extractTextFromOcrPayload(value))
    .filter(Boolean)
    .join('\n')
    .trim();

  return fromValues;
}

function imageDataUrlToBuffer(imageDataUrl: string): Buffer | null {
  const match = imageDataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  if (!match?.[1]) return null;
  try {
    return Buffer.from(match[1], 'base64');
  } catch {
    return null;
  }
}

function parseChaptersFromOcrText(text: string): string[] {
  if (!text) return [];
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/\s*\.+\s*\d+\s*$/g, '').replace(/\s+\d+$/g, '').trim());

  const chapterLines = lines
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter((line) => {
      const lower = line.toLowerCase();
      return (
        /^chapter\b/i.test(line) ||
        /^\d+[\).\s-]+/.test(line) ||
        /^\d+\.\d+/.test(line) ||
        /^\d+\.\d+\.\d+/.test(line) ||
        /\bunit\b/i.test(line) ||
        /\blesson\b/i.test(line) ||
        /\bpart\b/i.test(line) ||
        lower.length > 5
      );
    })
    .map((line) => line.replace(/\s{2,}/g, ' ').trim());

  const normalized = chapterLines.filter((line) => {
    const lower = line.toLowerCase();
    return !['contents', 'table of contents', 'index'].includes(lower);
  });

  return Array.from(new Set(normalized)).slice(0, 80);
}

function extractCandidatesFromFreeText(text: string): string[] {
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+\s*[\)\].:-]?\s*/, '').trim())
    .map((line) => line.replace(/\s*\.+\s*\d+\s*$/g, '').replace(/\s+\d+$/g, '').trim())
    .filter((line) => line.length >= 3 && !/^[\d\s.]+$/.test(line));

  const useful = lines.filter((line) => {
    const lower = line.toLowerCase();
    return !['table of contents', 'contents', 'index'].includes(lower);
  });

  return Array.from(new Set(useful)).slice(0, 80);
}

function sanitizeExtractedEntries(items: string[]): string[] {
  const cleaned = items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/\s{2,}/g, ' '))
    .map((item) => item.replace(/\s*\.+\s*\d+\s*$/g, '').trim())
    .map((item) => item.replace(/[–—]/g, '-'))
    .map((item) => item.replace(/\s*-\s*$/g, '').trim())
    .filter((item) => item.length >= 3);

  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of cleaned) {
    const key = normalizeForDedup(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function normalizeForDedup(value: string): string {
  return value
    .toLowerCase()
    .replace(/^\d+(\.\d+)*[\)\].:\s-]*/g, '')
    .replace(/\(.*?\)/g, (m) => m.replace(/\s+/g, ''))
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

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
