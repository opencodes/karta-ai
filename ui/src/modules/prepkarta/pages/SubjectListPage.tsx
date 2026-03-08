import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { listPrepKartaSubjects, type PrepKartaSubject } from '../../../lib/api';

type Props = {
  token: string;
};

export function SubjectListPage({ token }: Props) {
  const navigate = useNavigate();
  const [subjects, setSubjects] = React.useState<PrepKartaSubject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listPrepKartaSubjects(token);
        setSubjects(data.subjects ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subjects');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  if (loading) return <Card className="p-6"><p className="text-sm text-slate-500">Loading subjects...</p></Card>;
  if (error) return <Card className="p-6"><p className="text-sm text-red-400">{error}</p></Card>;

  return (
    <div className="space-y-4">
      {subjects.map((subject) => (
        <button
          key={subject.id}
          type="button"
          onClick={() => navigate(`/admin/prepkarta/${subject.id}`)}
          className="w-full text-left"
        >
          <Card className="p-5 hover:border-teal/40 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-heading">{subject.name}</p>
              <p className="text-xs text-slate-500">Attempts: {subject.attempts}</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-teal" style={{ width: `${Math.max(0, Math.min(100, Math.round(subject.progress * 100)))}%` }} />
            </div>
          </Card>
        </button>
      ))}
      {subjects.length === 0 ? <Card className="p-6"><p className="text-sm text-slate-500">No subjects found.</p></Card> : null}
    </div>
  );
}
