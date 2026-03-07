import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import {
  createModuleAccessRequest,
  extractEduKartaChaptersFromImage,
  getEduKartaStudentProfile,
  listEduKartaSubjectChapters,
  listMyModuleAccessRequests,
  saveEduKartaSubjectChapters,
  saveEduKartaStudentProfile,
  type EduKartaStudentProfile,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const TOTAL_STEPS = 4;
const BOARD_OPTIONS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'];
const CLASS_OPTIONS = ['6', '7', '8', '9', '10', '11', '12'];

const SUBJECT_RECOMMENDATIONS: Record<string, string[]> = {
  default: ['English', 'Mathematics', 'Science', 'Social Science'],
  class11: ['Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Accountancy'],
  class12: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Business Studies', 'History'],
  cbse: ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
  icse: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'],
  ib: ['English', 'Mathematics AA', 'Mathematics AI', 'Physics', 'Business Management'],
  cambridge: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics'],
};

function getSmartSuggestions(board: string, classLevel: string): string[] {
  const bucket = Number(classLevel) >= 11 ? `class${classLevel}` : 'default';
  const boardKey = board.trim().toLowerCase();
  const boardSuggestions = SUBJECT_RECOMMENDATIONS[boardKey] ?? [];
  const classSuggestions = SUBJECT_RECOMMENDATIONS[bucket] ?? SUBJECT_RECOMMENDATIONS.default;
  return Array.from(new Set([...boardSuggestions, ...classSuggestions]));
}

export function EduKartaPage() {
  const { token, user, refreshRbac, logout } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');
  const [requestState, setRequestState] = useState('');
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [board, setBoard] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [savedProfile, setSavedProfile] = useState<EduKartaStudentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [chaptersBySubject, setChaptersBySubject] = useState<Record<string, string[]>>({});
  const [chapterInputBySubject, setChapterInputBySubject] = useState<Record<string, string>>({});
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [suggestingSubject, setSuggestingSubject] = useState('');
  const [savingSubject, setSavingSubject] = useState('');
  const [chapterMessage, setChapterMessage] = useState('');
  const [tocModalOpen, setTocModalOpen] = useState(false);
  const [tocModalSubject, setTocModalSubject] = useState('');
  const [tocImageDataUrl, setTocImageDataUrl] = useState('');
  const [tocFileName, setTocFileName] = useState('');
  const [tocError, setTocError] = useState('');
  const [tocExtracting, setTocExtracting] = useState(false);
  const [tocOptions, setTocOptions] = useState<string[]>([]);
  const [tocSelected, setTocSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadAccess() {
      try {
        if (user?.isRoot || user?.role === 'root') {
          setHasAccess(true);
          return;
        }
        const snapshot = await refreshRbac();
        const modules = snapshot?.modules ?? [];
        setHasAccess(modules.includes('*') || modules.includes('edukarta'));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load access';
        if (message.toLowerCase().includes('unauthorized')) logout();
        setError(message);
      }
    }

    void loadAccess();
  }, [user, logout, refreshRbac]);

  useEffect(() => {
    async function loadRequestStatus() {
      if (!token || user?.role !== 'member' || hasAccess) return;
      try {
        const data = await listMyModuleAccessRequests(token);
        const latest = data.requests
          .filter((item) => item.module_name === 'edukarta')
          .sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))[0];

        const pending = latest?.status === 'pending';
        setIsRequestPending(pending);
        if (pending) {
          setRequestState('Request submitted to your organization admin. Awaiting approval.');
        } else {
          setRequestState('');
        }
      } catch {
        setIsRequestPending(false);
      }
    }

    void loadRequestStatus();
  }, [token, user, hasAccess]);

  useEffect(() => {
    async function loadProfile() {
      if (!token || !hasAccess) return;
      setLoadingProfile(true);
      try {
        const data = await getEduKartaStudentProfile(token);
        setSavedProfile(data.profile);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load student profile';
        setError(message);
      } finally {
        setLoadingProfile(false);
      }
    }

    void loadProfile();
  }, [token, hasAccess]);

  useEffect(() => {
    async function loadChapters() {
      if (!token || !savedProfile) return;
      setLoadingChapters(true);
      try {
        const data = await listEduKartaSubjectChapters(token);
        const normalized: Record<string, string[]> = {};
        for (const subject of savedProfile.subjects) {
          normalized[subject] = data.chaptersBySubject[subject] ?? [];
        }
        setChaptersBySubject(normalized);
      } catch (err) {
        setChapterMessage(err instanceof Error ? err.message : 'Failed to load chapters');
      } finally {
        setLoadingChapters(false);
      }
    }

    void loadChapters();
  }, [token, savedProfile]);

  if (error) {
    return <Card className="p-6"><p className="text-red-400 text-sm">{error}</p></Card>;
  }

  if (!hasAccess) {
    const canRequest = user?.role === 'member';
    return (
      <Card className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-md">
          <div className="mx-auto w-12 h-12 rounded-full border border-teal/40 bg-teal/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-teal" />
          </div>
          <p className="text-lg font-semibold text-heading">EduKarta Locked</p>
          <p className="text-sm text-slate-400">Subscribe to access EduKarta features.</p>
          <button
            type="button"
            onClick={() => navigate('/admin/subscription')}
            disabled={isRequestPending}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary-ui w-fit disabled:opacity-50"
          >
            Subscribe to Access
          </button>
          {canRequest ? (
            <button
              type="button"
              onClick={async () => {
                if (!token) return;
                setRequestState('Submitting...');
                try {
                  await createModuleAccessRequest(token, { moduleSlug: 'edukarta' });
                  setIsRequestPending(true);
                  setRequestState('Request submitted to your organization admin.');
                } catch (err) {
                  setRequestState(err instanceof Error ? err.message : 'Failed to submit request');
                }
              }}
              disabled={isRequestPending}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-secondary-ui w-fit disabled:opacity-50"
            >
              {isRequestPending ? 'Request Pending' : 'Request Access'}
            </button>
          ) : null}
          {requestState ? <p className="text-xs text-slate-400">{requestState}</p> : null}
        </div>
      </Card>
    );
  }

  const suggestions = getSmartSuggestions(board, classLevel);
  const progress = Math.round((step / TOTAL_STEPS) * 100);
  const canContinue =
    (step === 1 && name.trim().length >= 2) ||
    (step === 2 && board.trim().length > 0) ||
    (step === 3 && classLevel.trim().length > 0) ||
    step === 4;
  const canFinish = subjects.length > 0;

  function toggleSubject(subject: string) {
    setSubjects((prev) => (prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject]));
  }

  function applySmartSuggestions() {
    setSubjects((prev) => Array.from(new Set([...prev, ...suggestions])));
  }

  function addCustomSubject() {
    const value = customSubject.trim();
    if (!value) return;
    setSubjects((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustomSubject('');
  }

  async function onFinishOnboarding() {
    if (!canFinish || !token) return;
    setSavingProfile(true);
    setError('');
    try {
      await saveEduKartaStudentProfile(token, {
        name: name.trim(),
        board,
        classLevel,
        subjects,
      });
      const data = await getEduKartaStudentProfile(token);
      setSavedProfile(data.profile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save student profile';
      setError(message);
    } finally {
      setSavingProfile(false);
    }
  }

  function addChapterToSubject(subject: string) {
    const value = (chapterInputBySubject[subject] ?? '').trim();
    if (!value) return;
    setChaptersBySubject((prev) => {
      const existing = prev[subject] ?? [];
      return { ...prev, [subject]: mergeUniqueChapters(existing, [value]) };
    });
    setChapterInputBySubject((prev) => ({ ...prev, [subject]: '' }));
    setChapterMessage('');
  }

  function removeChapterFromSubject(subject: string, chapter: string) {
    setChaptersBySubject((prev) => ({
      ...prev,
      [subject]: (prev[subject] ?? []).filter((item) => item !== chapter),
    }));
    setChapterMessage('');
  }

  function openTocModal(subject: string) {
    setTocModalSubject(subject);
    setTocImageDataUrl('');
    setTocFileName('');
    setTocError('');
    setTocOptions([]);
    setTocSelected({});
    setTocModalOpen(true);
  }

  async function submitTocSuggestion() {
    if (!tocModalSubject) return;
    if (!token) return;
    if (!tocImageDataUrl) {
      setTocError('Please upload a TOC image.');
      return;
    }
    setTocError('');
    setTocExtracting(true);
    setSuggestingSubject(tocModalSubject);
    try {
      const data = await extractEduKartaChaptersFromImage(token, {
        subject: tocModalSubject,
        imageDataUrl: tocImageDataUrl,
      });
      const nextOptions = mergeUniqueChapters([], data.chapters);
      const nextSelected = Object.fromEntries(nextOptions.map((item) => [item, true]));
      setTocOptions(nextOptions);
      setTocSelected(nextSelected);
      setChapterMessage('');
    } catch (err) {
      setTocError(err instanceof Error ? err.message : 'Failed to extract chapters from image');
    } finally {
      setTocExtracting(false);
      setSuggestingSubject('');
    }
  }

  function toggleTocOption(option: string) {
    setTocSelected((prev) => ({ ...prev, [option]: !prev[option] }));
  }

  function toggleAllTocOptions(selectAll: boolean) {
    setTocSelected(Object.fromEntries(tocOptions.map((option) => [option, selectAll])));
  }

  function applySelectedTocOptions() {
    if (!tocModalSubject) return;
    const selectedItems = tocOptions.filter((item) => tocSelected[item]);
    if (selectedItems.length === 0) {
      setTocError('Select at least one chapter/sub-chapter.');
      return;
    }
    setChaptersBySubject((prev) => ({
      ...prev,
      [tocModalSubject]: mergeUniqueChapters(prev[tocModalSubject] ?? [], selectedItems),
    }));
    setChapterMessage(`Added ${selectedItems.length} items for ${tocModalSubject}.`);
    setTocModalOpen(false);
    setTocModalSubject('');
    setTocImageDataUrl('');
    setTocFileName('');
    setTocError('');
    setTocOptions([]);
    setTocSelected({});
  }

  async function onTocImageSelect(file: File | null) {
    if (!file) {
      setTocImageDataUrl('');
      setTocFileName('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setTocError('Please upload an image file only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setTocError('Image is too large. Use a file under 5MB.');
      return;
    }

    setTocError('');
    setTocFileName(file.name);
    const dataUrl = await readFileAsDataUrl(file);
    setTocImageDataUrl(dataUrl);
  }

  async function saveChaptersForSubject(subject: string) {
    if (!token) return;
    const chapters = chaptersBySubject[subject] ?? [];
    if (chapters.length === 0) {
      setChapterMessage(`No chapters selected for ${subject}. Add/select chapters before saving.`);
      return;
    }
    setSavingSubject(subject);
    setChapterMessage('');
    try {
      await saveEduKartaSubjectChapters(token, { subject, chapters });
      setChapterMessage(`Saved ${chapters.length} chapters for ${subject}.`);
    } catch (err) {
      setChapterMessage(err instanceof Error ? err.message : 'Failed to save chapters');
    } finally {
      setSavingSubject('');
    }
  }

  if (loadingProfile) {
    return <Card className="p-6"><p className="text-sm text-slate-400">Loading student profile...</p></Card>;
  }

  if (savedProfile) {
    return (
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal" />
            <p className="text-sm font-semibold text-heading">Student onboarding completed</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Completed on {new Date(savedProfile.completedAt).toLocaleString()}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
            <div className="rounded-xl border border-main p-3">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Student name</p>
              <p className="text-heading font-semibold">{savedProfile.name}</p>
            </div>
            <div className="rounded-xl border border-main p-3">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Board and class</p>
              <p className="text-heading font-semibold">{savedProfile.board} · Class {savedProfile.classLevel}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Subjects</p>
            <div className="flex flex-wrap gap-2">
              {savedProfile.subjects.map((subject) => (
                <span
                  key={subject}
                  className="rounded-full px-3 py-1 text-xs font-semibold border border-teal/40 text-teal bg-teal/10"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/profile')}
            className="mt-5 px-3 py-1.5 rounded-lg text-xs font-semibold btn-secondary-ui"
          >
            View in Profile
          </button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm font-semibold text-heading">Subject Chapters</p>
            {loadingChapters ? <span className="text-xs text-slate-500">Loading...</span> : null}
          </div>
          <div className="space-y-4">
            {savedProfile.subjects.map((subject) => {
              const subjectChapters = chaptersBySubject[subject] ?? [];
              return (
                <div key={subject} className="rounded-xl border border-main p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-heading">{subject}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openTocModal(subject)}
                        disabled={suggestingSubject === subject}
                        className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {suggestingSubject === subject ? 'Processing...' : 'Suggest from TOC'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void saveChaptersForSubject(subject)}
                        disabled={savingSubject === subject || subjectChapters.length === 0}
                        className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                      >
                        {savingSubject === subject ? 'Saving...' : 'Save Chapters'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chapterInputBySubject[subject] ?? ''}
                      onChange={(event) => setChapterInputBySubject((prev) => ({ ...prev, [subject]: event.target.value }))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addChapterToSubject(subject);
                        }
                      }}
                      className="form-control-ui h-10 rounded-xl flex-1"
                      placeholder={`Add chapter for ${subject}`}
                    />
                    <button
                      type="button"
                      onClick={() => addChapterToSubject(subject)}
                      className="btn-secondary-ui px-3 py-2 rounded-lg text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>

                  {subjectChapters.length === 0 ? (
                    <p className="text-xs text-slate-500">No chapters added yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subjectChapters.map((chapter) => (
                        <button
                          key={`${subject}-${chapter}`}
                          type="button"
                          onClick={() => removeChapterFromSubject(subject, chapter)}
                          className="rounded-full px-3 py-1 text-xs font-semibold border border-teal/40 text-teal bg-teal/10 hover:bg-red-500/10 hover:border-red-400 hover:text-red-400"
                        >
                          {chapter} ×
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {chapterMessage ? <p className="text-xs text-slate-400 mt-4">{chapterMessage}</p> : null}
        </Card>

        {tocModalOpen ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md glass rounded-2xl border border-main p-5 space-y-4">
              <p className="text-sm font-semibold text-heading">Upload Table of Contents Image</p>
              <p className="text-xs text-slate-500">
                Subject: <span className="text-heading font-semibold">{tocModalSubject}</span>
              </p>
                  <input type="file" accept="image/*" onChange={(event) => void onTocImageSelect(event.target.files?.[0] ?? null)} className="form-control-ui w-full h-11 rounded-xl file:mr-3 file:border-0 file:bg-transparent file:text-xs file:font-semibold" />
                  {tocFileName ? <p className="text-xs text-slate-400">Selected: {tocFileName}</p> : null}
                  {tocOptions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">Select chapters and sub-chapters</p>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => toggleAllTocOptions(true)} className="text-xs text-teal hover:underline">
                            Select all
                          </button>
                          <button type="button" onClick={() => toggleAllTocOptions(false)} className="text-xs text-slate-400 hover:underline">
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-56 overflow-auto rounded-xl border border-main p-2 space-y-1">
                        {tocOptions.map((option) => (
                          <label key={option} className="flex items-start gap-2 rounded-lg px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(tocSelected[option])}
                              onChange={() => toggleTocOption(option)}
                              className="mt-0.5 accent-teal"
                            />
                            <span className="text-xs text-heading">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {tocError ? <p className="text-xs text-red-400">{tocError}</p> : null}
                  <div className="flex items-center justify-end gap-2">
                    <button
                  type="button"
                      onClick={() => {
                        setTocModalOpen(false);
                        setTocModalSubject('');
                        setTocImageDataUrl('');
                        setTocFileName('');
                        setTocError('');
                        setTocOptions([]);
                        setTocSelected({});
                      }}
                      className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void submitTocSuggestion()}
                      disabled={tocExtracting}
                      className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      {tocExtracting ? 'Extracting...' : 'Extract List'}
                    </button>
                    {tocOptions.length > 0 ? (
                      <button
                        type="button"
                        onClick={applySelectedTocOptions}
                        className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        Add Selected
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-teal" />
            <p className="text-sm font-semibold text-heading">EduKarta Student Onboarding</p>
          </div>
          <span className="text-xs text-slate-500">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div className="h-full bg-teal transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-heading">What is the student name?</p>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="form-control-ui w-full h-11 rounded-xl"
              placeholder="Enter full name"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-heading">Choose education board</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BOARD_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBoard(option)}
                  className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                    board === option
                      ? 'border-teal/60 bg-teal/15 text-teal'
                      : 'border-main text-slate-400 hover:text-heading'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-heading">Select class</p>
            <select
              value={classLevel}
              onChange={(event) => setClassLevel(event.target.value)}
              className="form-select-ui w-full h-11 rounded-xl"
            >
              <option value="">Select class</option>
              {CLASS_OPTIONS.map((item) => (
                <option key={item} value={item}>Class {item}</option>
              ))}
            </select>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-heading">Choose subjects</p>
              <button type="button" onClick={applySmartSuggestions} className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Auto suggest
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                    subjects.includes(subject)
                      ? 'border-teal/50 bg-teal/15 text-teal'
                      : 'border-main text-slate-400 hover:text-heading'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSubject}
                onChange={(event) => setCustomSubject(event.target.value)}
                className="form-control-ui h-10 rounded-xl flex-1"
                placeholder="Add custom subject"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addCustomSubject();
                  }
                }}
              />
              <button type="button" onClick={addCustomSubject} className="btn-secondary-ui px-3 py-2 rounded-lg text-xs font-semibold">
                Add
              </button>
            </div>
            {subjects.length > 0 ? (
              <div className="rounded-xl border border-main p-3">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Selected subjects</p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <span key={subject} className="rounded-full px-3 py-1 text-xs font-semibold border border-teal/40 text-teal bg-teal/10">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select at least one subject to continue.</p>
            )}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            Back
          </button>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(TOTAL_STEPS, prev + 1))}
              disabled={!canContinue}
              className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void onFinishOnboarding()}
              disabled={!canFinish || savingProfile}
              className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Finish onboarding'}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function mergeUniqueChapters(existing: string[], incoming: string[]): string[] {
  const output: string[] = [];
  const seen = new Set<string>();

  for (const raw of [...existing, ...incoming]) {
    const value = raw.trim().replace(/\s{2,}/g, ' ');
    if (!value) continue;
    const key = normalizeChapterKey(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }

  return output;
}

function normalizeChapterKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/^\d+(\.\d+)*[\)\].:\s-]*/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s*-\s*/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
