import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { listEduKartaChapterTurns, saveEduKartaChapterTurn, summarizeEduKartaChapter } from '../../../lib/api';

type Turn = {
  id?: string;
  question: string;
  answer: string;
  saving?: boolean;
};

function normalizeSummaryMarkdown(input: string): string {
  return input
    .replace(/^Chapter Summary:\s*$/gim, '### Chapter Summary')
    .replace(/^Key Terms:\s*$/gim, '### Key Terms')
    .replace(/^Important Formulas\/Facts:\s*$/gim, '### Important Formulas/Facts')
    .replace(/^Common Mistakes to Avoid:\s*$/gim, '### Common Mistakes to Avoid')
    .replace(/^Quick Revision Checklist:\s*$/gim, '### Quick Revision Checklist')
    .replace(/^Practice Questions:\s*$/gim, '### Practice Questions')
    .replace(/\s+\*\*Answer:\*\*/g, '\n\n**Answer:**')
    .replace(/\s+\*\*Explanation:\*\*/g, '\n**Explanation:**')
    .replace(/(\d+\.\s[^\n]+)\s+-\s+A\)/g, '$1\n- A)')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function ChapterPage() {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const subject = searchParams.get('subject') ?? '';
  const chapter = searchParams.get('chapter') ?? '';
  const [ask, setAsk] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loadingSaved, setLoadingSaved] = React.useState(false);
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function loadSaved() {
      if (!token || !subject || !chapter) return;
      setLoadingSaved(true);
      setError('');
      try {
        const data = await listEduKartaChapterTurns(token, subject, chapter);
        setTurns(data.turns.map((item) => ({ id: item.id, question: item.question, answer: item.answer })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved responses');
      } finally {
        setLoadingSaved(false);
      }
    }

    void loadSaved();
  }, [token, subject, chapter]);

  async function onGenerateSummary() {
    if (!token || !subject || !chapter) return;
    const question = ask.trim() || 'Give me a complete chapter summary for revision.';
    setLoading(true);
    setError('');
    try {
      const data = await summarizeEduKartaChapter(token, {
        subject,
        chapter,
        ask: question,
        history: turns.map((item) => ({ question: item.question, answer: item.answer })),
      });
      setTurns((prev) => [...prev, { question, answer: data.summary }]);
      setAsk('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  }

  async function onSaveTurn(index: number) {
    if (!token || !subject || !chapter) return;
    const turn = turns[index];
    if (!turn || turn.id) return;

    setTurns((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, saving: true } : item)));
    try {
      const data = await saveEduKartaChapterTurn(token, {
        subject,
        chapter,
        question: turn.question,
        answer: turn.answer,
      });
      setTurns((prev) => prev.map((item, itemIndex) => (
        itemIndex === index
          ? { ...item, id: data.turn.id, question: data.turn.question, answer: data.turn.answer, saving: false }
          : item
      )));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save response');
      setTurns((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, saving: false } : item)));
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-heading truncate">
            {subject && chapter ? `${subject} • ${chapter}` : 'Chapter'}
          </p>
        </div>
        <Link to="/admin/edukarta" className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold">
          Back to Chapters
        </Link>
      </div>

      {subject && chapter ? (
        <div className="rounded-xl border border-main p-4 space-y-4">
          {loadingSaved ? <p className="text-xs text-slate-500">Loading saved responses...</p> : null}
          {turns.length > 0 ? (
            <div className="space-y-3">
              {turns.map((turn, index) => (
                <div key={`${turn.question}-${index}`} className="rounded-xl border border-main p-4 bg-black/5 dark:bg-white/5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Question {index + 1}</p>
                    {turn.id ? (
                      <span className="text-[11px] text-teal">Saved</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void onSaveTurn(index)}
                        disabled={turn.saving}
                        className="btn-secondary-ui px-2 py-1 rounded-md text-[11px] font-semibold disabled:opacity-50"
                      >
                        {turn.saving ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-teal">{turn.question}</h3>
                  <div className="text-sm text-heading leading-7 max-w-none space-y-2
                    [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2
                    [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2
                    [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-teal
                    [&_p]:text-sm [&_p]:text-heading [&_p]:my-2
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                    [&_li]:text-sm [&_li]:leading-7
                    [&_strong]:font-semibold [&_strong]:text-heading">
                    <ReactMarkdown>{normalizeSummaryMarkdown(turn.answer)}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-2 pt-2 border-t border-main">
            <p className="text-xs uppercase tracking-widest text-slate-500 pt-3">Ask follow-up question</p>
            <textarea
              value={ask}
              onChange={(event) => setAsk(event.target.value)}
              className="form-control-ui w-full min-h-[90px] rounded-xl p-3 text-sm"
              placeholder="Example: Explain this chapter for board exam in simple language with key points and common mistakes."
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void onGenerateSummary()}
                disabled={loading || !token}
                className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {loading ? 'Generating...' : turns.length === 0 ? 'Generate Chapter Summary' : 'Ask AI'}
              </button>
              {error ? <p className="text-xs text-red-400">{error}</p> : null}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">No chapter selected.</p>
      )}
    </Card>
  );
}
