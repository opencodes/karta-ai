import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import {
  generatePrepKartaSubchapterMcqs,
  getPrepKartaSubchapter,
  listPrepKartaSubchapterTurns,
  savePrepKartaSubchapterTurn,
  summarizePrepKartaSubchapter,
} from '../../../lib/api';

type LocationState = {
  name?: string;
  chapterName?: string;
};

type Turn = {
  id?: string;
  question: string;
  answer: string;
  saving?: boolean;
};

type McqOptionKey = 'A' | 'B' | 'C' | 'D';

type ParsedMcq = {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: Record<McqOptionKey, string>;
  correctAnswers: McqOptionKey[];
  explanation: string;
};

type McqPayload = {
  subject: string;
  chapter: string;
  subchapter: string;
  mcqs: ParsedMcq[];
};

function normalizeAnswerKeys(input: unknown): McqOptionKey[] {
  const valid: McqOptionKey[] = ['A', 'B', 'C', 'D'];
  if (Array.isArray(input)) {
    return Array.from(new Set(input.map((item) => String(item).trim().toUpperCase()).filter((item): item is McqOptionKey => valid.includes(item as McqOptionKey))));
  }
  if (typeof input === 'string') {
    return Array.from(new Set(
      input
        .split(/[,\s/|]+/g)
        .map((item) => item.trim().toUpperCase())
        .filter((item): item is McqOptionKey => valid.includes(item as McqOptionKey)),
    ));
  }
  return [];
}

function extractJsonObject(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return null;
}

function parseMcqPayload(input: string): McqPayload | null {
  try {
    const jsonText = extractJsonObject(input);
    if (!jsonText) return null;
    const parsed = JSON.parse(jsonText) as {
      subject?: unknown;
      chapter?: unknown;
      subchapter?: unknown;
      mcqs?: unknown;
    };
    if (!Array.isArray(parsed.mcqs)) return null;
    const normalizedMcqs = parsed.mcqs.map((item, idx) => {
      const obj = item as Record<string, unknown>;
      const options = (obj.options ?? {}) as Record<string, unknown>;
      const answerKeys = normalizeAnswerKeys(obj.correctAnswer);
      const difficultyRaw = String(obj.difficulty ?? 'medium').toLowerCase();
      const difficulty = (['easy', 'medium', 'hard'].includes(difficultyRaw) ? difficultyRaw : 'medium') as 'easy' | 'medium' | 'hard';
      return {
        id: Number(obj.id ?? idx + 1),
        difficulty,
        question: String(obj.question ?? '').trim(),
        options: {
          A: String(options.A ?? '').trim(),
          B: String(options.B ?? '').trim(),
          C: String(options.C ?? '').trim(),
          D: String(options.D ?? '').trim(),
        },
        correctAnswers: answerKeys.length > 0 ? answerKeys : ['A'],
        explanation: String(obj.explanation ?? '').trim(),
      };
    }).filter((mcq) => mcq.question && mcq.options.A && mcq.options.B && mcq.options.C && mcq.options.D);

    if (normalizedMcqs.length === 0) return null;

    return {
      subject: String(parsed.subject ?? '').trim(),
      chapter: String(parsed.chapter ?? '').trim(),
      subchapter: String(parsed.subchapter ?? '').trim(),
      mcqs: normalizedMcqs,
    };
  } catch {
    return null;
  }
}

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
  const [loadingSaved, setLoadingSaved] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [generatingMcq, setGeneratingMcq] = React.useState(false);
  const [selectedOptionsByQuestion, setSelectedOptionsByQuestion] = React.useState<Record<string, McqOptionKey[]>>({});
  const [submittedStateByQuestion, setSubmittedStateByQuestion] = React.useState<Record<string, { submitted: boolean; isCorrect: boolean }>>({});

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

  React.useEffect(() => {
    async function loadSaved() {
      if (!token || !subchapterId) return;
      setLoadingSaved(true);
      setError('');
      try {
        const data = await listPrepKartaSubchapterTurns(token, subchapterId);
        setTurns(data.turns.map((item) => ({ id: item.id, question: item.question, answer: item.answer })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved responses');
      } finally {
        setLoadingSaved(false);
      }
    }

    void loadSaved();
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

  async function onSaveTurn(index: number) {
    if (!token || !subchapterId) return;
    const turn = turns[index];
    if (!turn || turn.id) return;

    setTurns((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, saving: true } : item)));
    try {
      const data = await savePrepKartaSubchapterTurn(token, subchapterId, {
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

  async function onGenerateMcq() {
    if (!token || !subchapterId) return;
    const question = `Generate MCQs for ${details?.name ?? state.name ?? 'this topic'}`;
    setGeneratingMcq(true);
    setError('');
    try {
      const data = await generatePrepKartaSubchapterMcqs(token, subchapterId, { count: 5 });
      setTurns((prev) => [...prev, { question, answer: data.mcqs }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate MCQs');
    } finally {
      setGeneratingMcq(false);
    }
  }

  function updateSelection(questionKey: string, optionKey: McqOptionKey, multiple: boolean) {
    setSelectedOptionsByQuestion((prev) => {
      const current = prev[questionKey] ?? [];
      if (!multiple) {
        return { ...prev, [questionKey]: [optionKey] };
      }
      const exists = current.includes(optionKey);
      return {
        ...prev,
        [questionKey]: exists ? current.filter((item) => item !== optionKey) : [...current, optionKey],
      };
    });
  }

  function submitQuestion(questionKey: string, correctAnswers: McqOptionKey[]) {
    const selected = selectedOptionsByQuestion[questionKey] ?? [];
    const selectedSorted = [...selected].sort();
    const correctSorted = [...correctAnswers].sort();
    const isCorrect = selectedSorted.length === correctSorted.length
      && selectedSorted.every((item, idx) => item === correctSorted[idx]);
    setSubmittedStateByQuestion((prev) => ({ ...prev, [questionKey]: { submitted: true, isCorrect } }));
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
                {(() => {
                  const parsedMcq = parseMcqPayload(turn.answer);
                  if (!parsedMcq) {
                    return (
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
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {parsedMcq.mcqs.map((mcq) => {
                        const questionKey = `${index}-${mcq.id}`;
                        const multiple = mcq.correctAnswers.length > 1 || /select all/i.test(mcq.question);
                        const selected = selectedOptionsByQuestion[questionKey] ?? [];
                        const submittedState = submittedStateByQuestion[questionKey];
                        const isSubmitted = submittedState?.submitted ?? false;
                        const badgeClass = mcq.difficulty === 'hard'
                          ? 'text-red-400 border-red-400/40'
                          : mcq.difficulty === 'medium'
                            ? 'text-amber-400 border-amber-400/40'
                            : 'text-emerald-400 border-emerald-400/40';
                        return (
                          <div key={questionKey} className="rounded-lg border border-main p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-heading">Q{mcq.id}. {mcq.question}</p>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${badgeClass}`}>{mcq.difficulty}</span>
                            </div>
                            <div className="space-y-1.5">
                              {(['A', 'B', 'C', 'D'] as McqOptionKey[]).map((key) => (
                                <label key={key} className="flex items-start gap-2 rounded-md px-2 py-1.5 cursor-pointer">
                                  <input
                                    type={multiple ? 'checkbox' : 'radio'}
                                    name={multiple ? `${questionKey}-${key}` : questionKey}
                                    checked={selected.includes(key)}
                                    onChange={() => updateSelection(questionKey, key, multiple)}
                                    disabled={isSubmitted}
                                    className="mt-0.5"
                                  />
                                  <span className="text-xs text-heading">
                                    <strong>{key})</strong> {mcq.options[key]}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {!isSubmitted ? (
                              <button
                                type="button"
                                className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                                disabled={selected.length === 0}
                                onClick={() => submitQuestion(questionKey, mcq.correctAnswers)}
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <div className="space-y-1">
                                <p className={`text-xs font-semibold ${submittedState?.isCorrect ? 'text-emerald-500' : 'text-red-400'}`}>
                                  {submittedState?.isCorrect ? 'Correct' : 'Incorrect'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Correct: {mcq.correctAnswers.join(', ')} | {mcq.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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
            <button
              type="button"
              onClick={() => void onGenerateMcq()}
              disabled={generatingMcq || !token}
              className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {generatingMcq ? 'Generating MCQs...' : 'Generate MCQ'}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
