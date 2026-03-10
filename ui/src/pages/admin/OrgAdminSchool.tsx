import React, { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Building2, BookOpenCheck, Layers } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { getOrgAdminSchoolConfig, saveOrgAdminSchoolConfig, type OrgSchoolConfig } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type ClassEntry = {
  name: string;
  boards: string[];
  subjects: string[];
};

export function OrgAdminSchoolPage() {
  const { token } = useAuth();
  const [boardName, setBoardName] = useState('');
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [className, setClassName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedBoardName, setSelectedBoardName] = useState('');
  const [step, setStep] = useState(1);
  const [applySubjectToAll, setApplySubjectToAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassEntry | null>(null);
  const [editSubjects, setEditSubjects] = useState('');
  const defaultClassOptions = useMemo(
    () => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    [],
  );

  const sortedClasses = useMemo(() => {
    const rank = (name: string) => {
      const normalized = name.trim().toUpperCase();
      if (normalized === 'LKG') return 1;
      if (normalized === 'UKG') return 2;
      const numeric = Number(normalized);
      if (!Number.isNaN(numeric) && Number.isFinite(numeric)) return 100 + numeric;
      return 1000;
    };

    return [...classes].sort((a, b) => {
      const ra = rank(a.name);
      const rb = rank(b.name);
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [classes]);

  useEffect(() => {
    async function loadConfig() {
      if (!token || loaded) return;
      try {
        const data = await getOrgAdminSchoolConfig(token);
        if (data.boards.length > 0) {
          setSelectedBoardName(data.boards[0].name);
        }
        const normalizedClasses = data.classes.map((item) => ({
          name: item.name,
          boards: item.boards ?? [],
          subjects: item.subjects ?? [],
        }));
        setClasses(normalizedClasses);
        setLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load school config');
      }
    }

    void loadConfig();
  }, [token, loaded]);

  const classNames = useMemo(() => classes.map((item) => item.name), [classes]);

  function addBoard() {
    const next = boardName.trim();
    if (!next) return;
    setSelectedBoardName(next);
    setBoardName('');
    setStep(2);
    setClasses([]);
  }

  function addClass() {
    const next = className.trim();
    if (!next) return;
    setClasses((prev) => {
      if (prev.some((item) => item.name === next)) return prev;
      const initialBoards = selectedBoardName ? [selectedBoardName] : [];
      return [...prev, { name: next, boards: initialBoards, subjects: [] }];
    });
    setSelectedClassName((prev) => (prev ? prev : next));
    setClassName('');
  }

  function removeClass(value: string) {
    setClasses((prev) => prev.filter((item) => item.name !== value));
    setSelectedClassName((prev) => (prev === value ? '' : prev));
  }


  function addSubjectToClass() {
    const target = selectedClassName.trim();
    const nextSubject = subjectName.trim();
    if (!nextSubject) return;
    if (applySubjectToAll) {
      setClasses((prev) =>
        prev.map((item) => ({
          ...item,
          subjects: item.subjects.includes(nextSubject) ? item.subjects : [...item.subjects, nextSubject],
        })),
      );
    } else {
      if (!target) return;
      setClasses((prev) =>
        prev.map((item) =>
          item.name === target
            ? {
                ...item,
                subjects: item.subjects.includes(nextSubject) ? item.subjects : [...item.subjects, nextSubject],
              }
            : item,
        ),
      );
    }
    setSubjectName('');
  }

  function removeSubjectFromClass(classValue: string, subjectValue: string) {
    setClasses((prev) =>
      prev.map((item) =>
        item.name === classValue
          ? { ...item, subjects: item.subjects.filter((subject) => subject !== subjectValue) }
          : item,
      ),
    );
  }

  const canNextStep2 = classes.length > 0;
  const canNextStep3 = classes.some((item) => item.subjects.length > 0);

  function goNext() {
    setStep((prev) => Math.min(3, prev + 1));
  }

  function goBack() {
    setStep((prev) => Math.max(1, prev - 1));
  }

  async function onSaveConfig() {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const payload: OrgSchoolConfig = {
        boards: selectedBoardName ? [{ name: selectedBoardName }] : [],
        classes: classes.map((item) => ({
          name: item.name,
          boards: item.boards,
          subjects: item.subjects,
        })),
      };
      await saveOrgAdminSchoolConfig(token, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save school config');
    } finally {
      setBusy(false);
    }
  }

  function onEditClass(target: string) {
    const row = classes.find((item) => item.name === target) ?? null;
    if (!row) return;
    setEditingClass(row);
    setEditSubjects(row.subjects.join(', '));
  }

  function closeEditModal() {
    setEditingClass(null);
    setEditSubjects('');
  }

  function saveEditModal() {
    if (!editingClass) return;
    const nextSubjects = Array.from(
      new Set(
        editSubjects
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    );
    setClasses((prev) =>
      prev.map((item) =>
        item.name === editingClass.name
          ? { ...item, subjects: nextSubjects }
          : item,
      ),
    );
    closeEditModal();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Manage School / College</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">School & College Management</h1>
        <p className="text-sm text-slate-400 mt-1">Centralize school-related activity for EduKarta subscribers.</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className={`px-2 py-1 rounded-full border ${step >= 1 ? 'border-teal/40 bg-teal/10 text-teal' : 'border-white/10 text-slate-500'}`}>1</span>
          <span className={step >= 1 ? 'text-slate-200' : 'text-slate-500'}>Create Board</span>
          <span className={`px-2 py-1 rounded-full border ${step >= 2 ? 'border-teal/40 bg-teal/10 text-teal' : 'border-white/10 text-slate-500'}`}>2</span>
          <span className={step >= 2 ? 'text-slate-200' : 'text-slate-500'}>Add Classes</span>
          <span className={`px-2 py-1 rounded-full border ${step >= 3 ? 'border-teal/40 bg-teal/10 text-teal' : 'border-white/10 text-slate-500'}`}>3</span>
          <span className={step >= 3 ? 'text-slate-200' : 'text-slate-500'}>Add Subjects</span>
        </div>
      </Card>

      {step === 1 ? (
        <Card title="Step 1: Create a Board" className="scroll-mt-24">
          <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
            <Building2 className="w-4 h-4" />
            Add a board to group classes (e.g. CBSE, ICSE, State Board).
          </div>
          <div className="flex items-center gap-2">
            <input
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addBoard();
                }
              }}
              placeholder="Board name"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 flex-1"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Press Enter to save and continue.</p>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card title="Step 2: Add Classes (one by one)" className="scroll-mt-24">
          <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
            <Layers className="w-4 h-4" />
            {selectedBoardName ? `Add classes for Board - ${selectedBoardName}.` : 'Add classes for the board.'}
          </div>
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2">Quick select classes</p>
            <div className="flex flex-wrap gap-2">
              {defaultClassOptions.map((option) => {
                const selected = classes.some((item) => item.name === option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        removeClass(option);
                      } else {
                        setClassName(option);
                        addClass();
                      }
                    }}
                    className={`px-2 py-1 rounded-full border text-[11px] font-semibold transition-colors ${
                      selected
                        ? 'border-teal/40 bg-teal/10 text-teal'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-teal/40 hover:text-teal'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Add class (e.g. 1, 2, 11, 12, UG-1)"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 flex-1"
            />
            <button
              type="button"
              onClick={addClass}
              className="px-3 py-2 rounded-lg text-xs font-semibold btn-primary-ui"
            >
              Add
            </button>
          </div>

          {sortedClasses.length === 0 ? (
            <p className="text-sm text-slate-500">No classes added yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {sortedClasses.map((item) => (
                <div key={item.name} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-100">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => removeClass(item.name)}
                    className="text-[11px] text-slate-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              className="px-3 py-2 rounded-lg text-xs font-semibold btn-secondary-ui"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canNextStep2}
              className="px-3 py-2 rounded-lg text-xs font-semibold btn-primary-ui disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card title="Step 3: Add Subjects Per Class" className="scroll-mt-24">
          <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
            <BookOpenCheck className="w-4 h-4" />
            Assign subjects for each class. You can add multiple subjects per class.
          </div>
          <div className="flex items-center gap-2 mb-3">
            <select
              value={selectedClassName}
              onChange={(e) => setSelectedClassName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200"
              disabled={applySubjectToAll}
            >
              <option value="">Select class</option>
              {classNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Add subject (e.g. Maths, Physics)"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 flex-1"
            />
            <button
              type="button"
              onClick={addSubjectToClass}
              className="px-3 py-2 rounded-lg text-xs font-semibold btn-primary-ui"
            >
              Add
            </button>
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-slate-400 mb-3">
            <input
              type="checkbox"
              checked={applySubjectToAll}
              onChange={(e) => setApplySubjectToAll(e.target.checked)}
            />
            Add subject to all classes
          </label>

          {classes.length === 0 ? (
            <p className="text-sm text-slate-500">Add classes first to assign subjects.</p>
          ) : (
            <div className="space-y-2">
              {classes.map((item) => (
                <div key={item.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-100 font-semibold">Class {item.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Board: {selectedBoardName || 'n/a'}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.subjects.length === 0 ? (
                      <span className="text-[11px] text-slate-500">No subjects assigned.</span>
                    ) : (
                      item.subjects.map((subject) => (
                        <span key={subject} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-200">
                          {subject}
                          <button
                            type="button"
                            onClick={() => removeSubjectFromClass(item.name, subject)}
                            className="text-[11px] text-slate-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              className="px-3 py-2 rounded-lg text-xs font-semibold btn-secondary-ui"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!canNextStep3}
              onClick={() => void onSaveConfig()}
              className="px-3 py-2 rounded-lg text-xs font-semibold btn-primary-ui disabled:opacity-50"
            >
              {busy ? 'Saving...' : 'Finish'}
            </button>
          </div>
        </Card>
      ) : null}

      <Card title="Saved School Setup" className="scroll-mt-24">
        {classes.length === 0 ? (
          <p className="text-sm text-slate-500">No classes configured yet.</p>
        ) : (
          <div className="space-y-4">
            {(selectedBoardName ? [selectedBoardName] : []).map((board) => (
              <div key={board} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-400">Board</p>
                    <p className="text-sm text-slate-100 font-semibold">{board}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-300 border border-white/10 rounded-lg overflow-hidden">
                    <thead className="bg-white/5 text-slate-400">
                      <tr>
                        <th className="text-left px-3 py-2">Class</th>
                        <th className="text-left px-3 py-2">Subjects</th>
                        <th className="text-left px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                  {sortedClasses.map((item, idx) => (
                    <tr key={`${item.name}-${idx}`} className="border-t border-white/10">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">
                        {item.subjects.length > 0 ? item.subjects.join(', ') : '—'}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => onEditClass(item.name)}
                              className="px-2 py-1 rounded text-xs font-semibold btn-secondary-ui"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editingClass ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0b0b0b] p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">Edit Class</p>
                <p className="text-lg font-semibold text-slate-100">Class {editingClass.name}</p>
                <p className="text-[11px] text-slate-500">Board: {selectedBoardName || 'n/a'}</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-slate-400 hover:text-slate-200"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="text-xs text-slate-400">Subjects (comma separated)</label>
              <textarea
                value={editSubjects}
                onChange={(e) => setEditSubjects(e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200"
                placeholder="Maths, Science, English"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-3 py-2 rounded-lg text-xs font-semibold btn-secondary-ui"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditModal}
                className="px-3 py-2 rounded-lg text-xs font-semibold btn-primary-ui"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
