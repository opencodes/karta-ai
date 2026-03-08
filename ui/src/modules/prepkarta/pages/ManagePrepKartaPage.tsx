import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import {
  createPrepKartaChapter,
  createPrepKartaSubchapter,
  deletePrepKartaChapter,
  deletePrepKartaSubchapter,
  listPrepKartaChapters,
  listPrepKartaSubchapters,
  listPrepKartaSubjects,
  updatePrepKartaChapter,
  updatePrepKartaSubchapter,
  type PrepKartaSubject,
} from '../../../lib/api';

type Props = {
  token: string;
  subjectId: string;
};

type ChapterItem = {
  id: string;
  subjectId: string;
  name: string;
  totalQuestions: number;
};

type SubchapterItem = {
  id: string;
  chapterId: string;
  name: string;
};

export function ManagePrepKartaPage({ token, subjectId }: Props) {
  const navigate = useNavigate();
  const [subject, setSubject] = React.useState<PrepKartaSubject | null>(null);
  const [chapters, setChapters] = React.useState<ChapterItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [newChapter, setNewChapter] = React.useState('');
  const [editingChapterId, setEditingChapterId] = React.useState('');
  const [editingChapterName, setEditingChapterName] = React.useState('');
  const [activeChapterId, setActiveChapterId] = React.useState('');
  const [subchapters, setSubchapters] = React.useState<SubchapterItem[]>([]);
  const [newSubchapter, setNewSubchapter] = React.useState('');
  const [editingSubchapterId, setEditingSubchapterId] = React.useState('');
  const [editingSubchapterName, setEditingSubchapterName] = React.useState('');

  async function refresh() {
    const [subjectData, chapterData] = await Promise.all([
      listPrepKartaSubjects(token),
      listPrepKartaChapters(token, subjectId),
    ]);
    setSubject((subjectData.subjects ?? []).find((item) => item.id === subjectId) ?? null);
    setChapters(chapterData.chapters ?? []);
  }

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subject chapters');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [token, subjectId]);

  React.useEffect(() => {
    async function loadSubchapters() {
      if (!activeChapterId) {
        setSubchapters([]);
        return;
      }
      try {
        const data = await listPrepKartaSubchapters(token, activeChapterId);
        setSubchapters(data.subchapters ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subchapters');
      }
    }
    void loadSubchapters();
  }, [token, activeChapterId]);

  if (loading) return <Card className="p-6"><p className="text-sm text-slate-500">Loading chapters...</p></Card>;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Subject</p>
          <p className="text-sm font-semibold text-heading">{subject?.name ?? 'Unknown Subject'}</p>
        </div>
        <button type="button" onClick={() => navigate('/admin/prepkarta')} className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold">
          Back to Subjects
        </button>
      </div>

      <div className="space-y-2">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="rounded-xl border border-main p-3">
            {editingChapterId === chapter.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editingChapterName}
                  onChange={(e) => setEditingChapterName(e.target.value)}
                  className="form-control-ui h-9 rounded-lg flex-1"
                />
                <button
                  type="button"
                  className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
                  onClick={async () => {
                    if (!editingChapterName.trim()) return;
                    await updatePrepKartaChapter(token, chapter.id, { name: editingChapterName.trim() });
                    setEditingChapterId('');
                    setEditingChapterName('');
                    await refresh();
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-heading">{chapter.name}</p>
                  <p className="text-xs text-slate-500">Questions: {chapter.totalQuestions}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
                    onClick={() => {
                      setEditingChapterId(chapter.id);
                      setEditingChapterName(chapter.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-400/40 text-red-400"
                    onClick={async () => {
                      await deletePrepKartaChapter(token, chapter.id);
                      await refresh();
                    }}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
                    onClick={() => navigate(`/admin/prepkarta/concept/${chapter.id}`)}
                  >
                    Select Chapter
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold ${activeChapterId === chapter.id ? 'ring-1 ring-teal/40' : ''}`}
                    onClick={() => setActiveChapterId(chapter.id)}
                  >
                    Manage Subchapters
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {chapters.length === 0 ? <p className="text-xs text-slate-500">No chapters yet.</p> : null}
      {activeChapterId ? (
        <div className="rounded-xl border border-main p-4 space-y-3">
          <p className="text-sm font-semibold text-heading">Subchapters</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSubchapter}
              onChange={(e) => setNewSubchapter(e.target.value)}
              className="form-control-ui h-10 rounded-xl flex-1"
              placeholder="Add subchapter"
            />
            <button
              type="button"
              className="btn-primary-ui px-3 py-2 rounded-lg text-xs font-semibold"
              onClick={async () => {
                if (!newSubchapter.trim()) return;
                await createPrepKartaSubchapter(token, activeChapterId, { name: newSubchapter.trim() });
                setNewSubchapter('');
                const data = await listPrepKartaSubchapters(token, activeChapterId);
                setSubchapters(data.subchapters ?? []);
              }}
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            {subchapters.map((subchapter) => (
              <div key={subchapter.id} className="rounded-lg border border-main p-3">
                {editingSubchapterId === subchapter.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editingSubchapterName}
                      onChange={(e) => setEditingSubchapterName(e.target.value)}
                      className="form-control-ui h-9 rounded-lg flex-1"
                    />
                    <button
                      type="button"
                      className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
                      onClick={async () => {
                        if (!editingSubchapterName.trim()) return;
                        await updatePrepKartaSubchapter(token, subchapter.id, { name: editingSubchapterName.trim() });
                        setEditingSubchapterId('');
                        const data = await listPrepKartaSubchapters(token, activeChapterId);
                        setSubchapters(data.subchapters ?? []);
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-heading">{subchapter.name}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
                        onClick={() => {
                          setEditingSubchapterId(subchapter.id);
                          setEditingSubchapterName(subchapter.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-400/40 text-red-400"
                        onClick={async () => {
                          await deletePrepKartaSubchapter(token, subchapter.id);
                          const data = await listPrepKartaSubchapters(token, activeChapterId);
                          setSubchapters(data.subchapters ?? []);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {subchapters.length === 0 ? <p className="text-xs text-slate-500">No subchapters yet.</p> : null}
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value)}
          className="form-control-ui h-10 rounded-xl flex-1"
          placeholder="Add chapter"
        />
        <button
          type="button"
          onClick={async () => {
            if (!newChapter.trim()) return;
            try {
              await createPrepKartaChapter(token, subjectId, { name: newChapter.trim() });
              setNewChapter('');
              await refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to create chapter');
            }
          }}
          className="btn-primary-ui px-3 py-2 rounded-lg text-xs font-semibold"
        >
          Add
        </button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </Card>
  );
}
