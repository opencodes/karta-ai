import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import {
  createPrepKartaSubject,
  deletePrepKartaSubject,
  listPrepKartaSubjects,
  updatePrepKartaSubject,
  type PrepKartaSubject,
} from '../../../lib/api';

type Props = {
  token: string;
};

export function SubjectCardsPage({ token }: Props) {
  const navigate = useNavigate();
  const [subjects, setSubjects] = React.useState<PrepKartaSubject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [newSubject, setNewSubject] = React.useState('');
  const [editingSubjectId, setEditingSubjectId] = React.useState('');
  const [editingSubjectName, setEditingSubjectName] = React.useState('');

  async function refreshSubjects() {
    const data = await listPrepKartaSubjects(token);
    setSubjects(data.subjects ?? []);
  }

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        await refreshSubjects();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subjects');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [token]);

  if (loading) return <Card className="p-6"><p className="text-sm text-slate-500">Loading subjects...</p></Card>;

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-3">
        <p className="text-sm font-semibold text-heading">Create Subject</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="form-control-ui h-10 rounded-xl flex-1"
            placeholder="Subject name"
          />
          <button
            type="button"
            onClick={async () => {
              if (!newSubject.trim()) return;
              try {
                await createPrepKartaSubject(token, { name: newSubject.trim() });
                setNewSubject('');
                await refreshSubjects();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create subject');
              }
            }}
            className="btn-primary-ui px-3 py-2 rounded-lg text-xs font-semibold"
          >
            Add
          </button>
        </div>
      </Card>

      {error ? <Card className="p-4"><p className="text-xs text-red-400">{error}</p></Card> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <Card key={subject.id} className="p-5 space-y-3">
            {editingSubjectId === subject.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editingSubjectName}
                  onChange={(e) => setEditingSubjectName(e.target.value)}
                  className="form-control-ui h-10 rounded-xl flex-1"
                />
                <button
                  type="button"
                  className="btn-secondary-ui px-3 py-2 rounded-lg text-xs font-semibold"
                  onClick={async () => {
                    if (!editingSubjectName.trim()) return;
                    await updatePrepKartaSubject(token, subject.id, { name: editingSubjectName.trim() });
                    setEditingSubjectId('');
                    setEditingSubjectName('');
                    await refreshSubjects();
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-heading">{subject.name}</p>
                <p className="text-xs text-slate-500">Progress: {Math.round(subject.progress * 100)}% • Attempts: {subject.attempts}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
                    onClick={() => navigate(`/admin/prepkarta/subject/${subject.id}`)}
                  >
                    Manage Chapters
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
                    onClick={() => {
                      setEditingSubjectId(subject.id);
                      setEditingSubjectName(subject.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-400/40 text-red-400"
                    onClick={async () => {
                      await deletePrepKartaSubject(token, subject.id);
                      await refreshSubjects();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      {subjects.length === 0 ? <Card className="p-6"><p className="text-sm text-slate-500">No subjects yet.</p></Card> : null}
    </div>
  );
}
