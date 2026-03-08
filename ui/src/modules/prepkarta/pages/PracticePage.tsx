import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { getPrepKartaQuestion, submitPrepKartaAnswer, type PrepKartaQuestion } from '../../../lib/api';

type Props = {
  token: string;
  conceptId: string;
};

export function PracticePage({ token, conceptId }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'resume' | 'weak' | 'random') ?? 'resume';
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [question, setQuestion] = React.useState<PrepKartaQuestion | null>(null);
  const [attempted, setAttempted] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const startedAt = React.useRef(Date.now());

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getPrepKartaQuestion(token, conceptId, mode);
        setQuestion(data.question);
        setAttempted(Number(data.progress?.attempted ?? 0));
        setTotal(Number(data.progress?.total ?? 0));
        setSelectedOptionIds([]);
        startedAt.current = Date.now();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load question');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token, conceptId, mode]);

  function toggleOption(optionId: string) {
    if (!question) return;
    if (question.type === 'single_choice') {
      setSelectedOptionIds([optionId]);
      return;
    }
    setSelectedOptionIds((prev) => (
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    ));
  }

  async function onSubmit() {
    if (!question || selectedOptionIds.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const timeSpentSeconds = Math.max(0, Math.round((Date.now() - startedAt.current) / 1000));
      const data = await submitPrepKartaAnswer(token, question.id, { selectedOptionIds, timeSpentSeconds });
      navigate(`/admin/prepkarta/review/${question.id}?mode=${mode}&conceptId=${conceptId}`, {
        state: {
          question,
          selectedOptionIds,
          attempt: data.attempt,
          progress: { attempted, total },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Card className="p-6"><p className="text-sm text-slate-500">Loading question...</p></Card>;
  if (error) return <Card className="p-6"><p className="text-sm text-red-400">{error}</p></Card>;
  if (!question) return <Card className="p-6"><p className="text-sm text-slate-500">No question available.</p></Card>;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">{attempted}/{total} attempted</p>
        <span className={`text-[11px] uppercase font-semibold ${question.difficulty === 'hard' ? 'text-red-400' : question.difficulty === 'medium' ? 'text-yellow-500' : 'text-teal'}`}>
          {question.difficulty}
        </span>
      </div>
      <p className="text-sm font-semibold text-heading">{question.questionText}</p>
      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => toggleOption(option.id)}
            className={`w-full text-left rounded-xl border px-4 py-3 text-sm ${selectedOptionIds.includes(option.id) ? 'border-teal/60 bg-teal/10 text-heading' : 'border-main text-slate-400 hover:text-heading'}`}
          >
            {option.text}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void onSubmit()}
        disabled={selectedOptionIds.length === 0 || submitting}
        className="btn-primary-ui rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </Card>
  );
}
