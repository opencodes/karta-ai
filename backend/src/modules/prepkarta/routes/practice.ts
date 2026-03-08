import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../../db.js';
import type { AuthedRequest } from '../../../middleware/auth.js';
import {
  calculateMasteryScore,
  computeRepeatAfterAttempts,
  computeRepetitionLevel,
  getMasteryStatus,
} from '../services/repetition.js';

const modeSchema = z.enum(['resume', 'weak', 'random']).default('resume');
const listQuestionsQuerySchema = z.object({
  mode: modeSchema.optional(),
});

const answerSchema = z.object({
  selectedOptionIds: z.array(z.string().uuid()).min(1),
  timeSpentSeconds: z.coerce.number().min(0).max(1800).optional().default(0),
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

type SubjectRow = {
  id: string;
  name: string;
  created_at: Date | string;
};

type ConceptRow = {
  id: string;
  subject_id: string;
  name: string;
  total_questions: number;
  created_at: Date | string;
};

type QuestionRow = {
  id: string;
  concept_id: string;
  type: 'single_choice' | 'multiple_choice';
  question_text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  question_order: number;
};

type OptionRow = {
  id: string;
  question_id: string;
  text: string;
  is_correct: 0 | 1;
};

type ProgressRow = {
  id: string;
  user_id: string;
  concept_id: string;
  last_question_index: number;
  mastery_score: number;
  attempts_count: number;
  correct_answers: number;
  wrong_answers: number;
  total_practice_seconds: number;
  updated_at: Date | string;
};

type SubchapterRow = {
  id: string;
  chapter_id: string;
  name: string;
  created_at: Date | string;
};

export const prepkartaPracticeRouter = Router();

function getAuthed(req: unknown): AuthedRequest['user'] {
  return (req as AuthedRequest).user;
}

prepkartaPracticeRouter.get('/subjects', async (req, res) => {
  const authed = getAuthed(req);

  const [subjectRows] = await pool.query(
    `SELECT id, name, created_at
     FROM prepkarta_subjects
     ORDER BY name ASC`,
  );
  const subjects = subjectRows as SubjectRow[];

  const [progressRows] = await pool.query(
    `SELECT c.subject_id, up.mastery_score, up.attempts_count
     FROM prepkarta_user_concept_progress up
     INNER JOIN prepkarta_concepts c ON c.id = up.concept_id
     WHERE up.user_id = ?`,
    [authed.id],
  );

  const grouped = (progressRows as Array<{ subject_id: string; mastery_score: number; attempts_count: number }>)
    .reduce<Record<string, { masterySum: number; conceptCount: number; attempts: number }>>((acc, row) => {
      if (!acc[row.subject_id]) acc[row.subject_id] = { masterySum: 0, conceptCount: 0, attempts: 0 };
      acc[row.subject_id].masterySum += Number(row.mastery_score ?? 0);
      acc[row.subject_id].conceptCount += 1;
      acc[row.subject_id].attempts += Number(row.attempts_count ?? 0);
      return acc;
    }, {});

  const payload = subjects.map((subject) => {
    const stats = grouped[subject.id] ?? { masterySum: 0, conceptCount: 0, attempts: 0 };
    const progress = stats.conceptCount > 0 ? stats.masterySum / stats.conceptCount : 0;
    return {
      id: subject.id,
      name: subject.name,
      progress: Number(progress.toFixed(4)),
      attempts: stats.attempts,
    };
  });

  return res.json({ subjects: payload });
});

prepkartaPracticeRouter.post('/subjects', async (req, res) => {
  const parsed = createSubjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const name = parsed.data.name;
  const [existsRows] = await pool.query(
    `SELECT id FROM prepkarta_subjects WHERE name = ? LIMIT 1`,
    [name],
  );
  if (Array.isArray(existsRows) && existsRows.length > 0) {
    return res.status(409).json({ error: 'Subject already exists' });
  }

  await pool.query(
    `INSERT INTO prepkarta_subjects (id, name, created_at)
     VALUES (UUID(), ?, CURRENT_TIMESTAMP)`,
    [name],
  );

  return res.status(201).json({ message: 'Subject created' });
});

prepkartaPracticeRouter.patch('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = updateSubjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const [rows] = await pool.query(
    `SELECT id FROM prepkarta_subjects WHERE id = ? LIMIT 1`,
    [id],
  );
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  await pool.query(
    `UPDATE prepkarta_subjects
     SET name = ?
     WHERE id = ?`,
    [parsed.data.name, id],
  );

  return res.json({ message: 'Subject updated' });
});

prepkartaPracticeRouter.delete('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `DELETE FROM prepkarta_subjects
     WHERE id = ?`,
    [id],
  );
  return res.json({ message: 'Subject deleted' });
});

prepkartaPracticeRouter.get('/subjects/:id/concepts', async (req, res) => {
  const authed = getAuthed(req);
  const { id: subjectId } = req.params;

  const [conceptRows] = await pool.query(
    `SELECT id, subject_id, name, total_questions, created_at
     FROM prepkarta_concepts
     WHERE subject_id = ?
     ORDER BY name ASC`,
    [subjectId],
  );
  const concepts = conceptRows as ConceptRow[];

  const [progressRows] = await pool.query(
    `SELECT id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at
     FROM prepkarta_user_concept_progress
     WHERE user_id = ?`,
    [authed.id],
  );

  const progressByConcept = new Map<string, ProgressRow>(
    (progressRows as ProgressRow[]).map((row) => [row.concept_id, row]),
  );

  const payload = concepts.map((concept) => {
    const progress = progressByConcept.get(concept.id);
    const masteryScore = Number(progress?.mastery_score ?? 0);
    const attempts = Number(progress?.attempts_count ?? 0);
    return {
      id: concept.id,
      subjectId: concept.subject_id,
      name: concept.name,
      totalQuestions: concept.total_questions,
      attemptedQuestions: attempts,
      masteryScore,
      masteryStatus: getMasteryStatus(masteryScore, attempts),
      progressPercent: concept.total_questions > 0
        ? Math.min(100, Math.round((attempts / concept.total_questions) * 100))
        : 0,
      weak: getMasteryStatus(masteryScore, attempts) === 'weak',
    };
  });

  return res.json({ concepts: payload });
});

prepkartaPracticeRouter.get('/subjects/:id/chapters', async (req, res) => {
  const { id: subjectId } = req.params;
  const [rows] = await pool.query(
    `SELECT id, subject_id, name, total_questions, created_at
     FROM prepkarta_concepts
     WHERE subject_id = ?
     ORDER BY name ASC`,
    [subjectId],
  );
  const chapters = (rows as ConceptRow[]).map((row) => ({
    id: row.id,
    subjectId: row.subject_id,
    name: row.name,
    totalQuestions: row.total_questions,
  }));
  return res.json({ chapters });
});

prepkartaPracticeRouter.post('/subjects/:id/chapters', async (req, res) => {
  const { id: subjectId } = req.params;
  const parsed = createChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const [subjectRows] = await pool.query(
    `SELECT id FROM prepkarta_subjects WHERE id = ? LIMIT 1`,
    [subjectId],
  );
  if (!Array.isArray(subjectRows) || subjectRows.length === 0) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  await pool.query(
    `INSERT INTO prepkarta_concepts (id, subject_id, name, total_questions, created_at)
     VALUES (UUID(), ?, ?, 0, CURRENT_TIMESTAMP)`,
    [subjectId, parsed.data.name],
  );

  return res.status(201).json({ message: 'Chapter created' });
});

prepkartaPracticeRouter.patch('/chapters/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = updateChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const [rows] = await pool.query(
    `SELECT id FROM prepkarta_concepts WHERE id = ? LIMIT 1`,
    [id],
  );
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(404).json({ error: 'Chapter not found' });
  }

  await pool.query(
    `UPDATE prepkarta_concepts
     SET name = ?
     WHERE id = ?`,
    [parsed.data.name, id],
  );

  return res.json({ message: 'Chapter updated' });
});

prepkartaPracticeRouter.delete('/chapters/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `DELETE FROM prepkarta_concepts
     WHERE id = ?`,
    [id],
  );
  return res.json({ message: 'Chapter deleted' });
});

prepkartaPracticeRouter.get('/chapters/:id/subchapters', async (req, res) => {
  const { id: chapterId } = req.params;
  const [rows] = await pool.query(
    `SELECT id, chapter_id, name, created_at
     FROM prepkarta_subchapters
     WHERE chapter_id = ?
     ORDER BY name ASC`,
    [chapterId],
  );
  const subchapters = (rows as SubchapterRow[]).map((row) => ({
    id: row.id,
    chapterId: row.chapter_id,
    name: row.name,
  }));
  return res.json({ subchapters });
});

prepkartaPracticeRouter.post('/chapters/:id/subchapters', async (req, res) => {
  const { id: chapterId } = req.params;
  const parsed = createSubchapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const [chapterRows] = await pool.query(
    `SELECT id FROM prepkarta_concepts WHERE id = ? LIMIT 1`,
    [chapterId],
  );
  if (!Array.isArray(chapterRows) || chapterRows.length === 0) {
    return res.status(404).json({ error: 'Chapter not found' });
  }

  await pool.query(
    `INSERT INTO prepkarta_subchapters (id, chapter_id, name, created_at)
     VALUES (UUID(), ?, ?, CURRENT_TIMESTAMP)`,
    [chapterId, parsed.data.name],
  );

  return res.status(201).json({ message: 'Subchapter created' });
});

prepkartaPracticeRouter.patch('/subchapters/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = updateSubchapterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const [rows] = await pool.query(
    `SELECT id FROM prepkarta_subchapters WHERE id = ? LIMIT 1`,
    [id],
  );
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(404).json({ error: 'Subchapter not found' });
  }

  await pool.query(
    `UPDATE prepkarta_subchapters
     SET name = ?
     WHERE id = ?`,
    [parsed.data.name, id],
  );

  return res.json({ message: 'Subchapter updated' });
});

prepkartaPracticeRouter.delete('/subchapters/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `DELETE FROM prepkarta_subchapters
     WHERE id = ?`,
    [id],
  );
  return res.json({ message: 'Subchapter deleted' });
});

prepkartaPracticeRouter.get('/concepts/:id/questions', async (req, res) => {
  const authed = getAuthed(req);
  const { id: conceptId } = req.params;
  const parsed = listQuestionsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
  }
  const mode = parsed.data.mode ?? 'resume';

  const [questionRows] = await pool.query(
    `SELECT id, concept_id, type, question_text, difficulty, explanation, question_order
     FROM prepkarta_questions
     WHERE concept_id = ?
     ORDER BY question_order ASC`,
    [conceptId],
  );
  const questions = questionRows as QuestionRow[];
  if (questions.length === 0) {
    return res.status(404).json({ error: 'No questions found for concept' });
  }

  const [progressRows] = await pool.query(
    `SELECT id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at
     FROM prepkarta_user_concept_progress
     WHERE user_id = ? AND concept_id = ?
     LIMIT 1`,
    [authed.id, conceptId],
  );
  const progress = (progressRows as ProgressRow[])[0];

  const [weakRows] = await pool.query(
    `SELECT question_id,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
            SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND concept_id = ?
     GROUP BY question_id`,
    [authed.id, conceptId],
  );
  const weakSet = new Set(
    (weakRows as Array<{ question_id: string; correct_count: number; wrong_count: number }>)
      .filter((row) => Number(row.wrong_count) > Number(row.correct_count))
      .map((row) => row.question_id),
  );

  let selected = questions[0];
  if (mode === 'resume') {
    const index = Math.max(0, Math.min(questions.length - 1, Number(progress?.last_question_index ?? 0)));
    selected = questions[index] ?? questions[0];
  } else if (mode === 'weak') {
    const weakQuestion = questions.find((question) => weakSet.has(question.id));
    selected = weakQuestion ?? questions[Math.floor(Math.random() * questions.length)];
  } else {
    selected = questions[Math.floor(Math.random() * questions.length)];
  }

  const [optionRows] = await pool.query(
    `SELECT id, question_id, text, is_correct
     FROM prepkarta_options
     WHERE question_id = ?
     ORDER BY created_at ASC`,
    [selected.id],
  );
  const options = (optionRows as OptionRow[]).map((option) => ({
    id: option.id,
    text: option.text,
  }));

  return res.json({
    mode,
    question: {
      id: selected.id,
      conceptId: selected.concept_id,
      type: selected.type,
      questionText: selected.question_text,
      difficulty: selected.difficulty,
      questionOrder: selected.question_order,
      options,
    },
    progress: {
      attempted: Number(progress?.attempts_count ?? 0),
      total: questions.length,
    },
  });
});

prepkartaPracticeRouter.post('/questions/:id/answer', async (req, res) => {
  const authed = getAuthed(req);
  const { id: questionId } = req.params;
  const parsed = answerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const [questionRows] = await pool.query(
    `SELECT id, concept_id, type, question_text, difficulty, explanation, question_order
     FROM prepkarta_questions
     WHERE id = ?
     LIMIT 1`,
    [questionId],
  );
  const question = (questionRows as QuestionRow[])[0];
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const [optionRows] = await pool.query(
    `SELECT id, question_id, text, is_correct
     FROM prepkarta_options
     WHERE question_id = ?`,
    [questionId],
  );
  const options = optionRows as OptionRow[];
  const correctOptionIds = options.filter((option) => option.is_correct === 1).map((option) => option.id).sort();
  const selectedOptionIds = Array.from(new Set(parsed.data.selectedOptionIds)).sort();
  const isCorrect =
    correctOptionIds.length === selectedOptionIds.length &&
    correctOptionIds.every((optionId, index) => optionId === selectedOptionIds[index]);

  const [historyCountRows] = await pool.query(
    `SELECT COUNT(*) AS attempts
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND question_id = ?`,
    [authed.id, questionId],
  );
  const attemptsForQuestion = Number((historyCountRows as Array<{ attempts: number }>)[0]?.attempts ?? 0) + 1;

  const [latestHistoryRows] = await pool.query(
    `SELECT repetition_level
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND question_id = ?
     ORDER BY attempted_at DESC
     LIMIT 1`,
    [authed.id, questionId],
  );
  const previousLevel = Number((latestHistoryRows as Array<{ repetition_level: number }>)[0]?.repetition_level ?? 0);
  const repetitionLevel = computeRepetitionLevel(previousLevel, isCorrect);
  const repeatAfterAttempts = computeRepeatAfterAttempts(attemptsForQuestion, isCorrect);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO prepkarta_user_answer_history
       (id, user_id, concept_id, question_id, selected_options, is_correct, repetition_level, repeat_after_attempts, time_spent_seconds, attempted_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        authed.id,
        question.concept_id,
        questionId,
        JSON.stringify(selectedOptionIds),
        isCorrect ? 1 : 0,
        repetitionLevel,
        repeatAfterAttempts,
        parsed.data.timeSpentSeconds,
      ],
    );

    const [aggregateRows] = await connection.query(
      `SELECT
          SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers,
          SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_answers,
          COUNT(*) AS total_attempts,
          COALESCE(SUM(time_spent_seconds), 0) AS total_practice_seconds
       FROM prepkarta_user_answer_history
       WHERE user_id = ? AND concept_id = ?`,
      [authed.id, question.concept_id],
    );
    const aggregate = (aggregateRows as Array<{
      correct_answers: number;
      wrong_answers: number;
      total_attempts: number;
      total_practice_seconds: number;
    }>)[0];

    const [totalRows] = await connection.query(
      `SELECT total_questions
       FROM prepkarta_concepts
       WHERE id = ?
       LIMIT 1`,
      [question.concept_id],
    );
    const totalQuestions = Number((totalRows as Array<{ total_questions: number }>)[0]?.total_questions ?? 1);
    const nextIndex = Math.min(totalQuestions - 1, Number(question.question_order ?? 1));
    const masteryScore = calculateMasteryScore(
      Number(aggregate?.correct_answers ?? 0),
      Number(aggregate?.wrong_answers ?? 0),
      Number(aggregate?.total_attempts ?? 0),
    );

    await connection.query(
      `INSERT INTO prepkarta_user_concept_progress
       (id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE
         last_question_index = VALUES(last_question_index),
         mastery_score = VALUES(mastery_score),
         attempts_count = VALUES(attempts_count),
         correct_answers = VALUES(correct_answers),
         wrong_answers = VALUES(wrong_answers),
         total_practice_seconds = VALUES(total_practice_seconds),
         updated_at = CURRENT_TIMESTAMP`,
      [
        authed.id,
        question.concept_id,
        nextIndex,
        masteryScore,
        Number(aggregate?.total_attempts ?? 0),
        Number(aggregate?.correct_answers ?? 0),
        Number(aggregate?.wrong_answers ?? 0),
        Number(aggregate?.total_practice_seconds ?? 0),
      ],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return res.status(201).json({
    attempt: {
      questionId,
      conceptId: question.concept_id,
      isCorrect,
      correctOptionIds,
      explanation: question.explanation,
      repetitionLevel,
      repeatAfterAttempts,
    },
  });
});

prepkartaPracticeRouter.get('/concepts/:id/progress', async (req, res) => {
  const authed = getAuthed(req);
  const { id: conceptId } = req.params;

  const [conceptRows] = await pool.query(
    `SELECT id, subject_id, name, total_questions, created_at
     FROM prepkarta_concepts
     WHERE id = ?
     LIMIT 1`,
    [conceptId],
  );
  const concept = (conceptRows as ConceptRow[])[0];
  if (!concept) {
    return res.status(404).json({ error: 'Concept not found' });
  }

  const [progressRows] = await pool.query(
    `SELECT id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at
     FROM prepkarta_user_concept_progress
     WHERE user_id = ? AND concept_id = ?
     LIMIT 1`,
    [authed.id, conceptId],
  );
  const progress = (progressRows as ProgressRow[])[0];
  const attempts = Number(progress?.attempts_count ?? 0);
  const correct = Number(progress?.correct_answers ?? 0);
  const wrong = Number(progress?.wrong_answers ?? 0);
  const accuracy = attempts > 0 ? correct / attempts : 0;

  return res.json({
    progress: {
      conceptId,
      attemptedQuestions: attempts,
      totalQuestions: concept.total_questions,
      masteryScore: Number(progress?.mastery_score ?? 0),
      masteryStatus: getMasteryStatus(Number(progress?.mastery_score ?? 0), attempts),
      correctAnswers: correct,
      wrongAnswers: wrong,
      accuracy: Number(accuracy.toFixed(4)),
      totalPracticeSeconds: Number(progress?.total_practice_seconds ?? 0),
    },
  });
});

prepkartaPracticeRouter.get('/concepts/:id/resume', async (req, res) => {
  const authed = getAuthed(req);
  const { id: conceptId } = req.params;

  const [conceptRows] = await pool.query(
    `SELECT id, subject_id, name, total_questions, created_at
     FROM prepkarta_concepts
     WHERE id = ?
     LIMIT 1`,
    [conceptId],
  );
  const concept = (conceptRows as ConceptRow[])[0];
  if (!concept) {
    return res.status(404).json({ error: 'Concept not found' });
  }

  const [progressRows] = await pool.query(
    `SELECT id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at
     FROM prepkarta_user_concept_progress
     WHERE user_id = ? AND concept_id = ?
     LIMIT 1`,
    [authed.id, conceptId],
  );
  const progress = (progressRows as ProgressRow[])[0];
  const attempted = Number(progress?.attempts_count ?? 0);

  const [weakRows] = await pool.query(
    `SELECT COUNT(*) AS weak_count
     FROM (
        SELECT question_id,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
               SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count
        FROM prepkarta_user_answer_history
        WHERE user_id = ? AND concept_id = ?
        GROUP BY question_id
      ) t
     WHERE wrong_count > correct_count`,
    [authed.id, conceptId],
  );
  const weakCount = Number((weakRows as Array<{ weak_count: number }>)[0]?.weak_count ?? 0);

  return res.json({
    resume: {
      conceptId,
      totalQuestions: concept.total_questions,
      attemptedQuestions: attempted,
      remainingQuestions: Math.max(0, concept.total_questions - attempted),
      lastQuestionIndex: Number(progress?.last_question_index ?? 0),
      weakQuestionsCount: weakCount,
      modes: ['resume', 'weak', 'random'],
    },
  });
});

prepkartaPracticeRouter.get('/user/analytics', async (req, res) => {
  const authed = getAuthed(req);

  const [aggregateRows] = await pool.query(
    `SELECT
        COUNT(*) AS solved_count,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count,
        COALESCE(SUM(time_spent_seconds), 0) AS practice_seconds
     FROM prepkarta_user_answer_history
     WHERE user_id = ?`,
    [authed.id],
  );
  const aggregate = (aggregateRows as Array<{
    solved_count: number;
    correct_count: number;
    wrong_count: number;
    practice_seconds: number;
  }>)[0];
  const solvedCount = Number(aggregate?.solved_count ?? 0);
  const correctCount = Number(aggregate?.correct_count ?? 0);
  const accuracy = solvedCount > 0 ? correctCount / solvedCount : 0;

  const [conceptRows] = await pool.query(
    `SELECT c.id, c.name, up.mastery_score, up.attempts_count
     FROM prepkarta_user_concept_progress up
     INNER JOIN prepkarta_concepts c ON c.id = up.concept_id
     WHERE up.user_id = ?
     ORDER BY up.mastery_score DESC`,
    [authed.id],
  );
  const concepts = (conceptRows as Array<{ id: string; name: string; mastery_score: number; attempts_count: number }>);
  const strongest = concepts.slice(0, 5).map((item) => ({ conceptId: item.id, name: item.name, masteryScore: Number(item.mastery_score ?? 0) }));
  const weakest = [...concepts]
    .sort((a, b) => Number(a.mastery_score ?? 0) - Number(b.mastery_score ?? 0))
    .slice(0, 5)
    .map((item) => ({ conceptId: item.id, name: item.name, masteryScore: Number(item.mastery_score ?? 0) }));

  const [streakRows] = await pool.query(
    `SELECT DATE(attempted_at) AS day, COALESCE(SUM(time_spent_seconds), 0) AS seconds
     FROM prepkarta_user_answer_history
     WHERE user_id = ?
     GROUP BY DATE(attempted_at)
     ORDER BY day DESC`,
    [authed.id],
  );
  const streakData = streakRows as Array<{ day: string; seconds: number }>;
  let streak = 0;
  let cursor = new Date();
  for (const row of streakData) {
    const day = new Date(row.day);
    if (
      day.getUTCFullYear() === cursor.getUTCFullYear() &&
      day.getUTCMonth() === cursor.getUTCMonth() &&
      day.getUTCDate() === cursor.getUTCDate()
    ) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  const avgDailyPracticeDuration = streakData.length > 0
    ? Math.round(streakData.reduce((sum, item) => sum + Number(item.seconds ?? 0), 0) / streakData.length)
    : 0;
  const masteredConceptsCount = concepts.filter((item) => getMasteryStatus(Number(item.mastery_score ?? 0), Number(item.attempts_count ?? 0)) === 'mastered').length;
  const readiness = Math.min(100, Math.round((accuracy * 70) + (masteredConceptsCount * 6) + Math.min(20, streak * 2)));

  return res.json({
    analytics: {
      accuracyRate: Number(accuracy.toFixed(4)),
      strongestConcepts: strongest,
      weakestConcepts: weakest,
      questionsSolved: solvedCount,
      practiceTimeSeconds: Number(aggregate?.practice_seconds ?? 0),
      interviewReadinessScore: readiness,
      dailyPracticeStreak: streak,
      avgDailyPracticeDurationSeconds: avgDailyPracticeDuration,
      conceptsMasteredCount: masteredConceptsCount,
    },
  });
});
