import { env } from '../../../config.js';
import { HuggingFaceClient } from '../../../services/huggingFaceClient.js';
import { buildChapterSummaryPrompt, buildChapterSuggestionPrompt, buildOcrExtractionPrompt } from '../edukartaPrompt.js';
import {
  createChapterQa,
  getProgressProfile,
  getStudentProfile,
  getUserProfileBasics,
  listChapterQa,
  listSubjectChapters,
  replaceSubjectChapters,
  upsertProgressProfile,
  upsertStudentProfile,
} from '../repo/profileRepo.js';

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

export async function fetchStudentProfile(userId: string) {
  return getStudentProfile(userId);
}

export async function saveStudentProfile(params: {
  userId: string;
  organizationId: string | null;
  name: string;
  board: string;
  classLevel: string;
  subjectsJson: string;
}) {
  return upsertStudentProfile(params);
}

export async function fetchSubjectChapters(userId: string) {
  return listSubjectChapters(userId);
}

export async function saveSubjectChapters(params: {
  userId: string;
  organizationId: string | null;
  subject: string;
  chapters: string[];
}) {
  return replaceSubjectChapters(params);
}

export async function suggestChapters(params: {
  userId: string;
  subject: string;
  isbn?: string;
}): Promise<{ chapters: string[]; source: 'book' | 'ai' | 'fallback' }> {
  const profile = await getUserProfileBasics(params.userId);
  const board = profile?.board ?? 'General';
  const classLevel = profile?.class_level ?? 'General';

  const bookChapters = params.isbn ? await fetchBookChaptersByIsbn(params.isbn) : [];
  if (bookChapters.length > 0) {
    return { chapters: bookChapters, source: 'book' };
  }

  const aiSuggestions = await suggestChaptersWithAi(params.subject, board, classLevel, params.isbn);
  if (aiSuggestions.length > 0) {
    return { chapters: aiSuggestions, source: 'ai' };
  }

  return { chapters: getFallbackSuggestions(params.subject), source: 'fallback' };
}

export async function extractChaptersFromImage(params: { subject: string; imageDataUrl: string }) {
  return extractChaptersFromImageInternal(params.subject, params.imageDataUrl);
}

export async function summarizeChapter(params: {
  userId: string;
  subject: string;
  chapter: string;
  ask?: string;
  history?: Array<{ question: string; answer: string }>;
}): Promise<{
  summary: string;
  context: { board: string; classLevel: string; subject: string; chapter: string };
} | null> {
  if (!env.HF_TOKEN || !hfClient.isAvailable()) {
    return null;
  }

  const profile = await getUserProfileBasics(params.userId);
  const board = profile?.board ?? 'General';
  const classLevel = profile?.class_level ?? 'General';

  const prompt = buildChapterSummaryPrompt({
    board,
    classLevel,
    subject: params.subject,
    chapter: params.chapter,
    ask: params.ask,
    history: params.history ?? [],
  });

  const summary = await hfClient.generate(prompt, Math.min(env.HF_MAX_TOKENS, 900));
  if (!summary) {
    return null;
  }

  return {
    summary: summary.trim(),
    context: {
      board,
      classLevel,
      subject: params.subject,
      chapter: params.chapter,
    },
  };
}

export async function fetchChapterQa(params: { userId: string; subject: string; chapter: string }) {
  return listChapterQa(params);
}

export async function saveChapterQa(params: {
  userId: string;
  organizationId: string | null;
  subject: string;
  chapter: string;
  question: string;
  answer: string;
}) {
  return createChapterQa(params);
}

export async function fetchProgressProfile(userId: string) {
  return getProgressProfile(userId);
}

export async function saveProgressProfile(params: {
  userId: string;
  organizationId: string | null;
  progressDataJson: string;
}) {
  return upsertProgressProfile(params);
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

async function suggestChaptersWithAi(subject: string, board: string, classLevel: string, isbn?: string): Promise<string[]> {
  if (!env.HF_TOKEN || !hfClient.isAvailable()) {
    return [];
  }

  const prompt = buildChapterSuggestionPrompt(subject, board, classLevel, isbn);

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

async function extractChaptersFromImageInternal(subject: string, imageDataUrl: string): Promise<string[]> {
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
              text: buildOcrExtractionPrompt(subject),
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
