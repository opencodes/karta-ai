import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../../components/ui/Card';
import {
  getEduKartaProgressProfile,
  listEduKartaSubjectChapters,
  saveEduKartaProgressProfile,
  type EduKartaProgressPayload,
} from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

type ProgressSubject = {
  id: string;
  name: string;
  bookTypes: string[];
  yearlyBookTypes: string[];
  noWorkBookTypes: string[];
};

type ChapterProgressRow = {
  done: boolean;
  bookType: string;
  noWork: boolean;
  startDate: string;
  submissionDate: string;
  returnedDate: string;
};

type ProgressState = Record<string, Record<string, Record<string, Record<string, ChapterProgressRow>>>>;

const BOOK_TYPE_OPTIONS = [
  'Classwork Notebook',
  'Homework Notebook',
  'Textbook',
  'Workbook',
  'Lab Record',
  'Revision Notebook',
  'Assignment Register',
];

export function MyProgressPage() {
  const { token } = useAuth();

  const [subjectName, setSubjectName] = useState('');
  const [selectedBookTypes, setSelectedBookTypes] = useState<string[]>([]);
  const [bookTypeOptionInput, setBookTypeOptionInput] = useState('');
  const [termName, setTermName] = useState('');
  const [bookTypeOptions, setBookTypeOptions] = useState<string[]>(BOOK_TYPE_OPTIONS);

  const [subjects, setSubjects] = useState<ProgressSubject[]>([]);
  const [terms, setTerms] = useState<string[]>(['Term - 1', 'Term - 2']);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term - 1');
  const [selectedBookTypeBySubject, setSelectedBookTypeBySubject] = useState<Record<string, string>>({});
  const [progressState, setProgressState] = useState<ProgressState>({});

  const [chaptersBySubjectName, setChaptersBySubjectName] = useState<Record<string, string[]>>({});
  const [chaptersError, setChaptersError] = useState('');
  const [progressError, setProgressError] = useState('');
  const [progressSaveState, setProgressSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    async function loadChapters() {
      if (!token) return;
      try {
        const data = await listEduKartaSubjectChapters(token);
        setChaptersBySubjectName(data.chaptersBySubject ?? {});
        setChaptersError('');
      } catch (err) {
        setChaptersError(err instanceof Error ? err.message : 'Failed to load chapters');
      }
    }
    void loadChapters();
  }, [token]);

  useEffect(() => {
    async function loadSavedProgress() {
      if (!token) return;
      try {
        const data = await getEduKartaProgressProfile(token);
        const saved = data.progress;
        if (saved) {
          setSubjects(saved.subjects ?? []);
          setTerms(saved.terms && saved.terms.length > 0 ? saved.terms : ['Term - 1', 'Term - 2']);
          setSelectedSubjectId(saved.selectedSubjectId ?? '');
          setSelectedTerm(saved.selectedTerm ?? 'Term - 1');
          setSelectedBookTypeBySubject(saved.selectedBookTypeBySubject ?? {});
          setProgressState(saved.progressState ?? {});
        }
      } catch (err) {
        setProgressError(err instanceof Error ? err.message : 'Failed to load saved progress');
      } finally {
        setProgressLoaded(true);
      }
    }
    void loadSavedProgress();
  }, [token]);

  useEffect(() => {
    if (!token || !progressLoaded) return;

    const payload: EduKartaProgressPayload = {
      subjects,
      terms,
      selectedSubjectId,
      selectedTerm,
      selectedBookTypeBySubject,
      progressState,
    };

    const timer = window.setTimeout(async () => {
      try {
        setProgressSaveState('saving');
        await saveEduKartaProgressProfile(token, payload);
        setProgressSaveState('saved');
      } catch {
        setProgressSaveState('error');
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [token, progressLoaded, subjects, terms, selectedSubjectId, selectedTerm, selectedBookTypeBySubject, progressState]);

  useEffect(() => {
    if (subjects.length === 0) {
      setSelectedSubjectId('');
      return;
    }
    if (!subjects.some((subject) => subject.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (!terms.includes(selectedTerm)) {
      setSelectedTerm(terms[0] ?? '');
    }
  }, [terms, selectedTerm]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId],
  );

  const chapters = useMemo(() => {
    if (!selectedSubject) return [];
    return chaptersBySubjectName[selectedSubject.name] ?? [];
  }, [selectedSubject, chaptersBySubjectName]);

  const myStudySubjects = useMemo(
    () => Object.keys(chaptersBySubjectName).sort((a, b) => a.localeCompare(b)),
    [chaptersBySubjectName],
  );

  const selectedBookType = useMemo(() => {
    if (!selectedSubject) return '';
    const preferred = selectedBookTypeBySubject[selectedSubject.id];
    if (preferred && selectedSubject.bookTypes.includes(preferred)) return preferred;
    return selectedSubject.bookTypes[0] ?? '';
  }, [selectedBookTypeBySubject, selectedSubject]);

  const isYearlyBookType = useMemo(() => {
    if (!selectedSubject || !selectedBookType) return false;
    return selectedSubject.yearlyBookTypes.includes(selectedBookType);
  }, [selectedSubject, selectedBookType]);

  const isNoWorkBookType = useMemo(() => {
    if (!selectedSubject || !selectedBookType) return false;
    return selectedSubject.noWorkBookTypes.includes(selectedBookType);
  }, [selectedSubject, selectedBookType]);

  const progressRows = useMemo(() => {
    if (!selectedBookType) return [];
    if (isNoWorkBookType) return [`${selectedBookType} (No Work)`];
    if (isYearlyBookType) return [`${selectedBookType} (Yearly Record)`];
    return chapters;
  }, [chapters, isNoWorkBookType, isYearlyBookType, selectedBookType]);

  function toggleBookType(type: string) {
    setSelectedBookTypes((prev) => (prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]));
  }

  function addBookTypeOption() {
    const value = bookTypeOptionInput.trim();
    if (!value) return;
    if (bookTypeOptions.includes(value)) {
      setProgressError('Book type option already exists.');
      return;
    }
    setBookTypeOptions((prev) => [...prev, value]);
    setSelectedBookTypes((prev) => [...prev, value]);
    setBookTypeOptionInput('');
    setProgressError('');
  }

  function addSubject() {
    const name = subjectName.trim();
    if (!name || selectedBookTypes.length === 0) {
      setProgressError('Subject name and at least one book type are required.');
      return;
    }
    if (subjects.some((subject) => subject.name === name)) {
      setProgressError('Subject is already added.');
      return;
    }
    if (!Object.keys(chaptersBySubjectName).includes(name)) {
      setProgressError('Subject must match an existing subject in My Study to link chapters.');
      return;
    }
    const id = crypto.randomUUID();
    setSubjects((prev) => [...prev, { id, name, bookTypes: selectedBookTypes, yearlyBookTypes: [], noWorkBookTypes: [] }]);
    setSelectedSubjectId(id);
    setSelectedBookTypeBySubject((prev) => ({ ...prev, [id]: selectedBookTypes[0] ?? '' }));
    setSubjectName('');
    setSelectedBookTypes([]);
    setProgressError('');
  }

  function editSubject(subjectId: string) {
    const current = subjects.find((subject) => subject.id === subjectId);
    if (!current) return;
    const next = window.prompt('Edit subject name', current.name)?.trim();
    if (!next) return;
    setSubjects((prev) => prev.map((subject) => (subject.id === subjectId ? { ...subject, name: next } : subject)));
  }

  function deleteSubject(subjectId: string) {
    setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
    setProgressState((prev) => {
      const next = { ...prev };
      delete next[subjectId];
      return next;
    });
  }

  function addBookTypeToSubject(subjectId: string) {
    const value = window.prompt('Add book type')?.trim();
    if (!value) return;
    setSubjects((prev) => prev.map((subject) => {
      if (subject.id !== subjectId) return subject;
      if (subject.bookTypes.includes(value)) return subject;
      return { ...subject, bookTypes: [...subject.bookTypes, value] };
    }));
    setSelectedBookTypeBySubject((prev) => ({
      ...prev,
      [subjectId]: prev[subjectId] || value,
    }));
  }

  function editBookType(subjectId: string, oldBookType: string) {
    const nextBookType = window.prompt('Edit book type', oldBookType)?.trim();
    if (!nextBookType) return;
    setSubjects((prev) => prev.map((subject) => {
      if (subject.id !== subjectId) return subject;
      const replaced = subject.bookTypes.map((bookType) => (bookType === oldBookType ? nextBookType : bookType));
      const nextYearly = subject.yearlyBookTypes.map((bookType) => (bookType === oldBookType ? nextBookType : bookType));
      return {
        ...subject,
        bookTypes: Array.from(new Set(replaced)),
        yearlyBookTypes: Array.from(new Set(nextYearly)),
        noWorkBookTypes: Array.from(new Set(subject.noWorkBookTypes.map((bookType) => (bookType === oldBookType ? nextBookType : bookType)))),
      };
    }));
    setProgressState((prev) => {
      const next = { ...prev };
      const subjectTerms = next[subjectId] ?? {};
      const transformedTerms: Record<string, Record<string, Record<string, ChapterProgressRow>>> = {};
      for (const [term, bookTypeMap] of Object.entries(subjectTerms)) {
        transformedTerms[term] = {};
        for (const [bookType, chapterMap] of Object.entries(bookTypeMap)) {
          const targetBookType = bookType === oldBookType ? nextBookType : bookType;
          transformedTerms[term][targetBookType] = transformedTerms[term][targetBookType] ?? {};
          for (const [chapter, row] of Object.entries(chapterMap)) {
            transformedTerms[term][targetBookType][chapter] = {
              ...row,
              bookType: row.bookType === oldBookType ? nextBookType : row.bookType,
            };
          }
        }
      }
      next[subjectId] = transformedTerms;
      return next;
    });
    setSelectedBookTypeBySubject((prev) => ({
      ...prev,
      [subjectId]: prev[subjectId] === oldBookType ? nextBookType : prev[subjectId],
    }));
  }

  function deleteBookType(subjectId: string, bookType: string) {
    const subject = subjects.find((item) => item.id === subjectId);
    if (!subject) return;
    const nextBookTypes = subject.bookTypes.filter((item) => item !== bookType);
    setSubjects((prev) => prev.map((item) => (
      item.id === subjectId
        ? {
          ...item,
          bookTypes: nextBookTypes,
          yearlyBookTypes: item.yearlyBookTypes.filter((entry) => entry !== bookType),
          noWorkBookTypes: item.noWorkBookTypes.filter((entry) => entry !== bookType),
        }
        : item
    )));
    setProgressState((prev) => {
      const next = { ...prev };
      const subjectTerms = next[subjectId] ?? {};
      const transformedTerms: Record<string, Record<string, Record<string, ChapterProgressRow>>> = {};
      for (const [term, bookTypeMap] of Object.entries(subjectTerms)) {
        transformedTerms[term] = {};
        for (const [currentBookType, chapterMap] of Object.entries(bookTypeMap)) {
          if (currentBookType === bookType) continue;
          transformedTerms[term][currentBookType] = chapterMap;
        }
      }
      next[subjectId] = transformedTerms;
      return next;
    });
    setSelectedBookTypeBySubject((prev) => ({
      ...prev,
      [subjectId]: prev[subjectId] === bookType ? (nextBookTypes[0] ?? '') : prev[subjectId],
    }));
  }

  function toggleYearlyBookType(subjectId: string, bookType: string) {
    setSubjects((prev) => prev.map((subject) => {
      if (subject.id !== subjectId) return subject;
      const has = subject.yearlyBookTypes.includes(bookType);
      return {
        ...subject,
        yearlyBookTypes: has
          ? subject.yearlyBookTypes.filter((item) => item !== bookType)
          : [...subject.yearlyBookTypes, bookType],
        noWorkBookTypes: has ? subject.noWorkBookTypes : subject.noWorkBookTypes.filter((item) => item !== bookType),
      };
    }));
  }

  function toggleNoWorkBookType(subjectId: string, bookType: string) {
    setSubjects((prev) => prev.map((subject) => {
      if (subject.id !== subjectId) return subject;
      const has = subject.noWorkBookTypes.includes(bookType);
      return {
        ...subject,
        noWorkBookTypes: has
          ? subject.noWorkBookTypes.filter((item) => item !== bookType)
          : [...subject.noWorkBookTypes, bookType],
        yearlyBookTypes: has ? subject.yearlyBookTypes : subject.yearlyBookTypes.filter((item) => item !== bookType),
      };
    }));
  }

  function addTerm() {
    const value = termName.trim();
    if (!value || terms.includes(value)) {
      setProgressError('Enter a unique term name.');
      return;
    }
    setTerms((prev) => [...prev, value]);
    setSelectedTerm(value);
    setTermName('');
    setProgressError('');
  }

  function editTerm(term: string) {
    const nextTerm = window.prompt('Edit term', term)?.trim();
    if (!nextTerm || terms.includes(nextTerm)) return;
    setTerms((prev) => prev.map((item) => (item === term ? nextTerm : item)));
    setProgressState((prev) => {
      const next: ProgressState = {};
      for (const [subjectId, termMap] of Object.entries(prev)) {
        next[subjectId] = {};
        for (const [currentTerm, chapterMap] of Object.entries(termMap)) {
          next[subjectId][currentTerm === term ? nextTerm : currentTerm] = chapterMap;
        }
      }
      return next;
    });
    if (selectedTerm === term) setSelectedTerm(nextTerm);
  }

  function deleteTerm(term: string) {
    setTerms((prev) => prev.filter((item) => item !== term));
    setProgressState((prev) => {
      const next: ProgressState = {};
      for (const [subjectId, termMap] of Object.entries(prev)) {
        next[subjectId] = {};
        for (const [currentTerm, chapterMap] of Object.entries(termMap)) {
          if (currentTerm !== term) next[subjectId][currentTerm] = chapterMap;
        }
      }
      return next;
    });
  }

  function rowKey(chapterOrYearlyLabel: string, singleRecord: boolean): string {
    if (!singleRecord) return chapterOrYearlyLabel;
    return '__YEARLY__';
  }

  function getChapterProgress(chapter: string, bookType: string, singleRecord: boolean, defaultNoWork: boolean): ChapterProgressRow {
    if (!selectedSubjectId || !selectedTerm || !bookType) {
      return { done: false, bookType: '', noWork: false, startDate: '', submissionDate: '', returnedDate: '' };
    }
    const key = rowKey(chapter, singleRecord);
    return progressState[selectedSubjectId]?.[selectedTerm]?.[bookType]?.[key]
      ?? {
        done: false,
        bookType,
        noWork: defaultNoWork,
        startDate: '',
        submissionDate: '',
        returnedDate: '',
      };
  }

  function updateChapterProgress(chapter: string, bookType: string, singleRecord: boolean, patch: Partial<ChapterProgressRow>) {
    if (!selectedSubjectId || !selectedTerm || !bookType) return;
    const key = rowKey(chapter, singleRecord);
    setProgressState((prev) => {
      const current = prev[selectedSubjectId]?.[selectedTerm]?.[bookType]?.[key]
        ?? {
          done: false,
          bookType,
          noWork: false,
          startDate: '',
          submissionDate: '',
          returnedDate: '',
        };

      const nextRow = { ...current, ...patch };

      return {
        ...prev,
        [selectedSubjectId]: {
          ...(prev[selectedSubjectId] ?? {}),
          [selectedTerm]: {
            ...(prev[selectedSubjectId]?.[selectedTerm] ?? {}),
            [bookType]: {
              ...(prev[selectedSubjectId]?.[selectedTerm]?.[bookType] ?? {}),
              [key]: nextRow,
            },
          },
        },
      };
    });
  }

  function isChapterRowComplete(row: ChapterProgressRow): boolean {
    if (row.noWork) return true;
    return Boolean(row.bookType && row.startDate && row.submissionDate && row.returnedDate);
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-4">
        <p className="text-sm font-semibold text-heading">My Progress Setup</p>
        <p className={`text-xs ${progressSaveState === 'error' ? 'text-red-400' : 'text-slate-500'}`}>
          {progressSaveState === 'saving'
            ? 'Saving progress...'
            : progressSaveState === 'saved'
              ? 'Progress saved'
              : progressSaveState === 'error'
                ? 'Failed to save progress'
                : 'Changes are auto-saved'}
        </p>

        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">1. Add Subject (Manual)</p>
          <select
            value={subjectName}
            onChange={(event) => setSubjectName(event.target.value)}
            className="form-select-ui h-10 rounded-xl w-full"
          >
            <option value="">Select subject from My Study</option>
            {myStudySubjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Subjects are loaded from My Study.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Book Types</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={bookTypeOptionInput}
              onChange={(event) => setBookTypeOptionInput(event.target.value)}
              placeholder="Add book type option"
              className="form-control-ui h-10 rounded-xl flex-1"
            />
            <button
              type="button"
              onClick={addBookTypeOption}
              className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              Add Option
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bookTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleBookType(type)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  selectedBookTypes.includes(type)
                    ? 'border-teal/60 bg-teal/15 text-teal'
                    : 'border-main text-slate-400 hover:text-heading'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <button type="button" onClick={addSubject} className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold">
            Add Subject
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Subjects (Edit / Delete / Book Types)</p>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div key={subject.id} className="rounded-xl border border-main p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-heading">{subject.name}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => addBookTypeToSubject(subject.id)} className="text-xs text-slate-400 hover:text-heading">Add BookType</button>
                    <button type="button" onClick={() => editSubject(subject.id)} className="text-xs text-slate-400 hover:text-heading">Edit</button>
                    <button type="button" onClick={() => deleteSubject(subject.id)} className="text-xs text-slate-400 hover:text-red-400">Delete</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subject.bookTypes.map((bookType) => (
                    <span key={`${subject.id}-${bookType}`} className="rounded-full border border-main px-2 py-1 text-[11px] text-slate-300 inline-flex items-center gap-1">
                      {bookType}
                      <button
                        type="button"
                        onClick={() => toggleYearlyBookType(subject.id, bookType)}
                        className={`${subject.yearlyBookTypes.includes(bookType) ? 'text-teal' : 'text-slate-500'} hover:text-heading`}
                        title="Yearly = taken for correction once a year; Chapter = tracked by chapter"
                      >
                        {subject.yearlyBookTypes.includes(bookType) ? 'Yearly' : 'Chapter'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleNoWorkBookType(subject.id, bookType)}
                        className={`${subject.noWorkBookTypes.includes(bookType) ? 'text-teal' : 'text-slate-500'} hover:text-heading`}
                        title="No Work = never taken for correction"
                      >
                        {subject.noWorkBookTypes.includes(bookType) ? 'No Work' : 'Correction'}
                      </button>
                      <button type="button" onClick={() => editBookType(subject.id, bookType)} className="text-slate-500 hover:text-heading">✎</button>
                      <button type="button" onClick={() => deleteBookType(subject.id, bookType)} className="text-slate-500 hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {subjects.length === 0 ? <p className="text-xs text-slate-500">No subjects added yet.</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">2. Terms (Edit / Delete)</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={termName}
              onChange={(event) => setTermName(event.target.value)}
              placeholder="Term - 3"
              className="form-control-ui h-10 rounded-xl flex-1"
            />
            <button type="button" onClick={addTerm} className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold">
              Add Term
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {terms.map((term) => (
              <span key={term} className="rounded-full border border-main px-3 py-1 text-xs text-slate-300 inline-flex items-center gap-2">
                {term}
                <button type="button" onClick={() => editTerm(term)} className="text-slate-500 hover:text-heading">Edit</button>
                <button type="button" onClick={() => deleteTerm(term)} className="text-slate-500 hover:text-red-400">Delete</button>
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <p className="text-sm font-semibold text-heading">Progress View</p>
        <p className="text-xs text-slate-500">1. Select Subject 2. Select Term 3. Select Book Type 4. Update status and dates</p>
        <p className="text-[11px] text-slate-500">
          Yearly = taken for correction once a year. No work = never taken for correction.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={selectedSubjectId}
            onChange={(event) => setSelectedSubjectId(event.target.value)}
            className="form-select-ui h-10 rounded-xl"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>

          <select
            value={selectedTerm}
            onChange={(event) => setSelectedTerm(event.target.value)}
            className="form-select-ui h-10 rounded-xl"
          >
            <option value="">Select Term</option>
            {terms.map((term) => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>

        {chaptersError ? <p className="text-xs text-red-400">{chaptersError}</p> : null}
        {progressError ? <p className="text-xs text-red-400">{progressError}</p> : null}
        {isNoWorkBookType ? (
          <p className="text-xs text-amber-300">
            No work for this book type. It is never taken for correction.
          </p>
        ) : null}

        {!selectedSubject || !selectedTerm ? (
          <p className="text-xs text-slate-500">Select subject and term to view chapter status.</p>
        ) : !selectedBookType ? (
          <p className="text-xs text-slate-500">Select a book type to continue.</p>
        ) : chapters.length === 0 && !isYearlyBookType && !isNoWorkBookType ? (
          <p className="text-xs text-slate-500">No chapters found for selected subject in My Study chapter list.</p>
        ) : (
          <div className="overflow-auto">
            <div className="mb-3">
              <select
                value={selectedBookType}
                onChange={(event) => {
                  setSelectedBookTypeBySubject((prev) => ({ ...prev, [selectedSubject.id]: event.target.value }));
                  setProgressError('');
                }}
                className="form-select-ui h-10 rounded-xl min-w-[260px]"
              >
                <option value="">Select Book Type</option>
                {selectedSubject.bookTypes.map((bookType) => (
                  <option key={bookType} value={bookType}>
                    {bookType}
                    {selectedSubject.noWorkBookTypes.includes(bookType)
                      ? ' (No work)'
                      : selectedSubject.yearlyBookTypes.includes(bookType)
                        ? ' (Yearly single record)'
                        : ''}
                  </option>
                ))}
              </select>
            </div>
            <table className="w-full border-separate [border-spacing:10px] min-w-[1040px]">
              <thead>
                <tr>
                  <th className="rounded-2xl bg-white/10 px-4 py-3 text-left text-xs text-heading">Chapter</th>
                  <th className="rounded-2xl bg-white/10 px-4 py-3 text-left text-xs text-heading">Book Type</th>
                  <th className="rounded-2xl bg-white/10 px-4 py-3 text-left text-xs text-heading">Start Date</th>
                  <th className="rounded-2xl bg-white/10 px-4 py-3 text-left text-xs text-heading">Submission Date</th>
                  <th className="rounded-2xl bg-white/10 px-4 py-3 text-left text-xs text-heading">Returned by Teacher</th>
                  <th className="rounded-2xl bg-white/10 px-4 py-3 text-left text-xs text-heading">Done</th>
                </tr>
              </thead>
              <tbody>
                {progressRows.map((chapter) => {
                  const row = getChapterProgress(chapter, selectedBookType, isYearlyBookType || isNoWorkBookType, isNoWorkBookType);
                  return (
                    <tr key={`${selectedSubject.id}-${selectedTerm}-${chapter}`}>
                      <td className="rounded-2xl border border-main bg-white/[0.02] px-4 py-3 text-xs text-heading">{chapter}</td>
                      <td className="rounded-2xl border border-main bg-white/[0.02] px-3 py-2">
                        <p className="text-xs text-slate-300">{row.bookType || selectedBookType || '-'}</p>
                      </td>
                      <td className="rounded-2xl border border-main bg-white/[0.02] px-3 py-2">
                        <input
                          type="date"
                          value={row.startDate}
                          onChange={(event) => {
                            updateChapterProgress(chapter, selectedBookType, isYearlyBookType || isNoWorkBookType, { startDate: event.target.value });
                            setProgressError('');
                          }}
                          className="form-control-ui h-9 rounded-xl"
                          required
                          disabled={row.noWork}
                        />
                      </td>
                      <td className="rounded-2xl border border-main bg-white/[0.02] px-3 py-2">
                        <input
                          type="date"
                          value={row.submissionDate}
                          onChange={(event) => {
                            updateChapterProgress(chapter, selectedBookType, isYearlyBookType || isNoWorkBookType, { submissionDate: event.target.value });
                            setProgressError('');
                          }}
                          className="form-control-ui h-9 rounded-xl"
                          required
                          disabled={row.noWork}
                        />
                      </td>
                      <td className="rounded-2xl border border-main bg-white/[0.02] px-3 py-2">
                        <input
                          type="date"
                          value={row.returnedDate}
                          onChange={(event) => {
                            updateChapterProgress(chapter, selectedBookType, isYearlyBookType || isNoWorkBookType, { returnedDate: event.target.value });
                            setProgressError('');
                          }}
                          className="form-control-ui h-9 rounded-xl"
                          required
                          disabled={row.noWork}
                        />
                      </td>
                      <td className="rounded-2xl border border-main bg-white/[0.02] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                            <input
                              type="checkbox"
                              checked={row.noWork}
                              onChange={(event) => {
                                const checked = event.target.checked;
                                updateChapterProgress(chapter, selectedBookType, isYearlyBookType || isNoWorkBookType, {
                                  noWork: checked,
                                  done: checked ? false : row.done,
                                  startDate: checked ? '' : row.startDate,
                                  submissionDate: checked ? '' : row.submissionDate,
                                  returnedDate: checked ? '' : row.returnedDate,
                                });
                                setProgressError('');
                              }}
                              className="accent-teal w-4 h-4"
                              disabled={isNoWorkBookType}
                            />
                            No work (never taken for correction)
                          </label>
                        </div>
                        <label className="inline-flex items-center gap-2 text-xs text-slate-300 mt-2">
                          <input
                            type="checkbox"
                            checked={row.done}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              if (checked && !isChapterRowComplete(row)) {
                                setProgressError('All fields are required before marking chapter as done.');
                                return;
                              }
                              updateChapterProgress(chapter, selectedBookType, isYearlyBookType || isNoWorkBookType, { done: checked });
                              setProgressError('');
                            }}
                            className="accent-teal w-4 h-4"
                            disabled={row.noWork}
                          />
                          ✓
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
