import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../../../middleware/auth.js';
import {
  answerQuestion,
  createNewChapter,
  createNewSubchapter,
  createNewSubject,
  fetchAnalytics,
  fetchChaptersBySubject,
  fetchConceptProgress,
  fetchConceptQuestion,
  fetchConceptResume,
  fetchConceptsBySubject,
  fetchSubjects,
  fetchSubchapterDetails,
  fetchSubchapterQa,
  fetchSubchaptersByChapter,
  generateSubchapterMcqs,
  removeChapter,
  removeSubchapter,
  removeSubject,
  renameChapter,
  renameSubchapter,
  renameSubject,
  saveSubchapterQa,
  summarizeSubchapter,
} from '../services/practiceService.js';
import {
  DEFAULT_MCQ_COUNT,
  DEFAULT_MODE,
  MAX_MCQ_COUNT,
  MAX_SUBCHAPTER_HISTORY,
  MAX_TIME_SPENT_SECONDS,
  MIN_MCQ_COUNT,
} from '../services/practiceConstants.js';
import { DEFAULT_MODE, MAX_TIME_SPENT_SECONDS, MAX_SUBCHAPTER_HISTORY, MIN_MCQ_COUNT, MAX_MCQ_COUNT, DEFAULT_MCQ_COUNT } from '../services/practiceConstants.js';

const modeSchema = z.enum(['resume', 'weak', 'random']).default(DEFAULT_MODE);
const listQuestionsQuerySchema = z.object({
  mode: modeSchema.optional(),
});

const answerSchema = z.object({
  selectedOptionIds: z.array(z.string().uuid()).min(1),
  timeSpentSeconds: z.coerce.number().min(0).max(MAX_TIME_SPENT_SECONDS).optional().default(0),
});

const createSubjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

const updateSubjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

const createChapterSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

const updateChapterSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

const createSubchapterSchema = z.object({
  name: z.string().trim().min(2).max(160),
});

const updateSubchapterSchema = z.object({
  name: z.string().trim().min(2).max(160),
});

const summarizeSubchapterSchema = z.object({
  ask: z.string().trim().max(400).optional(),
  history: z.array(z.object({
    question: z.string().trim().min(1).max(400),
    answer: z.string().trim().min(1).max(4000),
  })).max(MAX_SUBCHAPTER_HISTORY).optional(),
});

const generateSubchapterMcqSchema = z.object({
  count: z.coerce.number().int().min(MIN_MCQ_COUNT).max(MAX_MCQ_COUNT).optional().default(DEFAULT_MCQ_COUNT),
});

const saveSubchapterQaSchema = z.object({
  question: z.string().trim().min(1).max(400),
  answer: z.string().trim().min(1).max(8000),
});

export const prepkartaPracticeRouter = Router();

function getAuthed(req: unknown): AuthedRequest['user'] {
  return (req as AuthedRequest).user;
}

prepkartaPracticeRouter.get('/subjects', async (req, res) => {
  const authed = getAuthed(req);
  const subjects = await fetchSubjects(authed.id);
  return res.json({ subjects });
});

prepkartaPracticeRouter.post('/subjects', async (req, res) => {
  const parsed = createSubjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await createNewSubject(parsed.data.name);
  if (!result.ok && result.reason === 'exists') {
    return res.status(409).json({ error: 'Subject already exists' });
  }

  return res.status(201).json(result);
});

prepkartaPracticeRouter.patch('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = updateSubjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await renameSubject(id, parsed.data.name);
  if (!result.ok && result.reason === 'missing') {
    return res.status(404).json({ error: 'Subject not found' });
  }

  return res.json(result);
});

prepkartaPracticeRouter.delete('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  await removeSubject(id);
  return res.json({ message: 'Subject deleted' });
});

prepkartaPracticeRouter.get('/subjects/:id/concepts', async (req, res) => {
  const authed = getAuthed(req);
  const { id: subjectId } = req.params;
  const concepts = await fetchConceptsBySubject(authed.id, subjectId);
  return res.json({ concepts });
});

prepkartaPracticeRouter.get('/subjects/:id/chapters', async (req, res) => {
  const { id: subjectId } = req.params;
  const chapters = await fetchChaptersBySubject(subjectId);
  return res.json({ chapters });
});

prepkartaPracticeRouter.post('/subjects/:id/chapters', async (req, res) => {
  const { id: subjectId } = req.params;
  const parsed = createChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await createNewChapter(subjectId, parsed.data.name);
  if (!result.ok && result.reason === 'missing') {
    return res.status(404).json({ error: 'Subject not found' });
  }

  return res.status(201).json(result);
});

prepkartaPracticeRouter.patch('/chapters/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = updateChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await renameChapter(id, parsed.data.name);
  if (!result.ok && result.reason === 'missing') {
    return res.status(404).json({ error: 'Chapter not found' });
  }

  return res.json(result);
});

prepkartaPracticeRouter.delete('/chapters/:id', async (req, res) => {
  const { id } = req.params;
  await removeChapter(id);
  return res.json({ message: 'Chapter deleted' });
});

prepkartaPracticeRouter.get('/chapters/:id/subchapters', async (req, res) => {
  const { id: chapterId } = req.params;
  const subchapters = await fetchSubchaptersByChapter(chapterId);
  return res.json({ subchapters });
});

prepkartaPracticeRouter.post('/chapters/:id/subchapters', async (req, res) => {
  const { id: chapterId } = req.params;
  const parsed = createSubchapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await createNewSubchapter(chapterId, parsed.data.name);
  if (!result.ok && result.reason === 'missing') {
    return res.status(404).json({ error: 'Chapter not found' });
  }

  return res.status(201).json(result);
});

prepkartaPracticeRouter.patch('/subchapters/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = updateSubchapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await renameSubchapter(id, parsed.data.name);
  if (!result.ok && result.reason === 'missing') {
    return res.status(404).json({ error: 'Subchapter not found' });
  }

  return res.json(result);
});

prepkartaPracticeRouter.delete('/subchapters/:id', async (req, res) => {
  const { id } = req.params;
  await removeSubchapter(id);
  return res.json({ message: 'Subchapter deleted' });
});

prepkartaPracticeRouter.get('/subchapters/:id', async (req, res) => {
  const { id } = req.params;
  const row = await fetchSubchapterDetails(id);

  if (!row) {
    return res.status(404).json({ error: 'Subchapter not found' });
  }
  return res.json(result);
});

prepkartaPracticeRouter.post('/subchapters/:id/summary', async (req, res) => {
  const parsed = summarizeSubchapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await summarizeSubchapter({
    subchapterId: req.params.id,
    ask: parsed.data.ask,
    history: parsed.data.history ?? [],
  });

  if (!result.ok) {
    if (result.reason === 'ai_unavailable') {
      return res.status(400).json({ error: 'AI summary is not configured. Please set HF_TOKEN.' });
    }
    if (result.reason === 'missing') {
      return res.status(404).json({ error: 'Subchapter not found' });
    }
    return res.status(502).json({ error: 'Failed to generate subchapter summary. Please try again.' });
  }

  return res.json({
    summary: result.summary,
    context: result.context,
  });
});

prepkartaPracticeRouter.post('/subchapters/:id/mcq', async (req, res) => {
  const parsed = generateSubchapterMcqSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await generateSubchapterMcqs({
    subchapterId: req.params.id,
    count: parsed.data.count,
  });

  if (!result.ok) {
    if (result.reason === 'ai_unavailable') {
      return res.status(400).json({ error: 'AI summary is not configured. Please set HF_TOKEN.' });
    }
    if (result.reason === 'missing') {
      return res.status(404).json({ error: 'Subchapter not found' });
    }
    return res.status(502).json({ error: 'Failed to generate MCQs. Please try again.' });
  }

  return res.json({
    mcqs: result.mcqs,
    context: result.context,
  });
});

prepkartaPracticeRouter.get('/subchapters/:id/qa', async (req, res) => {
  const authed = getAuthed(req);
  const { id: subchapterId } = req.params;

  const rows = await fetchSubchapterQa(authed.id, subchapterId);
  const turns = rows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }));

  return res.json({ turns });
});

prepkartaPracticeRouter.post('/subchapters/:id/qa', async (req, res) => {
  const authed = getAuthed(req);
  const { id: subchapterId } = req.params;
  const parsed = saveSubchapterQaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await saveSubchapterQa({
    userId: authed.id,
    organizationId: authed.organizationId ?? null,
    subchapterId,
    question: parsed.data.question,
    answer: parsed.data.answer,
  });

  if (!result.ok) {
    return res.status(404).json({ error: 'Subchapter not found' });
  }

  const saved = result.saved;
  return res.status(201).json({
    turn: {
      id: saved?.id ?? '',
      question: saved?.question ?? parsed.data.question,
      answer: saved?.answer ?? parsed.data.answer,
      createdAt: saved?.created_at instanceof Date ? saved.created_at.toISOString() : String(saved?.created_at ?? new Date().toISOString()),
    },
  });
});

prepkartaPracticeRouter.get('/concepts/:id/questions', async (req, res) => {
  const authed = getAuthed(req);
  const { id: conceptId } = req.params;
  const parsed = listQuestionsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
  }
  const mode = parsed.data.mode ?? 'resume';

  const result = await fetchConceptQuestion({ userId: authed.id, conceptId, mode });
  if (!result.ok) {
    return res.status(404).json({ error: 'No questions found for concept' });
  }

  return res.json({
    mode: result.mode,
    question: result.question,
    progress: result.progress,
  });
});

prepkartaPracticeRouter.post('/questions/:id/answer', async (req, res) => {
  const authed = getAuthed(req);
  const { id: questionId } = req.params;
  const parsed = answerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = await answerQuestion({
    userId: authed.id,
    questionId,
    selectedOptionIds: parsed.data.selectedOptionIds,
    timeSpentSeconds: parsed.data.timeSpentSeconds,
  });

  if (!result.ok) {
    return res.status(404).json({ error: 'Question not found' });
  }

  return res.status(201).json({ attempt: result.attempt });
});

prepkartaPracticeRouter.get('/concepts/:id/progress', async (req, res) => {
  const authed = getAuthed(req);
  const { id: conceptId } = req.params;

  const result = await fetchConceptProgress({ userId: authed.id, conceptId });
  if (!result.ok) {
    return res.status(404).json({ error: 'Concept not found' });
  }

  return res.json({ progress: result.progress });
});

prepkartaPracticeRouter.get('/concepts/:id/resume', async (req, res) => {
  const authed = getAuthed(req);
  const { id: conceptId } = req.params;

  const result = await fetchConceptResume({ userId: authed.id, conceptId });
  if (!result.ok) {
    return res.status(404).json({ error: 'Concept not found' });
  }

  return res.json({ resume: result.resume });
});

prepkartaPracticeRouter.get('/user/analytics', async (req, res) => {
  const authed = getAuthed(req);
  const analytics = await fetchAnalytics(authed.id);
  return res.json(analytics);
});
