import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';

type ReviewState = {
  question: {
    id: string;
    conceptId: string;
    questionText: string;
    options: Array<{ id: string; text: string }>;
  };
  selectedOptionIds: string[];
  attempt: {
    questionId: string;
    conceptId: string;
    isCorrect: boolean;
    correctOptionIds: string[];
    explanation: string;
  };
};

export function ReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') ?? 'resume';
  const conceptId = searchParams.get('conceptId') ?? '';
  const state = location.state as ReviewState | null;

  if (!state) {
    return <Card className="p-6"><p className="text-sm text-slate-500">No review data found. Start practice again.</p></Card>;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${state.attempt.isCorrect ? 'text-teal' : 'text-red-400'}`}>
          {state.attempt.isCorrect ? 'Correct' : 'Incorrect'}
        </p>
        <button
          type="button"
          onClick={() => navigate(`/admin/prepkarta/practice/${conceptId}?mode=${mode}`)}
          className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
        >
          Next Question
        </button>
      </div>
      <p className="text-sm font-semibold text-heading">{state.question.questionText}</p>
      <div className="space-y-2">
        {state.question.options.map((option) => {
          const selected = state.selectedOptionIds.includes(option.id);
          const correct = state.attempt.correctOptionIds.includes(option.id);
          const cls = correct
            ? 'border-teal/60 bg-teal/10 text-heading'
            : selected
              ? 'border-red-400/60 bg-red-500/10 text-red-300'
              : 'border-main text-slate-400';

          return (
            <div key={option.id} className={`rounded-xl border px-4 py-3 text-sm ${cls}`}>
              {option.text}
            </div>
          );
        })}
      </div>
      <div className="rounded-xl border border-main p-4 bg-black/5 dark:bg-white/5">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Concept Explanation</p>
        <p className="text-sm text-heading">{state.attempt.explanation}</p>
      </div>
    </Card>
  );
}
