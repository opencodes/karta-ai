import { env } from '../../../config.js';
import { HuggingFaceClient } from '../../../services/huggingFaceClient.js';
import { buildSubchapterMcqPrompt, buildSubchapterPrompt } from '../prepkartaPrompt.js';
import { pool } from '../../../db.js';
import {
  calculateMasteryScore,
  computeRepeatAfterAttempts,
  computeRepetitionLevel,
  getMasteryStatus,
} from './repetition.js';
import {
  countQuestionAttempts,
  createChapter,
  createSubchapter,
  createSubchapterQa,
  createSubject,
  deleteChapter,
  deleteSubchapter,
  deleteSubject,
  getConceptById,
  getLatestRepetitionLevel,
  getProgressByUserConcept,
  getSubchapterById,
  getSubchapterContext,
  getSubchapterDetails,
  getSubjectById,
  getSubjectByName,
  listAnalyticsAggregate,
  listAnalyticsConcepts,
  listConceptsBySubject,
  listDailyPractice,
  listOptionsByQuestion,
  listOptionsByQuestionUnordered,
  listProgressByUser,
  listProgressByUserWithSubject,
  listQuestionsByConcept,
  listSubjects,
  listSubchapterQa,
  listSubchaptersByChapter,
  listWeakQuestionStats,
  updateChapter,
  updateSubchapter,
  updateSubject,
} from '../repo/practiceRepo.js';

const hfClient = new HuggingFaceClient();

export async function fetchSubjects(userId: string) {
  const subjects = await listSubjects();
  const progressRows = await listProgressByUserWithSubject(userId);

  const grouped = progressRows
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

  return payload;
}

export async function createNewSubject(name: string) {
  const exists = await getSubjectByName(name);
  if (exists) {
    return { ok: false, reason: 'exists' } as const;
  }
  await createSubject(name);
  return { ok: true } as const;
}

export async function renameSubject(id: string, name: string) {
  const exists = await getSubjectById(id);
  if (!exists) {
    return { ok: false, reason: 'missing' } as const;
  }
  await updateSubject(id, name);
  return { ok: true } as const;
}

export async function removeSubject(id: string) {
  await deleteSubject(id);
}

export async function fetchConceptsBySubject(userId: string, subjectId: string) {
  const concepts = await listConceptsBySubject(subjectId);
  const progressRows = await listProgressByUser(userId);
  const progressByConcept = new Map(progressRows.map((row) => [row.concept_id, row]));

  return concepts.map((concept) => {
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
}

export async function fetchChaptersBySubject(subjectId: string) {
  const rows = await listConceptsBySubject(subjectId);
  return rows.map((row) => ({
    id: row.id,
    subjectId: row.subject_id,
    name: row.name,
    totalQuestions: row.total_questions,
  }));
}

export async function createNewChapter(subjectId: string, name: string) {
  const subject = await getSubjectById(subjectId);
  if (!subject) {
    return { ok: false, reason: 'missing' } as const;
  }
  await createChapter(subjectId, name);
  return { ok: true } as const;
}

export async function renameChapter(id: string, name: string) {
  const chapter = await getConceptById(id);
  if (!chapter) {
    return { ok: false, reason: 'missing' } as const;
  }
  await updateChapter(id, name);
  return { ok: true } as const;
}

export async function removeChapter(id: string) {
  await deleteChapter(id);
}

export async function fetchSubchaptersByChapter(chapterId: string) {
  const rows = await listSubchaptersByChapter(chapterId);
  return rows.map((row) => ({
    id: row.id,
    chapterId: row.chapter_id,
    name: row.name,
  }));
}

export async function createNewSubchapter(chapterId: string, name: string) {
  const chapter = await getConceptById(chapterId);
  if (!chapter) {
    return { ok: false, reason: 'missing' } as const;
  }
  await createSubchapter(chapterId, name);
  return { ok: true } as const;
}

export async function renameSubchapter(id: string, name: string) {
  const existing = await getSubchapterById(id);
  if (!existing) {
    return { ok: false, reason: 'missing' } as const;
  }
  await updateSubchapter(id, name);
  return { ok: true } as const;
}

export async function removeSubchapter(id: string) {
  await deleteSubchapter(id);
}

export async function fetchSubchapterDetails(subchapterId: string) {
  return getSubchapterDetails(subchapterId);
}

export async function summarizeSubchapter(params: {
  subchapterId: string;
  ask?: string;
  history?: Array<{ question: string; answer: string }>;
}) {
  if (!env.HF_TOKEN || !hfClient.isAvailable()) {
    return { ok: false, reason: 'ai_unavailable' } as const;
  }

  const row = await getSubchapterContext(params.subchapterId);
  if (!row) {
    return { ok: false, reason: 'missing' } as const;
  }

  const prompt = buildSubchapterPrompt({
    subject: row.subject_name,
    chapter: row.chapter_name,
    subchapter: row.subchapter_name,
    ask: params.ask,
    history: params.history ?? [],
  });

  const summary = await hfClient.generate(prompt, env.HF_MAX_TOKENS);
  if (!summary) {
    return { ok: false, reason: 'ai_failed' } as const;
  }

  return {
    ok: true,
    summary: summary.trim(),
    context: {
      subject: row.subject_name,
      chapter: row.chapter_name,
      subchapter: row.subchapter_name,
    },
  } as const;
}

export async function generateSubchapterMcqs(params: {
  subchapterId: string;
  count: number;
}) {
  if (!env.HF_TOKEN || !hfClient.isAvailable()) {
    return { ok: false, reason: 'ai_unavailable' } as const;
  }

  const row = await getSubchapterContext(params.subchapterId);
  if (!row) {
    return { ok: false, reason: 'missing' } as const;
  }

  const prompt = buildSubchapterMcqPrompt({
    subject: row.subject_name,
    chapter: row.chapter_name,
    subchapter: row.subchapter_name,
    count: params.count,
  });

  const mcqs = await hfClient.generate(prompt, env.HF_MAX_TOKENS);
  if (!mcqs) {
    return { ok: false, reason: 'ai_failed' } as const;
  }

  return {
    ok: true,
    mcqs: mcqs.trim(),
    context: {
      subject: row.subject_name,
      chapter: row.chapter_name,
      subchapter: row.subchapter_name,
      count: params.count,
    },
  } as const;
}

export async function fetchSubchapterQa(userId: string, subchapterId: string) {
  return listSubchapterQa(userId, subchapterId);
}

export async function saveSubchapterQa(params: {
  userId: string;
  organizationId: string | null;
  subchapterId: string;
  question: string;
  answer: string;
}) {
  const exists = await getSubchapterById(params.subchapterId);
  if (!exists) {
    return { ok: false, reason: 'missing' } as const;
  }

  const saved = await createSubchapterQa(params);
  return { ok: true, saved } as const;
}

export async function fetchConceptQuestion(params: {
  userId: string;
  conceptId: string;
  mode: 'resume' | 'weak' | 'random';
}) {
  const questions = await listQuestionsByConcept(params.conceptId);
  if (questions.length === 0) {
    return { ok: false, reason: 'no_questions' } as const;
  }

  const progress = await getProgressByUserConcept(params.userId, params.conceptId);
  const weakRows = await listWeakQuestionStats(params.userId, params.conceptId);
  const weakSet = new Set(
    weakRows
      .filter((row) => Number(row.wrong_count) > Number(row.correct_count))
      .map((row) => row.question_id),
  );

  let selected = questions[0];
  if (params.mode === 'resume') {
    const index = Math.max(0, Math.min(questions.length - 1, Number(progress?.last_question_index ?? 0)));
    selected = questions[index] ?? questions[0];
  } else if (params.mode === 'weak') {
    const weakQuestion = questions.find((question) => weakSet.has(question.id));
    selected = weakQuestion ?? questions[Math.floor(Math.random() * questions.length)];
  } else {
    selected = questions[Math.floor(Math.random() * questions.length)];
  }

  const options = await listOptionsByQuestion(selected.id);
  const outputOptions = options.map((option) => ({ id: option.id, text: option.text }));

  return {
    ok: true,
    mode: params.mode,
    question: {
      id: selected.id,
      conceptId: selected.concept_id,
      type: selected.type,
      questionText: selected.question_text,
      difficulty: selected.difficulty,
      questionOrder: selected.question_order,
      options: outputOptions,
    },
    progress: {
      attempted: Number(progress?.attempts_count ?? 0),
      total: questions.length,
    },
  } as const;
}

export async function answerQuestion(params: {
  userId: string;
  questionId: string;
  selectedOptionIds: string[];
  timeSpentSeconds: number;
}) {
  const question = await getQuestionById(params.questionId);
  if (!question) {
    return { ok: false, reason: 'missing' } as const;
  }

  const options = await listOptionsByQuestionUnordered(params.questionId);
  const correctOptionIds = options.filter((option) => option.is_correct === 1).map((option) => option.id).sort();
  const selectedOptionIds = Array.from(new Set(params.selectedOptionIds)).sort();
  const isCorrect =
    correctOptionIds.length === selectedOptionIds.length &&
    correctOptionIds.every((optionId, index) => optionId === selectedOptionIds[index]);

  const attemptsForQuestion = (await countQuestionAttempts(params.userId, params.questionId)) + 1;
  const previousLevel = await getLatestRepetitionLevel(params.userId, params.questionId);
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
        params.userId,
        question.concept_id,
        params.questionId,
        JSON.stringify(selectedOptionIds),
        isCorrect ? 1 : 0,
        repetitionLevel,
        repeatAfterAttempts,
        params.timeSpentSeconds,
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
      [params.userId, question.concept_id],
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
        params.userId,
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

  return {
    ok: true,
    attempt: {
      questionId: params.questionId,
      conceptId: question.concept_id,
      isCorrect,
      correctOptionIds,
      explanation: question.explanation,
      repetitionLevel,
      repeatAfterAttempts,
    },
  } as const;
}

export async function fetchConceptProgress(params: { userId: string; conceptId: string }) {
  const concept = await getConceptById(params.conceptId);
  if (!concept) {
    return { ok: false, reason: 'missing' } as const;
  }

  const progress = await getProgressByUserConcept(params.userId, params.conceptId);
  const attempts = Number(progress?.attempts_count ?? 0);
  const correct = Number(progress?.correct_answers ?? 0);
  const wrong = Number(progress?.wrong_answers ?? 0);
  const accuracy = attempts > 0 ? correct / attempts : 0;

  return {
    ok: true,
    progress: {
      conceptId: params.conceptId,
      attemptedQuestions: attempts,
      totalQuestions: concept.total_questions,
      masteryScore: Number(progress?.mastery_score ?? 0),
      masteryStatus: getMasteryStatus(Number(progress?.mastery_score ?? 0), attempts),
      correctAnswers: correct,
      wrongAnswers: wrong,
      accuracy: Number(accuracy.toFixed(4)),
      totalPracticeSeconds: Number(progress?.total_practice_seconds ?? 0),
    },
  } as const;
}

export async function fetchConceptResume(params: { userId: string; conceptId: string }) {
  const concept = await getConceptById(params.conceptId);
  if (!concept) {
    return { ok: false, reason: 'missing' } as const;
  }

  const progress = await getProgressByUserConcept(params.userId, params.conceptId);
  const attempted = Number(progress?.attempts_count ?? 0);

  const weakRows = await listWeakQuestionStats(params.userId, params.conceptId);
  const weakCount = weakRows.filter((row) => Number(row.wrong_count) > Number(row.correct_count)).length;

  return {
    ok: true,
    resume: {
      conceptId: params.conceptId,
      totalQuestions: concept.total_questions,
      attemptedQuestions: attempted,
      remainingQuestions: Math.max(0, concept.total_questions - attempted),
      lastQuestionIndex: Number(progress?.last_question_index ?? 0),
      weakQuestionsCount: weakCount,
      modes: ['resume', 'weak', 'random'],
    },
  } as const;
}

export async function fetchAnalytics(userId: string) {
  const aggregate = await listAnalyticsAggregate(userId);
  const solvedCount = Number(aggregate?.solved_count ?? 0);
  const correctCount = Number(aggregate?.correct_count ?? 0);
  const accuracy = solvedCount > 0 ? correctCount / solvedCount : 0;

  const concepts = await listAnalyticsConcepts(userId);
  const strongest = concepts.slice(0, 5).map((item) => ({
    conceptId: item.id,
    name: item.name,
    masteryScore: Number(item.mastery_score ?? 0),
  }));
  const weakest = [...concepts]
    .sort((a, b) => Number(a.mastery_score ?? 0) - Number(b.mastery_score ?? 0))
    .slice(0, 5)
    .map((item) => ({
      conceptId: item.id,
      name: item.name,
      masteryScore: Number(item.mastery_score ?? 0),
    }));

  const streakData = await listDailyPractice(userId);
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

  return {
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
  };
}
