import { pool } from '../../../db.js';

export type SubjectRow = {
  id: string;
  name: string;
  created_at: Date | string;
};

export type ConceptRow = {
  id: string;
  subject_id: string;
  name: string;
  total_questions: number;
  created_at: Date | string;
};

export type QuestionRow = {
  id: string;
  concept_id: string;
  type: 'single_choice' | 'multiple_choice';
  question_text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  question_order: number;
};

export type OptionRow = {
  id: string;
  question_id: string;
  text: string;
  is_correct: 0 | 1;
};

export type ProgressRow = {
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

export type SubchapterRow = {
  id: string;
  chapter_id: string;
  name: string;
  created_at: Date | string;
};

export type PrepKartaSubchapterQaRow = {
  id: string;
  question: string;
  answer: string;
  created_at: Date | string;
};

export async function listSubjects(): Promise<SubjectRow[]> {
  const [subjectRows] = await pool.query(
    `SELECT id, name, created_at
     FROM prepkarta_subjects
     ORDER BY name ASC`,
  );
  return subjectRows as SubjectRow[];
}

export async function getSubjectByName(name: string): Promise<{ id: string } | null> {
  const [rows] = await pool.query(
    `SELECT id FROM prepkarta_subjects WHERE name = ? LIMIT 1`,
    [name],
  );
  return (rows as Array<{ id: string }>)[0] ?? null;
}

export async function getSubjectById(id: string): Promise<{ id: string } | null> {
  const [rows] = await pool.query(
    `SELECT id FROM prepkarta_subjects WHERE id = ? LIMIT 1`,
    [id],
  );
  return (rows as Array<{ id: string }>)[0] ?? null;
}

export async function createSubject(name: string): Promise<void> {
  await pool.query(
    `INSERT INTO prepkarta_subjects (id, name, created_at)
     VALUES (UUID(), ?, CURRENT_TIMESTAMP)`,
    [name],
  );
}

export async function updateSubject(id: string, name: string): Promise<void> {
  await pool.query(
    `UPDATE prepkarta_subjects
     SET name = ?
     WHERE id = ?`,
    [name, id],
  );
}

export async function deleteSubject(id: string): Promise<void> {
  await pool.query(
    `DELETE FROM prepkarta_subjects
     WHERE id = ?`,
    [id],
  );
}

export async function listConceptsBySubject(subjectId: string): Promise<ConceptRow[]> {
  const [rows] = await pool.query(
    `SELECT id, subject_id, name, total_questions, created_at
     FROM prepkarta_concepts
     WHERE subject_id = ?
     ORDER BY name ASC`,
    [subjectId],
  );
  return rows as ConceptRow[];
}

export async function createChapter(subjectId: string, name: string): Promise<void> {
  await pool.query(
    `INSERT INTO prepkarta_concepts (id, subject_id, name, total_questions, created_at)
     VALUES (UUID(), ?, ?, 0, CURRENT_TIMESTAMP)`,
    [subjectId, name],
  );
}

export async function getConceptById(id: string): Promise<ConceptRow | null> {
  const [rows] = await pool.query(
    `SELECT id, subject_id, name, total_questions, created_at
     FROM prepkarta_concepts
     WHERE id = ?
     LIMIT 1`,
    [id],
  );
  return (rows as ConceptRow[])[0] ?? null;
}

export async function updateChapter(id: string, name: string): Promise<void> {
  await pool.query(
    `UPDATE prepkarta_concepts
     SET name = ?
     WHERE id = ?`,
    [name, id],
  );
}

export async function deleteChapter(id: string): Promise<void> {
  await pool.query(
    `DELETE FROM prepkarta_concepts
     WHERE id = ?`,
    [id],
  );
}

export async function listSubchaptersByChapter(chapterId: string): Promise<SubchapterRow[]> {
  const [rows] = await pool.query(
    `SELECT id, chapter_id, name, created_at
     FROM prepkarta_subchapters
     WHERE chapter_id = ?
     ORDER BY name ASC`,
    [chapterId],
  );
  return rows as SubchapterRow[];
}

export async function getSubchapterById(id: string): Promise<{ id: string } | null> {
  const [rows] = await pool.query(
    `SELECT id FROM prepkarta_subchapters WHERE id = ? LIMIT 1`,
    [id],
  );
  return (rows as Array<{ id: string }>)[0] ?? null;
}

export async function createSubchapter(chapterId: string, name: string): Promise<void> {
  await pool.query(
    `INSERT INTO prepkarta_subchapters (id, chapter_id, name, created_at)
     VALUES (UUID(), ?, ?, CURRENT_TIMESTAMP)`,
    [chapterId, name],
  );
}

export async function updateSubchapter(id: string, name: string): Promise<void> {
  await pool.query(
    `UPDATE prepkarta_subchapters
     SET name = ?
     WHERE id = ?`,
    [name, id],
  );
}

export async function deleteSubchapter(id: string): Promise<void> {
  await pool.query(
    `DELETE FROM prepkarta_subchapters
     WHERE id = ?`,
    [id],
  );
}

export async function getSubchapterDetails(id: string): Promise<{
  subchapter_id: string;
  subchapter_name: string;
  chapter_id: string;
  chapter_name: string;
  subject_id: string;
  subject_name: string;
} | null> {
  const [rows] = await pool.query(
    `SELECT sc.id AS subchapter_id,
            sc.name AS subchapter_name,
            c.id AS chapter_id,
            c.name AS chapter_name,
            s.id AS subject_id,
            s.name AS subject_name
     FROM prepkarta_subchapters sc
     INNER JOIN prepkarta_concepts c ON c.id = sc.chapter_id
     INNER JOIN prepkarta_subjects s ON s.id = c.subject_id
     WHERE sc.id = ?
     LIMIT 1`,
    [id],
  );
  return (rows as Array<{
    subchapter_id: string;
    subchapter_name: string;
    chapter_id: string;
    chapter_name: string;
    subject_id: string;
    subject_name: string;
  }>)[0] ?? null;
}

export async function listSubchapterQa(userId: string, subchapterId: string): Promise<PrepKartaSubchapterQaRow[]> {
  const [rows] = await pool.query(
    `SELECT id, question, answer, created_at
     FROM prepkarta_subchapter_qa
     WHERE user_id = ? AND subchapter_id = ?
     ORDER BY created_at ASC`,
    [userId, subchapterId],
  );
  return rows as PrepKartaSubchapterQaRow[];
}

export async function createSubchapterQa(params: {
  userId: string;
  organizationId: string | null;
  subchapterId: string;
  question: string;
  answer: string;
}): Promise<PrepKartaSubchapterQaRow | null> {
  await pool.query(
    `INSERT INTO prepkarta_subchapter_qa (
       id, user_id, organization_id, subchapter_id, question, answer, created_at
     )
     VALUES (UUID(), ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      params.userId,
      params.organizationId,
      params.subchapterId,
      params.question,
      params.answer,
    ],
  );

  const [savedRows] = await pool.query(
    `SELECT id, question, answer, created_at
     FROM prepkarta_subchapter_qa
     WHERE user_id = ? AND subchapter_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [params.userId, params.subchapterId],
  );

  return (savedRows as PrepKartaSubchapterQaRow[])[0] ?? null;
}

export async function listQuestionsByConcept(conceptId: string): Promise<QuestionRow[]> {
  const [questionRows] = await pool.query(
    `SELECT id, concept_id, type, question_text, difficulty, explanation, question_order
     FROM prepkarta_questions
     WHERE concept_id = ?
     ORDER BY question_order ASC`,
    [conceptId],
  );
  return questionRows as QuestionRow[];
}

export async function listOptionsByQuestion(questionId: string): Promise<OptionRow[]> {
  const [optionRows] = await pool.query(
    `SELECT id, question_id, text, is_correct
     FROM prepkarta_options
     WHERE question_id = ?
     ORDER BY created_at ASC`,
    [questionId],
  );
  return optionRows as OptionRow[];
}

export async function listProgressByUser(userId: string): Promise<ProgressRow[]> {
  const [progressRows] = await pool.query(
    `SELECT id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at
     FROM prepkarta_user_concept_progress
     WHERE user_id = ?`,
    [userId],
  );
  return progressRows as ProgressRow[];
}

export async function listProgressByUserWithSubject(userId: string): Promise<Array<{ subject_id: string; mastery_score: number; attempts_count: number }>> {
  const [progressRows] = await pool.query(
    `SELECT c.subject_id, up.mastery_score, up.attempts_count
     FROM prepkarta_user_concept_progress up
     INNER JOIN prepkarta_concepts c ON c.id = up.concept_id
     WHERE up.user_id = ?`,
    [userId],
  );
  return progressRows as Array<{ subject_id: string; mastery_score: number; attempts_count: number }>;
}

export async function getProgressByUserConcept(userId: string, conceptId: string): Promise<ProgressRow | null> {
  const [progressRows] = await pool.query(
    `SELECT id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at
     FROM prepkarta_user_concept_progress
     WHERE user_id = ? AND concept_id = ?
     LIMIT 1`,
    [userId, conceptId],
  );
  return (progressRows as ProgressRow[])[0] ?? null;
}

export async function listWeakQuestionStats(userId: string, conceptId: string): Promise<Array<{ question_id: string; correct_count: number; wrong_count: number }>> {
  const [weakRows] = await pool.query(
    `SELECT question_id,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
            SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND concept_id = ?
     GROUP BY question_id`,
    [userId, conceptId],
  );
  return weakRows as Array<{ question_id: string; correct_count: number; wrong_count: number }>;
}

export async function getQuestionById(questionId: string): Promise<QuestionRow | null> {
  const [questionRows] = await pool.query(
    `SELECT id, concept_id, type, question_text, difficulty, explanation, question_order
     FROM prepkarta_questions
     WHERE id = ?
     LIMIT 1`,
    [questionId],
  );
  return (questionRows as QuestionRow[])[0] ?? null;
}

export async function listOptionsByQuestionUnordered(questionId: string): Promise<OptionRow[]> {
  const [optionRows] = await pool.query(
    `SELECT id, question_id, text, is_correct
     FROM prepkarta_options
     WHERE question_id = ?`,
    [questionId],
  );
  return optionRows as OptionRow[];
}

export async function countQuestionAttempts(userId: string, questionId: string): Promise<number> {
  const [historyCountRows] = await pool.query(
    `SELECT COUNT(*) AS attempts
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND question_id = ?`,
    [userId, questionId],
  );
  return Number((historyCountRows as Array<{ attempts: number }>)[0]?.attempts ?? 0);
}

export async function getLatestRepetitionLevel(userId: string, questionId: string): Promise<number> {
  const [latestHistoryRows] = await pool.query(
    `SELECT repetition_level
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND question_id = ?
     ORDER BY attempted_at DESC
     LIMIT 1`,
    [userId, questionId],
  );
  return Number((latestHistoryRows as Array<{ repetition_level: number }>)[0]?.repetition_level ?? 0);
}

export async function insertAnswerHistory(params: {
  userId: string;
  conceptId: string;
  questionId: string;
  selectedOptionIds: string[];
  isCorrect: boolean;
  repetitionLevel: number;
  repeatAfterAttempts: number;
  timeSpentSeconds: number;
}): Promise<void> {
  await pool.query(
    `INSERT INTO prepkarta_user_answer_history
     (id, user_id, concept_id, question_id, selected_options, is_correct, repetition_level, repeat_after_attempts, time_spent_seconds, attempted_at)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      params.userId,
      params.conceptId,
      params.questionId,
      JSON.stringify(params.selectedOptionIds),
      params.isCorrect ? 1 : 0,
      params.repetitionLevel,
      params.repeatAfterAttempts,
      params.timeSpentSeconds,
    ],
  );
}

export async function getConceptAggregate(userId: string, conceptId: string): Promise<{
  correct_answers: number;
  wrong_answers: number;
  total_attempts: number;
  total_practice_seconds: number;
} | null> {
  const [aggregateRows] = await pool.query(
    `SELECT
          SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers,
          SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_answers,
          COUNT(*) AS total_attempts,
          COALESCE(SUM(time_spent_seconds), 0) AS total_practice_seconds
       FROM prepkarta_user_answer_history
       WHERE user_id = ? AND concept_id = ?`,
    [userId, conceptId],
  );
  return (aggregateRows as Array<{
    correct_answers: number;
    wrong_answers: number;
    total_attempts: number;
    total_practice_seconds: number;
  }>)[0] ?? null;
}

export async function getConceptTotalQuestions(conceptId: string): Promise<number> {
  const [totalRows] = await pool.query(
    `SELECT total_questions
     FROM prepkarta_concepts
     WHERE id = ?
     LIMIT 1`,
    [conceptId],
  );
  return Number((totalRows as Array<{ total_questions: number }>)[0]?.total_questions ?? 0);
}

export async function upsertConceptProgress(params: {
  userId: string;
  conceptId: string;
  lastQuestionIndex: number;
  masteryScore: number;
  attemptsCount: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalPracticeSeconds: number;
}): Promise<void> {
  await pool.query(
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
      params.userId,
      params.conceptId,
      params.lastQuestionIndex,
      params.masteryScore,
      params.attemptsCount,
      params.correctAnswers,
      params.wrongAnswers,
      params.totalPracticeSeconds,
    ],
  );
}

export async function listAnalyticsAggregate(userId: string): Promise<{
  solved_count: number;
  correct_count: number;
  wrong_count: number;
  practice_seconds: number;
} | null> {
  const [aggregateRows] = await pool.query(
    `SELECT
        COUNT(*) AS solved_count,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count,
        COALESCE(SUM(time_spent_seconds), 0) AS practice_seconds
     FROM prepkarta_user_answer_history
     WHERE user_id = ?`,
    [userId],
  );
  return (aggregateRows as Array<{
    solved_count: number;
    correct_count: number;
    wrong_count: number;
    practice_seconds: number;
  }>)[0] ?? null;
}

export async function listAnalyticsConcepts(userId: string): Promise<Array<{ id: string; name: string; mastery_score: number; attempts_count: number }>> {
  const [conceptRows] = await pool.query(
    `SELECT c.id, c.name, up.mastery_score, up.attempts_count
     FROM prepkarta_user_concept_progress up
     INNER JOIN prepkarta_concepts c ON c.id = up.concept_id
     WHERE up.user_id = ?
     ORDER BY up.mastery_score DESC`,
    [userId],
  );
  return conceptRows as Array<{ id: string; name: string; mastery_score: number; attempts_count: number }>;
}

export async function listDailyPractice(userId: string): Promise<Array<{ day: string; seconds: number }>> {
  const [streakRows] = await pool.query(
    `SELECT DATE(attempted_at) AS day, COALESCE(SUM(time_spent_seconds), 0) AS seconds
     FROM prepkarta_user_answer_history
     WHERE user_id = ?
     GROUP BY DATE(attempted_at)
     ORDER BY day DESC`,
    [userId],
  );
  return streakRows as Array<{ day: string; seconds: number }>;
}

export async function getSubchapterContext(subchapterId: string): Promise<{ subchapter_name: string; chapter_name: string; subject_name: string } | null> {
  const [rows] = await pool.query(
    `SELECT sc.name AS subchapter_name,
            c.name AS chapter_name,
            s.name AS subject_name
     FROM prepkarta_subchapters sc
     INNER JOIN prepkarta_concepts c ON c.id = sc.chapter_id
     INNER JOIN prepkarta_subjects s ON s.id = c.subject_id
     WHERE sc.id = ?
     LIMIT 1`,
    [subchapterId],
  );
  return (rows as Array<{ subchapter_name: string; chapter_name: string; subject_name: string }>)[0] ?? null;
}
