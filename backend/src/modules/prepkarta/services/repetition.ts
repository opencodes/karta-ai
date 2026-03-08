export type MasteryStatus = 'mastered' | 'in_progress' | 'weak';

export function calculateMasteryScore(correctAnswers: number, wrongAnswers: number, totalAttempts: number): number {
  if (totalAttempts <= 0) return 0;
  const value = (correctAnswers - wrongAnswers * 0.5) / totalAttempts;
  return Number(value.toFixed(4));
}

export function getMasteryStatus(score: number, attempts: number): MasteryStatus {
  if (attempts < 5) return 'in_progress';
  if (score >= 0.7) return 'mastered';
  if (score <= 0.35) return 'weak';
  return 'in_progress';
}

export function computeRepetitionLevel(previousLevel: number, isCorrect: boolean): number {
  if (isCorrect) return Math.max(0, previousLevel - 1);
  return Math.min(10, previousLevel + 1);
}

export function computeRepeatAfterAttempts(totalAttemptsForQuestion: number, isCorrect: boolean): number {
  if (isCorrect) return 0;
  if (totalAttemptsForQuestion % 5 === 0) return 5;
  if (totalAttemptsForQuestion > 5) return 1;
  return 3;
}

