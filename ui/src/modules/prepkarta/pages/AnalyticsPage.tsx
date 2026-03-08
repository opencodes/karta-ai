import React from 'react';
import { Card } from '../../../components/ui/Card';
import { getPrepKartaAnalytics } from '../../../lib/api';

type Props = {
  token: string;
};

export function AnalyticsPage({ token }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [analytics, setAnalytics] = React.useState<Record<string, unknown> | null>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getPrepKartaAnalytics(token);
        setAnalytics(data.analytics ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [token]);

  if (loading) return <Card className="p-6"><p className="text-sm text-slate-500">Loading analytics...</p></Card>;
  if (error) return <Card className="p-6"><p className="text-sm text-red-400">{error}</p></Card>;

  const strongest = (analytics?.strongestConcepts as Array<{ name: string; masteryScore: number }> | undefined) ?? [];
  const weakest = (analytics?.weakestConcepts as Array<{ name: string; masteryScore: number }> | undefined) ?? [];

  return (
    <div className="space-y-4">
      <Card className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Accuracy" value={`${Math.round(Number(analytics?.accuracyRate ?? 0) * 100)}%`} />
        <Metric label="Solved" value={String(analytics?.questionsSolved ?? 0)} />
        <Metric label="Readiness" value={`${analytics?.interviewReadinessScore ?? 0}`} />
        <Metric label="Streak" value={`${analytics?.dailyPracticeStreak ?? 0}d`} />
      </Card>
      <Card className="p-6">
        <p className="text-sm font-semibold text-heading mb-2">Strongest Concepts</p>
        <div className="flex flex-wrap gap-2">
          {strongest.map((item) => (
            <span key={item.name} className="rounded-full px-3 py-1 text-xs border border-teal/40 text-teal bg-teal/10">
              {item.name}
            </span>
          ))}
          {strongest.length === 0 ? <span className="text-xs text-slate-500">No data yet.</span> : null}
        </div>
      </Card>
      <Card className="p-6">
        <p className="text-sm font-semibold text-heading mb-2">Weakest Concepts</p>
        <div className="flex flex-wrap gap-2">
          {weakest.map((item) => (
            <span key={item.name} className="rounded-full px-3 py-1 text-xs border border-red-400/40 text-red-300 bg-red-500/10">
              {item.name}
            </span>
          ))}
          {weakest.length === 0 ? <span className="text-xs text-slate-500">No data yet.</span> : null}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-main p-3">
      <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-semibold text-heading mt-1">{value}</p>
    </div>
  );
}
