import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { EduKartaStudentProfile } from '../../../lib/api';

type Props = {
  profile: EduKartaStudentProfile;
  addingSubject: boolean;
  deletingSubject: string;
  loadingChapters: boolean;
  chaptersBySubject: Record<string, string[]>;
  chapterInputBySubject: Record<string, string>;
  suggestingSubject: string;
  savingSubject: string;
  chapterMessage: string;
  tocModalOpen: boolean;
  tocModalSubject: string;
  tocFileName: string;
  tocError: string;
  tocExtracting: boolean;
  tocOptions: string[];
  tocSelected: Record<string, boolean>;
  onChapterInputChange: (subject: string, value: string) => void;
  onAddChapter: (subject: string) => void;
  onAddSubject: (subject: string) => void;
  onDeleteSubject: (subject: string) => void;
  onRemoveChapter: (subject: string, chapter: string) => void;
  onRenameChapter: (subject: string, oldChapter: string, nextChapter: string) => void;
  onMoveChapter: (fromSubject: string, toSubject: string, chapter: string) => void;
  onOpenTocModal: (subject: string) => void;
  onSaveChapters: (subject: string) => void;
  onCloseTocModal: () => void;
  onTocImagePick: (file: File | null) => void;
  onExtractList: () => void;
  onToggleAllToc: (selectAll: boolean) => void;
  onToggleTocOption: (option: string) => void;
  onAddSelected: () => void;
};

export function SubjectChaptersSection({
  profile,
  addingSubject,
  deletingSubject,
  loadingChapters,
  chaptersBySubject,
  chapterInputBySubject,
  suggestingSubject,
  savingSubject,
  chapterMessage,
  tocModalOpen,
  tocModalSubject,
  tocFileName,
  tocError,
  tocExtracting,
  tocOptions,
  tocSelected,
  onChapterInputChange,
  onAddChapter,
  onAddSubject,
  onDeleteSubject,
  onRemoveChapter,
  onRenameChapter,
  onMoveChapter,
  onOpenTocModal,
  onSaveChapters,
  onCloseTocModal,
  onTocImagePick,
  onExtractList,
  onToggleAllToc,
  onToggleTocOption,
  onAddSelected,
}: Props) {
  const [activeSubject, setActiveSubject] = React.useState(profile.subjects[0] ?? '');
  const [editingKey, setEditingKey] = React.useState('');
  const [editingValue, setEditingValue] = React.useState('');
  const [newSubject, setNewSubject] = React.useState('');
  const [moveChapter, setMoveChapter] = React.useState('');
  const [moveTargetSubject, setMoveTargetSubject] = React.useState('');

  React.useEffect(() => {
    if (!profile.subjects.includes(activeSubject)) {
      setActiveSubject(profile.subjects[0] ?? '');
    }
  }, [profile.subjects, activeSubject]);

  React.useEffect(() => {
    setEditingKey('');
    setEditingValue('');
  }, [activeSubject]);

  const chapterItems = chaptersBySubject[activeSubject] ?? [];
  const moveTargetOptions = profile.subjects.filter((subject) => subject !== activeSubject);

  React.useEffect(() => {
    if (!moveChapter || !chapterItems.includes(moveChapter)) {
      setMoveChapter(chapterItems[0] ?? '');
    }
  }, [chapterItems, moveChapter]);

  React.useEffect(() => {
    if (!moveTargetSubject || !moveTargetOptions.includes(moveTargetSubject)) {
      setMoveTargetSubject(moveTargetOptions[0] ?? '');
    }
  }, [moveTargetOptions, moveTargetSubject]);

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-sm font-semibold text-heading">Subject Chapters</p>
          {loadingChapters ? <span className="text-xs text-slate-500">Loading...</span> : null}
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {profile.subjects.map((subject) => (
            <div
              key={subject}
              className={`rounded-full px-2 py-1 text-xs font-semibold border transition-colors inline-flex items-center gap-1 ${
                activeSubject === subject
                  ? 'border-teal/60 bg-teal/15 text-teal'
                  : 'border-main text-slate-400'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveSubject(subject)}
                className="px-1"
              >
                {subject}
              </button>
              <button
                type="button"
                onClick={() => onDeleteSubject(subject)}
                disabled={(chaptersBySubject[subject] ?? []).length > 0 || profile.subjects.length <= 1 || deletingSubject === subject}
                className="px-1 text-[11px] font-bold hover:text-red-400 disabled:opacity-40"
                title={
                  profile.subjects.length <= 1
                    ? 'At least one subject is required'
                    : (chaptersBySubject[subject] ?? []).length > 0
                      ? 'Remove all chapters first'
                      : 'Delete subject'
                }
              >
                {deletingSubject === subject ? '...' : '×'}
              </button>
            </div>
          ))}
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newSubject}
            onChange={(event) => setNewSubject(event.target.value)}
            className="form-control-ui h-10 rounded-xl flex-1"
            placeholder="Add new subject"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (!newSubject.trim()) return;
                onAddSubject(newSubject.trim());
                setNewSubject('');
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (!newSubject.trim()) return;
              onAddSubject(newSubject.trim());
              setNewSubject('');
            }}
            disabled={!newSubject.trim() || addingSubject}
            className="btn-secondary-ui px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {addingSubject ? 'Adding...' : 'Add Subject'}
          </button>
        </div>

        {activeSubject ? (
          <div className="rounded-xl border border-main p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-heading">{activeSubject}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenTocModal(activeSubject)}
                  disabled={suggestingSubject === activeSubject}
                  className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {suggestingSubject === activeSubject ? 'Processing...' : 'Suggest from TOC'}
                </button>
                <button
                  type="button"
                  onClick={() => onSaveChapters(activeSubject)}
                  disabled={savingSubject === activeSubject}
                  className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {savingSubject === activeSubject ? 'Saving...' : 'Save Chapters'}
                </button>
              </div>
            </div>

            {chapterItems.length === 0 ? (
              <p className="text-xs text-slate-500">No chapters added yet.</p>
            ) : (
              <ul className="space-y-2">
                {chapterItems.map((chapter, index) => (
                  <li key={`${activeSubject}-${chapter}`} className="rounded-lg border border-main px-3 py-2">
                    {editingKey === `${activeSubject}-${chapter}` ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(event) => setEditingValue(event.target.value)}
                          className="form-control-ui h-9 rounded-lg flex-1 text-xs"
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              onRenameChapter(activeSubject, chapter, editingValue);
                              setEditingKey('');
                              setEditingValue('');
                            }
                            if (event.key === 'Escape') {
                              setEditingKey('');
                              setEditingValue('');
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onRenameChapter(activeSubject, chapter, editingValue);
                            setEditingKey('');
                            setEditingValue('');
                          }}
                          className="text-xs font-semibold text-teal hover:underline"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingKey('');
                            setEditingValue('');
                          }}
                          className="text-xs font-semibold text-slate-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          to={`/admin/edukarta/chapter?subject=${encodeURIComponent(activeSubject)}&chapter=${encodeURIComponent(chapter)}`}
                          className="text-xs text-heading hover:text-teal hover:underline"
                        >
                          {index + 1}. {chapter}
                        </Link>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingKey(`${activeSubject}-${chapter}`);
                              setEditingValue(chapter);
                            }}
                            className="text-xs font-semibold text-teal hover:underline"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveChapter(activeSubject, chapter)}
                            className="text-xs font-semibold text-slate-500 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={chapterInputBySubject[activeSubject] ?? ''}
                onChange={(event) => onChapterInputChange(activeSubject, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onAddChapter(activeSubject);
                  }
                }}
                className="form-control-ui h-10 rounded-xl flex-1"
                placeholder={`Add chapter for ${activeSubject}`}
              />
              <button
                type="button"
                onClick={() => onAddChapter(activeSubject)}
                className="btn-secondary-ui px-3 py-2 rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>

            <div className="rounded-lg border border-main p-3 space-y-2">
              <p className="text-xs font-semibold text-heading">Move chapter to another subject</p>
              {chapterItems.length === 0 || moveTargetOptions.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {chapterItems.length === 0
                    ? 'Add at least one chapter to move.'
                    : 'Add another subject to enable moving chapters.'}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                <select
                  value={moveChapter}
                  onChange={(event) => setMoveChapter(event.target.value)}
                  className="form-select-ui h-10 rounded-xl flex-1"
                  disabled={chapterItems.length === 0}
                >
                  {chapterItems.map((chapter) => (
                    <option key={chapter} value={chapter}>{chapter}</option>
                  ))}
                </select>
                <select
                  value={moveTargetSubject}
                  onChange={(event) => setMoveTargetSubject(event.target.value)}
                  className="form-select-ui h-10 rounded-xl w-48"
                  disabled={moveTargetOptions.length === 0}
                >
                  {moveTargetOptions.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!moveChapter || !moveTargetSubject) return;
                    onMoveChapter(activeSubject, moveTargetSubject, moveChapter);
                  }}
                  disabled={!moveChapter || !moveTargetSubject || chapterItems.length === 0 || moveTargetOptions.length === 0}
                  className="btn-secondary-ui px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  Move
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {chapterMessage ? <p className="text-xs text-slate-400 mt-4">{chapterMessage}</p> : null}
      </Card>

      {tocModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md glass rounded-2xl border border-main p-5 space-y-4">
            <p className="text-sm font-semibold text-heading">Upload Table of Contents Image</p>
            <p className="text-xs text-slate-500">
              Subject: <span className="text-heading font-semibold">{tocModalSubject}</span>
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => onTocImagePick(event.target.files?.[0] ?? null)}
              className="form-control-ui w-full h-11 rounded-xl file:mr-3 file:border-0 file:bg-transparent file:text-xs file:font-semibold"
            />
            {tocFileName ? <p className="text-xs text-slate-400">Selected: {tocFileName}</p> : null}
            {tocOptions.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Select chapters and sub-chapters</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onToggleAllToc(true)} className="text-xs text-teal hover:underline">
                      Select all
                    </button>
                    <button type="button" onClick={() => onToggleAllToc(false)} className="text-xs text-slate-400 hover:underline">
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
                        onChange={() => onToggleTocOption(option)}
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
                onClick={onCloseTocModal}
                className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onExtractList}
                disabled={tocExtracting}
                className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {tocExtracting ? 'Extracting...' : 'Extract List'}
              </button>
              {tocOptions.length > 0 ? (
                <button
                  type="button"
                  onClick={onAddSelected}
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
