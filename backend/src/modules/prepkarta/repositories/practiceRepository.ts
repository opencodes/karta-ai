import type { Pool, PoolConnection } from 'mysql2/promise';
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

export type SubchapterContextRow = {
  subchapter_name: string;
  chapter_name: string;
  subject_name: string;
};

export type SubchapterDetailRow = {
  subchapter_id: string;
  subchapter_name: string;
  chapter_id: string;
  chapter_name: string;
  subject_id: string;
  subject_name: string;
};

export type SubchapterQaRow = {
  id: string;
  question: string;
  answer: string;
  created_at: Date | string;
};

type DbConn = Pool | PoolConnection;

function getDb(connection?: DbConn) {
  return connection ?? pool;
}

export async function listSubjects(connection?: DbConn): Promise<SubjectRow[]> {
  const [rows] = await getDb(connection).query(
    `SELECT id, name, created_at
     FROM prepkarta_subjects
     ORDER BY name ASC`,
  );
  return rows as SubjectRow[];
}

export async function findSubjectByName(name: string, connection?: DbConn): Promise<Pick<SubjectRow, 'id'> | null> {
  const [rows] = await getDb(connection).query(
    `SELECT id FROM prepkarta_subjects WHERE name = ? LIMIT 1`,
    [name],
  );
  return (rows as Array<{ id: string }>)[0] ?? null;
}

export async function findSubjectById(id: string, connection?: DbConn): Promise<Pick<SubjectRow, 'id'> | null> {
  const [rows] = await getDb(connection).query(
    `SELECT id FROM prepkarta_subjects WHERE id = ? LIMIT 1`,
    [id],
  );
  return (rows as Array<{ id: string }>)[0] ?? null;
}

export async function createSubject(name: string, connection?: DbConn): Promise<void> {
  await getDb(connection).query(
    `INSERT INTO prepkarta_subjects (id, name, created_at)
     VALUES (UUID(), ?, CURRENT_TIMESTAMP)`,
    [name],
  );
}

export async function updateSubject(id: string, name: string, connection?: DbConn): Promise<void> {
  await getDb(connection).query(
    `UPDATE prepkarta_subjects
     SET name = ?
     WHERE id = ?`,
    [name, id],
  );
}

export async function deleteSubject(id: string, connection?: DbConn): Promise<void> {
  await getDb(connection).query(
    `DELETE FROM prepkarta_subjects
     WHERE id = ?`,
    [id],
  );
}

export async function listConceptsBySubject(subjectId: string, connection?: DbConn): Promise<ConceptRow[]> {
  const [rows] = await getDb(connection).query(
    `SELECT id, subject_id, name, total_questions, created_at
     FROM prepkarta_concepts
     WHERE subject_id = ?
     ORDER BY name ASC`,
    [subjectId],
  );
  return rows as ConceptRow[];
}

export async function findConceptById(id: string, connection?: DbConn): Promise<ConceptRow | null> {
  const [rows] = await getDb(connection).query(
    `SELECT id, subject_id, name, total_questions, created_at
     FROM prepkarta_concepts
     WHERE id = ?
     LIMIT 1`,
    [id],
  );
  return (rows as ConceptRow[])[0] ?? null;
}

export async function createConcept(subjectId: string, name: string, connection?: DbConn): Promise<void> {
  await getDb(connection).query(
    `INSERT INTO prepkarta_concepts (id, subject_id, name, total_questions, created_at)
     VALUES (UUID(), ?, ?, 0, CURRENT_TIMESTAMP)`,
    [subjectId, name],
  );
}

export async function updateConcept(id: string, name: string, connection?: DbConn): Promise<void> {
  await getDb(connection).query(
    `UPDATE prepkarta_concepts
     SET name = ?
     WHERE id = ?`,
    [name, id],
  );
}

export async function deleteConcept(id: string, connection?: DbConn): Promise<void> {
  await getDb(connection).query(
    `DELETE FROM prepkarta_concepts
     WHERE id = ?`,
    [id],
  );
}

export async function listSubchaptersByChapter(chapterId: string, connection?: DbConn): Promise<SubchapterRow[]> {
  const [rows] = await getDb(connection).query(
    `SELECT id, chapter_id, name, created_at
     FROM prepkarta_subchapters
     WHERE chapter_id = ?
     ORDER BY name ASC`,
    [chapterId],
  );
  return rows as SubchapterRow[];
}

export async function findSubchapterById(id: string, connection?: DbConn): Promise<Pick<SubchapterRow, 'id'> | null> {
  const [rows] = await getDb(connection).query(
    `SELECT id FROM prepkarta_subchapters WHERE id = ? LIMIT 1`,
    [id],
  );
  return (rows as Array<{ id: string }>)[0] ?? null;
}

export async function createSubchapter(chapterId: string, name: string, connection?: DbConn): Promise<void> {
  await getDb(connection).query(
    `INSERT INTO prepkarta_subchapters (id, chapter_id, name, created_at)
     VALUES (UUID(), ?, ?, CURRENT_TIMESTAMP)`,
    [chapterId, name],
  );
}

export async function updateSubchapter(id: string, name: string, connection?: DbConn): Promise<void> {
  await getDb(connection).query(
    `UPDATE prepkarta_subchapters
     SET name = ?
     WHERE id = ?`,
    [name, id],
  );
}

export async function deleteSubchapter(id: string, connection?: DbConn): Promise<void> {
  await getDb(connection).query(
    `DELETE FROM prepkarta_subchapters
     WHERE id = ?`,
    [id],
  );
}

export async function getSubchapterDetail(id: string, connection?: DbConn): Promise<SubchapterDetailRow | null> {
  const [rows] = await getDb(connection).query(
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
  return (rows as SubchapterDetailRow[])[0] ?? null;
}

export async function getSubchapterContext(id: string, connection?: DbConn): Promise<SubchapterContextRow | null> {
  const [rows] = await getDb(connection).query(
    `SELECT sc.name AS subchapter_name,
            c.name AS chapter_name,
            s.name AS subject_name
     FROM prepkarta_subchapters sc
     INNER JOIN prepkarta_concepts c ON c.id = sc.chapter_id
     INNER JOIN prepkarta_subjects s ON s.id = c.subject_id
     WHERE sc.id = ?
     LIMIT 1`,
    [id],
  );
  return (rows as SubchapterContextRow[])[0] ?? null;
}

export async function listSubchapterQa(userId: string, subchapterId: string, connection?: DbConn): Promise<SubchapterQaRow[]> {
  const [rows] = await getDb(connection).query(
    `SELECT id, question, answer, created_at
     FROM prepkarta_subchapter_qa
     WHERE user_id = ? AND subchapter_id = ?
     ORDER BY created_at ASC`,
    [userId, subchapterId],
  );
  return rows as SubchapterQaRow[];
}

export async function insertSubchapterQa(
  userId: string,
  organizationId: string | null,
  subchapterId: string,
  question: string,
  answer: string,
  connection?: DbConn,
): Promise<void> {
  await getDb(connection).query(
    `INSERT INTO prepkarta_subchapter_qa (
       id, user_id, organization_id, subchapter_id, question, answer, created_at
     )
     VALUES (UUID(), ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [userId, organizationId, subchapterId, question, answer],
  );
}

export async function getLatestSubchapterQa(userId: string, subchapterId: string, connection?: DbConn): Promise<SubchapterQaRow | null> {
  const [rows] = await getDb(connection).query(
    `SELECT id, question, answer, created_at
     FROM prepkarta_subchapter_qa
     WHERE user_id = ? AND subchapter_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, subchapterId],
  );
  return (rows as SubchapterQaRow[])[0] ?? null;
}

export async function listQuestionsByConcept(conceptId: string, connection?: DbConn): Promise<QuestionRow[]> {
  const [rows] = await getDb(connection).query(
    `SELECT id, concept_id, type, question_text, difficulty, explanation, question_order
     FROM prepkarta_questions
     WHERE concept_id = ?
     ORDER BY question_order ASC`,
    [conceptId],
  );
  return rows as QuestionRow[];
}

export async function findQuestionById(questionId: string, connection?: DbConn): Promise<QuestionRow | null> {
  const [rows] = await getDb(connection).query(
    `SELECT id, concept_id, type, question_text, difficulty, explanation, question_order
     FROM prepkarta_questions
     WHERE id = ?
     LIMIT 1`,
    [questionId],
  );
  return (rows as QuestionRow[])[0] ?? null;
}

export async function listOptionsByQuestion(questionId: string, connection?: DbConn): Promise<OptionRow[]> {
  const [rows] = await getDb(connection).query(
    `SELECT id, question_id, text, is_correct
     FROM prepkarta_options
     WHERE question_id = ?
     ORDER BY created_at ASC`,
    [questionId],
  );
  return rows as OptionRow[];
}

export async function listOptionsByQuestionUnordered(questionId: string, connection?: DbConn): Promise<OptionRow[]> {
  const [rows] = await getDb(connection).query(
    `SELECT id, question_id, text, is_correct
     FROM prepkarta_options
     WHERE question_id = ?`,
    [questionId],
  );
  return rows as OptionRow[];
}

export async function getUserConceptProgress(userId: string, conceptId: string, connection?: DbConn): Promise<ProgressRow | null> {
  const [rows] = await getDb(connection).query(
    `SELECT id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at
     FROM prepkarta_user_concept_progress
     WHERE user_id = ? AND concept_id = ?
     LIMIT 1`,
    [userId, conceptId],
  );
  return (rows as ProgressRow[])[0] ?? null;
}

export async function listUserConceptProgress(userId: string, connection?: DbConn): Promise<ProgressRow[]> {
  const [rows] = await getDb(connection).query(
    `SELECT id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at
     FROM prepkarta_user_concept_progress
     WHERE user_id = ?`,
    [userId],
  );
  return rows as ProgressRow[];
}

export async function listUserProgressBySubject(userId: string, connection?: DbConn): Promise<Array<{ subject_id: string; mastery_score: number; attempts_count: number }>> {
  const [rows] = await getDb(connection).query(
    `SELECT c.subject_id, up.mastery_score, up.attempts_count
     FROM prepkarta_user_concept_progress up
     INNER JOIN prepkarta_concepts c ON c.id = up.concept_id
     WHERE up.user_id = ?`,
    [userId],
  );
  return rows as Array<{ subject_id: string; mastery_score: number; attempts_count: number }>;
}

export async function listWeakQuestionRows(userId: string, conceptId: string, connection?: DbConn): Promise<Array<{ question_id: string; correct_count: number; wrong_count: number }>> {
  const [rows] = await getDb(connection).query(
    `SELECT question_id,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
            SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND concept_id = ?
     GROUP BY question_id`,
    [userId, conceptId],
  );
  return rows as Array<{ question_id: string; correct_count: number; wrong_count: number }>;
}

export async function countUserQuestionAttempts(userId: string, questionId: string, connection?: DbConn): Promise<number> {
  const [rows] = await getDb(connection).query(
    `SELECT COUNT(*) AS attempts
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND question_id = ?`,
    [userId, questionId],
  );
  return Number((rows as Array<{ attempts: number }>)[0]?.attempts ?? 0);
}

export async function getLatestRepetitionLevel(userId: string, questionId: string, connection?: DbConn): Promise<number> {
  const [rows] = await getDb(connection).query(
    `SELECT repetition_level
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND question_id = ?
     ORDER BY attempted_at DESC
     LIMIT 1`,
    [userId, questionId],
  );
  return Number((rows as Array<{ repetition_level: number }>)[0]?.repetition_level ?? 0);
}

export async function insertAnswerHistory(
  userId: string,
  conceptId: string,
  questionId: string,
  selectedOptionIds: string[],
  isCorrect: boolean,
  repetitionLevel: number,
  repeatAfterAttempts: number,
  timeSpentSeconds: number,
  connection?: DbConn,
): Promise<void> {
  await getDb(connection).query(
    `INSERT INTO prepkarta_user_answer_history
     (id, user_id, concept_id, question_id, selected_options, is_correct, repetition_level, repeat_after_attempts, time_spent_seconds, attempted_at)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      userId,
      conceptId,
      questionId,
      JSON.stringify(selectedOptionIds),
      isCorrect ? 1 : 0,
      repetitionLevel,
      repeatAfterAttempts,
      timeSpentSeconds,
    ],
  );
}

export async function getConceptTotals(conceptId: string, connection?: DbConn): Promise<number> {
  const [rows] = await getDb(connection).query(
    `SELECT total_questions
     FROM prepkarta_concepts
     WHERE id = ?
     LIMIT 1`,
    [conceptId],
  );
  return Number((rows as Array<{ total_questions: number }>)[0]?.total_questions ?? 1);
}

export async function getConceptAnswerAggregate(
  userId: string,
  conceptId: string,
  connection?: DbConn,
): Promise<{ correct_answers: number; wrong_answers: number; total_attempts: number; total_practice_seconds: number }> {
  const [rows] = await getDb(connection).query(
    `SELECT
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers,
        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_answers,
        COUNT(*) AS total_attempts,
        COALESCE(SUM(time_spent_seconds), 0) AS total_practice_seconds
     FROM prepkarta_user_answer_history
     WHERE user_id = ? AND concept_id = ?`,
    [userId, conceptId],
  );
  return (rows as Array<{
    correct_answers: number;
    wrong_answers: number;
    total_attempts: number;
    total_practice_seconds: number;
  }>)[0] ?? { correct_answers: 0, wrong_answers: 0, total_attempts: 0, total_practice_seconds: 0 };
}

export async function upsertUserConceptProgress(
  userId: string,
  conceptId: string,
  lastQuestionIndex: number,
  masteryScore: number,
  attemptsCount: number,
  correctAnswers: number,
  wrongAnswers: number,
  totalPracticeSeconds: number,
  connection?: DbConn,
): Promise<void> {
  await getDb(connection).query(
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
      userId,
      conceptId,
      lastQuestionIndex,
      masteryScore,
      attemptsCount,
      correctAnswers,
      wrongAnswers,
      totalPracticeSeconds,
    ],
  );
}

export async function countWeakQuestions(userId: string, conceptId: string, connection?: DbConn): Promise<number> {
  const [rows] = await getDb(connection).query(
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
    [userId, conceptId],
  );
  return Number((rows as Array<{ weak_count: number }>)[0]?.weak_count ?? 0);
}

export async function getUserAnalyticsAggregate(userId: string, connection?: DbConn): Promise<{ solved_count: number; correct_count: number; wrong_count: number; practice_seconds: number }> {
  const [rows] = await getDb(connection).query(
    `SELECT
        COUNT(*) AS solved_count,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count,
        COALESCE(SUM(time_spent_seconds), 0) AS practice_seconds
     FROM prepkarta_user_answer_history
     WHERE user_id = ?`,
    [userId],
  );
  return (rows as Array<{
    solved_count: number;
    correct_count: number;
    wrong_count: number;
    practice_seconds: number;
  }>)[0] ?? { solved_count: 0, correct_count: 0, wrong_count: 0, practice_seconds: 0 };
}

export async function listUserConceptMastery(userId: string, connection?: DbConn): Promise<Array<{ id: string; name: string; mastery_score: number; attempts_count: number }>> {
  const [rows] = await getDb(connection).query(
    `SELECT c.id, c.name, up.mastery_score, up.attempts_count
     FROM prepkarta_user_concept_progress up
     INNER JOIN prepkarta_concepts c ON c.id = up.concept_id
     WHERE up.user_id = ?
     ORDER BY up.mastery_score DESC`,
    [userId],
  );
  return rows as Array<{ id: string; name: string; mastery_score: number; attempts_count: number }>;
}

export async function listUserPracticeByDay(userId: string, connection?: DbConn): Promise<Array<{ day: string; seconds: number }>> {
  const [rows] = await getDb(connection).query(
    `SELECT DATE(attempted_at) AS day, COALESCE(SUM(time_spent_seconds), 0) AS seconds
     FROM prepkarta_user_answer_history
     WHERE user_id = ?
     GROUP BY DATE(attempted_at)
     ORDER BY day DESC`,
    [userId],
  );
  return rows as Array<{ day: string; seconds: number }>;
}
