import { pool } from '../../../db.js';

export type EduKartaStudentProfileRow = {
  user_id: string;
  name: string;
  board: string;
  class_level: string;
  subjects: unknown;
  completed_at: Date | string;
  updated_at: Date | string;
};

export type EduKartaSubjectChapterRow = {
  subject: string;
  chapter_name: string;
};

export type EduKartaChapterQaRow = {
  id: string;
  question: string;
  answer: string;
  created_at: Date | string;
};

export type EduKartaProgressProfileRow = {
  progress_data: unknown;
  updated_at: Date | string;
};

export async function getStudentProfile(userId: string): Promise<EduKartaStudentProfileRow | null> {
  const [rows] = await pool.query(
    `SELECT user_id, name, board, class_level, subjects, completed_at, updated_at
     FROM edukarta_student_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );

  return (rows as EduKartaStudentProfileRow[])[0] ?? null;
}

export async function upsertStudentProfile(params: {
  userId: string;
  organizationId: string | null;
  name: string;
  board: string;
  classLevel: string;
  subjectsJson: string;
}): Promise<void> {
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
    [params.userId, params.organizationId, params.name, params.board, params.classLevel, params.subjectsJson],
  );
}

export async function listSubjectChapters(userId: string): Promise<EduKartaSubjectChapterRow[]> {
  const [rows] = await pool.query(
    `SELECT subject, chapter_name
     FROM edukarta_subject_chapters
     WHERE user_id = ?
     ORDER BY subject ASC, created_at ASC`,
    [userId],
  );

  return rows as EduKartaSubjectChapterRow[];
}

export async function replaceSubjectChapters(params: {
  userId: string;
  organizationId: string | null;
  subject: string;
  chapters: string[];
}): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM edukarta_subject_chapters
       WHERE user_id = ? AND subject = ?`,
      [params.userId, params.subject],
    );

    if (params.chapters.length > 0) {
      const placeholders = params.chapters.map(() => '(UUID(), ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)').join(', ');
      const values = params.chapters.flatMap((chapter) => [params.userId, params.organizationId, params.subject, chapter]);
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
}

export async function listChapterQa(params: {
  userId: string;
  subject: string;
  chapter: string;
}): Promise<EduKartaChapterQaRow[]> {
  const [rows] = await pool.query(
    `SELECT id, question, answer, created_at
     FROM edukarta_chapter_qa
     WHERE user_id = ? AND subject = ? AND chapter = ?
     ORDER BY created_at ASC`,
    [params.userId, params.subject, params.chapter],
  );

  return rows as EduKartaChapterQaRow[];
}

export async function createChapterQa(params: {
  userId: string;
  organizationId: string | null;
  subject: string;
  chapter: string;
  question: string;
  answer: string;
}): Promise<EduKartaChapterQaRow | null> {
  await pool.query(
    `INSERT INTO edukarta_chapter_qa
     (id, user_id, organization_id, subject, chapter, question, answer, created_at)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [params.userId, params.organizationId, params.subject, params.chapter, params.question, params.answer],
  );

  const [rows] = await pool.query(
    `SELECT id, question, answer, created_at
     FROM edukarta_chapter_qa
     WHERE user_id = ? AND subject = ? AND chapter = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [params.userId, params.subject, params.chapter],
  );

  return (rows as EduKartaChapterQaRow[])[0] ?? null;
}

export async function getProgressProfile(userId: string): Promise<EduKartaProgressProfileRow | null> {
  const [rows] = await pool.query(
    `SELECT progress_data, updated_at
     FROM edukarta_progress_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );

  return (rows as EduKartaProgressProfileRow[])[0] ?? null;
}

export async function upsertProgressProfile(params: {
  userId: string;
  organizationId: string | null;
  progressDataJson: string;
}): Promise<void> {
  await pool.query(
    `INSERT INTO edukarta_progress_profiles (
       user_id, organization_id, progress_data, created_at, updated_at
     )
     VALUES (?, ?, CAST(? AS JSON), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE
       organization_id = VALUES(organization_id),
       progress_data = VALUES(progress_data),
       updated_at = CURRENT_TIMESTAMP`,
    [params.userId, params.organizationId, params.progressDataJson],
  );
}

export async function getUserProfileBasics(userId: string): Promise<{ board: string; class_level: string } | null> {
  const [rows] = await pool.query(
    `SELECT board, class_level
     FROM edukarta_student_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );

  return (rows as Array<{ board: string; class_level: string }>)[0] ?? null;
}
