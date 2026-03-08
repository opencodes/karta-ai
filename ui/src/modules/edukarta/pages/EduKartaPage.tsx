import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import {
  createModuleAccessRequest,
  extractEduKartaChaptersFromImage,
  getEduKartaStudentProfile,
  listEduKartaSubjectChapters,
  listMyModuleAccessRequests,
  saveEduKartaStudentProfile,
  saveEduKartaSubjectChapters,
  type EduKartaStudentProfile,
} from '../../../lib/api';
import { OnboardingSection } from '../sections/OnboardingSection';
import { SubjectChaptersSection } from '../sections/SubjectChaptersSection';

const TOTAL_STEPS = 4;
const BOARD_OPTIONS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'];
const CLASS_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

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

type EduKartaPageProps = {
  onProfileSummaryChange?: (summary: { board: string; classLevel: string } | null) => void;
};

function isOnboardingComplete(profile: EduKartaStudentProfile | null): boolean {
  if (!profile) return false;
  return (
    profile.name.trim().length > 0 &&
    profile.board.trim().length > 0 &&
    profile.classLevel.trim().length > 0 &&
    profile.subjects.length > 0
  );
}

export function EduKartaPage({ onProfileSummaryChange }: EduKartaPageProps) {
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
  const [addingSubject, setAddingSubject] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState('');

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
  }, [user, refreshRbac, logout]);

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
        setRequestState(pending ? 'Request submitted to your organization admin. Awaiting approval.' : '');
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
        setError(err instanceof Error ? err.message : 'Failed to load student profile');
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

  useEffect(() => {
    if (!onProfileSummaryChange) return;
    if (!isOnboardingComplete(savedProfile)) {
      onProfileSummaryChange(null);
      return;
    }
    onProfileSummaryChange({
      board: savedProfile.board,
      classLevel: savedProfile.classLevel,
    });
  }, [savedProfile, onProfileSummaryChange]);

  const suggestions = getSmartSuggestions(board, classLevel);
  const progress = Math.round((step / TOTAL_STEPS) * 100);
  const canContinue =
    (step === 1 && name.trim().length >= 2) ||
    (step === 2 && board.trim().length > 0) ||
    (step === 3 && classLevel.trim().length > 0) ||
    step === 4;
  const canFinish = subjects.length > 0;

  function onToggleSubject(subject: string) {
    setSubjects((prev) => (prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject]));
  }

  function onApplySmartSuggestions() {
    setSubjects((prev) => Array.from(new Set([...prev, ...suggestions])));
  }

  function onAddCustomSubject() {
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
      await saveEduKartaStudentProfile(token, { name: name.trim(), board, classLevel, subjects });
      const data = await getEduKartaStudentProfile(token);
      setSavedProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save student profile');
    } finally {
      setSavingProfile(false);
    }
  }

  function onAddChapter(subject: string) {
    const value = (chapterInputBySubject[subject] ?? '').trim();
    if (!value) return;
    setChaptersBySubject((prev) => ({ ...prev, [subject]: mergeUniqueChapters(prev[subject] ?? [], [value]) }));
    setChapterInputBySubject((prev) => ({ ...prev, [subject]: '' }));
    setChapterMessage('');
  }

  function onRemoveChapter(subject: string, chapter: string) {
    setChaptersBySubject((prev) => ({ ...prev, [subject]: (prev[subject] ?? []).filter((item) => item !== chapter) }));
    setChapterMessage('');
  }

  async function onAddSubject(subject: string) {
    if (!token || !savedProfile) return;
    const value = subject.trim();
    if (!value) return;
    if (savedProfile.subjects.includes(value)) {
      setChapterMessage(`${value} already exists.`);
      return;
    }

    setAddingSubject(true);
    setChapterMessage('');
    try {
      await saveEduKartaStudentProfile(token, {
        name: savedProfile.name,
        board: savedProfile.board,
        classLevel: savedProfile.classLevel,
        subjects: [...savedProfile.subjects, value],
      });
      const data = await getEduKartaStudentProfile(token);
      setSavedProfile(data.profile);
      setChapterMessage(`${value} added successfully.`);
    } catch (err) {
      setChapterMessage(err instanceof Error ? err.message : 'Failed to add subject');
    } finally {
      setAddingSubject(false);
    }
  }

  async function onDeleteSubject(subject: string) {
    if (!token || !savedProfile) return;
    if ((chaptersBySubject[subject] ?? []).length > 0) {
      setChapterMessage(`Cannot delete ${subject}. Remove all chapters first.`);
      return;
    }
    if (savedProfile.subjects.length <= 1) {
      setChapterMessage('At least one subject is required.');
      return;
    }

    setDeletingSubject(subject);
    setChapterMessage('');
    try {
      await saveEduKartaStudentProfile(token, {
        name: savedProfile.name,
        board: savedProfile.board,
        classLevel: savedProfile.classLevel,
        subjects: savedProfile.subjects.filter((item) => item !== subject),
      });
      const data = await getEduKartaStudentProfile(token);
      setSavedProfile(data.profile);
      setChaptersBySubject((prev) => {
        const next = { ...prev };
        delete next[subject];
        return next;
      });
      setChapterMessage(`${subject} deleted.`);
    } catch (err) {
      setChapterMessage(err instanceof Error ? err.message : 'Failed to delete subject');
    } finally {
      setDeletingSubject('');
    }
  }

  function onMoveChapter(fromSubject: string, toSubject: string, chapter: string) {
    if (!fromSubject || !toSubject || !chapter) return;
    if (fromSubject === toSubject) return;

    setChaptersBySubject((prev) => {
      const fromItems = (prev[fromSubject] ?? []).filter((item) => item !== chapter);
      const toItems = mergeUniqueChapters(prev[toSubject] ?? [], [chapter]);
      return { ...prev, [fromSubject]: fromItems, [toSubject]: toItems };
    });
    setChapterMessage(`Moved "${chapter}" to ${toSubject}.`);
  }

  function onRenameChapter(subject: string, oldChapter: string, nextChapter: string) {
    const trimmed = nextChapter.trim();
    if (!trimmed) {
      setChapterMessage('Chapter name cannot be empty.');
      return;
    }

    setChaptersBySubject((prev) => {
      const current = prev[subject] ?? [];
      const renamed = current.map((item) => (item === oldChapter ? trimmed : item));
      return { ...prev, [subject]: mergeUniqueChapters([], renamed) };
    });
    setChapterMessage('');
  }

  function onOpenTocModal(subject: string) {
    setTocModalSubject(subject);
    setTocImageDataUrl('');
    setTocFileName('');
    setTocError('');
    setTocOptions([]);
    setTocSelected({});
    setTocModalOpen(true);
  }

  async function onExtractList() {
    if (!tocModalSubject || !token) return;
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
      const options = mergeUniqueChapters([], data.chapters);
      setTocOptions(options);
      setTocSelected(Object.fromEntries(options.map((item) => [item, true])));
      setChapterMessage('');
    } catch (err) {
      setTocError(err instanceof Error ? err.message : 'Failed to extract chapters from image');
    } finally {
      setTocExtracting(false);
      setSuggestingSubject('');
    }
  }

  function onAddSelected() {
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
    onCloseTocModal();
  }

  function onCloseTocModal() {
    setTocModalOpen(false);
    setTocModalSubject('');
    setTocImageDataUrl('');
    setTocFileName('');
    setTocError('');
    setTocOptions([]);
    setTocSelected({});
  }

  async function onTocImagePick(file: File | null) {
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
    setTocImageDataUrl(await readFileAsDataUrl(file));
  }

  async function onSaveChapters(subject: string) {
    if (!token) return;
    const subjectChapters = chaptersBySubject[subject] ?? [];

    setSavingSubject(subject);
    setChapterMessage('');
    try {
      await saveEduKartaSubjectChapters(token, { subject, chapters: subjectChapters });
      setChapterMessage(
        subjectChapters.length === 0
          ? `Cleared all chapters for ${subject}.`
          : `Saved ${subjectChapters.length} chapters for ${subject}.`,
      );
    } catch (err) {
      setChapterMessage(err instanceof Error ? err.message : 'Failed to save chapters');
    } finally {
      setSavingSubject('');
    }
  }

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

  if (loadingProfile) {
    return <Card className="p-6"><p className="text-sm text-slate-400">Loading student profile...</p></Card>;
  }

  const completedProfile = isOnboardingComplete(savedProfile) ? savedProfile : null;

  if (completedProfile) {
    return (
      <SubjectChaptersSection
        profile={completedProfile}
        addingSubject={addingSubject}
        deletingSubject={deletingSubject}
        loadingChapters={loadingChapters}
        chaptersBySubject={chaptersBySubject}
        chapterInputBySubject={chapterInputBySubject}
        suggestingSubject={suggestingSubject}
        savingSubject={savingSubject}
        chapterMessage={chapterMessage}
        tocModalOpen={tocModalOpen}
        tocModalSubject={tocModalSubject}
        tocFileName={tocFileName}
        tocError={tocError}
        tocExtracting={tocExtracting}
        tocOptions={tocOptions}
        tocSelected={tocSelected}
        onChapterInputChange={(subject, value) => setChapterInputBySubject((prev) => ({ ...prev, [subject]: value }))}
        onAddChapter={onAddChapter}
        onAddSubject={(value) => void onAddSubject(value)}
        onDeleteSubject={(subject) => void onDeleteSubject(subject)}
        onRemoveChapter={onRemoveChapter}
        onRenameChapter={onRenameChapter}
        onMoveChapter={onMoveChapter}
        onOpenTocModal={onOpenTocModal}
        onSaveChapters={onSaveChapters}
        onCloseTocModal={onCloseTocModal}
        onTocImagePick={(file) => void onTocImagePick(file)}
        onExtractList={() => void onExtractList()}
        onToggleAllToc={(all) => setTocSelected(Object.fromEntries(tocOptions.map((option) => [option, all])))}
        onToggleTocOption={(option) => setTocSelected((prev) => ({ ...prev, [option]: !prev[option] }))}
        onAddSelected={onAddSelected}
      />
    );
  }

  return (
    <OnboardingSection
      step={step}
      totalSteps={TOTAL_STEPS}
      progress={progress}
      name={name}
      board={board}
      classLevel={classLevel}
      subjects={subjects}
      customSubject={customSubject}
      boardOptions={BOARD_OPTIONS}
      classOptions={CLASS_OPTIONS}
      suggestions={suggestions}
      savingProfile={savingProfile}
      canContinue={canContinue}
      canFinish={canFinish}
      onNameChange={setName}
      onBoardSelect={setBoard}
      onClassChange={setClassLevel}
      onToggleSubject={onToggleSubject}
      onApplySmartSuggestions={onApplySmartSuggestions}
      onCustomSubjectChange={setCustomSubject}
      onAddCustomSubject={onAddCustomSubject}
      onStepBack={() => setStep((prev) => Math.max(1, prev - 1))}
      onStepNext={() => setStep((prev) => Math.min(TOTAL_STEPS, prev + 1))}
      onFinish={() => void onFinishOnboarding()}
    />
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
