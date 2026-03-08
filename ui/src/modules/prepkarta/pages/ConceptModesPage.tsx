import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { getPrepKartaConceptResume } from '../../../lib/api';

type Props = {
  token: string;
  conceptId: string;
};

export function ConceptModesPage({ token, conceptId }: Props) {
  const navigate = useNavigate();
  const [resume, setResume] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getPrepKartaConceptResume(token, conceptId);
        setResume(data.resume ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concept state');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [token, conceptId]);

  if (loading) return <Card className="p-6"><p className="text-sm text-slate-500">Loading concept...</p></Card>;
  if (error) return <Card className="p-6"><p className="text-sm text-red-400">{error}</p></Card>;

  const attempted = Number(resume?.attemptedQuestions ?? 0);
  const total = Number(resume?.totalQuestions ?? 0);

  return (
    <Card className="p-6 space-y-4">
      <button type="button" onClick={() => navigate(-1)} className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold">Back</button>
      <p className="text-lg font-semibold text-heading">You attempted {attempted}/{total} questions</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button type="button" onClick={() => navigate(`/admin/prepkarta/practice/${conceptId}?mode=resume`)} className="btn-primary-ui rounded-xl px-4 py-3 text-sm font-semibold">Resume Practice</button>
        <button type="button" onClick={() => navigate(`/admin/prepkarta/practice/${conceptId}?mode=weak`)} className="btn-secondary-ui rounded-xl px-4 py-3 text-sm font-semibold">Practice Weak Questions</button>
        <button type="button" onClick={() => navigate(`/admin/prepkarta/practice/${conceptId}?mode=random`)} className="btn-secondary-ui rounded-xl px-4 py-3 text-sm font-semibold">Random Practice</button>
      </div>
    </Card>
  );
}
