import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { listPrepKartaConcepts, type PrepKartaConcept } from '../../../lib/api';

type Props = {
  token: string;
  subjectId: string;
};

export function ConceptListPage({ token, subjectId }: Props) {
  const navigate = useNavigate();
  const [concepts, setConcepts] = React.useState<PrepKartaConcept[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listPrepKartaConcepts(token, subjectId);
        setConcepts(data.concepts ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concepts');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token, subjectId]);

  if (loading) return <Card className="p-6"><p className="text-sm text-slate-500">Loading concepts...</p></Card>;
  if (error) return <Card className="p-6"><p className="text-sm text-red-400">{error}</p></Card>;

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => navigate('/admin/prepkarta')} className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold">Back to Subjects</button>
      {concepts.map((concept) => (
        <button
          key={concept.id}
          type="button"
          onClick={() => navigate(`/admin/prepkarta/concept/${concept.id}`)}
          className="w-full text-left"
        >
          <Card className="p-5 hover:border-teal/40 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-heading">{concept.name}</p>
              <span className={`text-[11px] font-semibold uppercase ${concept.masteryStatus === 'mastered' ? 'text-teal' : concept.masteryStatus === 'weak' ? 'text-red-400' : 'text-slate-500'}`}>
                {concept.masteryStatus.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{concept.attemptedQuestions}/{concept.totalQuestions} attempted</p>
            <div className="mt-3 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-teal" style={{ width: `${concept.progressPercent}%` }} />
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
