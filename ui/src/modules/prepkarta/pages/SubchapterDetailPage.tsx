import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { getPrepKartaSubchapter, summarizePrepKartaSubchapter } from '../../../lib/api';

type LocationState = {
  name?: string;
  chapterName?: string;
};

type Turn = {
  question: string;
  answer: string;
};

export function SubchapterDetailPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { subchapterId } = useParams<{ subchapterId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [details, setDetails] = React.useState<{ name: string; chapterName: string; subjectName: string } | null>(null);
  const [ask, setAsk] = React.useState('');
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [generating, setGenerating] = React.useState(false);

  React.useEffect(() => {
    async function loadDetails() {
      if (!token || !subchapterId) return;
      setLoading(true);
      setError('');
      try {
        const data = await getPrepKartaSubchapter(token, subchapterId);
        setDetails({
          name: data.subchapter.name,
          chapterName: data.subchapter.chapterName,
          subjectName: data.subchapter.subjectName,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subchapter');
      } finally {
        setLoading(false);
      }
    }
    void loadDetails();
  }, [token, subchapterId]);

  async function onGenerateSummary() {
    if (!token || !subchapterId) return;
    const question = ask.trim() || 'Give me a concise subchapter summary for revision.';
    setGenerating(true);
    setError('');
    try {
      const data = await summarizePrepKartaSubchapter(token, subchapterId, {
        ask: question,
        history: turns.map((item) => ({ question: item.question, answer: item.answer })),
      });
      setTurns((prev) => [...prev, { question, answer: data.summary }]);
      setAsk('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Subchapter</p>
          <p className="text-sm font-semibold text-heading">{details?.name ?? state.name ?? 'Subchapter'}</p>
          <p className="text-xs text-slate-500 mt-1">
            {details?.subjectName ?? 'Subject'} • {details?.chapterName ?? state.chapterName ?? 'Chapter'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
        >
          Back
        </button>
      </div>
      {loading ? <p className="text-xs text-slate-500">Loading subchapter...</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      <div className="rounded-xl border border-main p-4 space-y-4">
        {turns.length > 0 ? (
          <div className="space-y-3">
            {turns.map((turn, index) => (
              <div key={`${turn.question}-${index}`} className="rounded-xl border border-main p-4 bg-black/5 dark:bg-white/5 space-y-3">
                <p className="text-xs uppercase tracking-widest text-slate-500">Question {index + 1}</p>
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
                  <ReactMarkdown>{turn.answer}</ReactMarkdown>
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
            placeholder="Example: Explain this subchapter simply with key points and common mistakes."
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void onGenerateSummary()}
              disabled={generating || !token}
              className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {generating ? 'Generating...' : turns.length === 0 ? 'Generate Subchapter Summary' : 'Ask AI'}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
