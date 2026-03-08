import React from 'react';
import { BookOpenCheck, Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

type Props = {
  step: number;
  totalSteps: number;
  progress: number;
  name: string;
  board: string;
  classLevel: string;
  subjects: string[];
  customSubject: string;
  boardOptions: string[];
  classOptions: string[];
  suggestions: string[];
  savingProfile: boolean;
  canContinue: boolean;
  canFinish: boolean;
  onNameChange: (value: string) => void;
  onBoardSelect: (value: string) => void;
  onClassChange: (value: string) => void;
  onToggleSubject: (value: string) => void;
  onApplySmartSuggestions: () => void;
  onCustomSubjectChange: (value: string) => void;
  onAddCustomSubject: () => void;
  onStepBack: () => void;
  onStepNext: () => void;
  onFinish: () => void;
};

export function OnboardingSection({
  step,
  totalSteps,
  progress,
  name,
  board,
  classLevel,
  subjects,
  customSubject,
  boardOptions,
  classOptions,
  suggestions,
  savingProfile,
  canContinue,
  canFinish,
  onNameChange,
  onBoardSelect,
  onClassChange,
  onToggleSubject,
  onApplySmartSuggestions,
  onCustomSubjectChange,
  onAddCustomSubject,
  onStepBack,
  onStepNext,
  onFinish,
}: Props) {
  return (
    <div className="space-y-5">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-teal" />
            <p className="text-sm font-semibold text-heading">EduKarta Student Onboarding</p>
          </div>
          <span className="text-xs text-slate-500">Step {step} of {totalSteps}</span>
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
              onChange={(event) => onNameChange(event.target.value)}
              className="form-control-ui w-full h-11 rounded-xl"
              placeholder="Enter full name"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-heading">Choose education board</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {boardOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onBoardSelect(option)}
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
              onChange={(event) => onClassChange(event.target.value)}
              className="form-select-ui w-full h-11 rounded-xl"
            >
              <option value="">Select class</option>
              {classOptions.map((item) => (
                <option key={item} value={item}>Class {item}</option>
              ))}
            </select>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-heading">Choose subjects</p>
              <button type="button" onClick={onApplySmartSuggestions} className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Auto suggest
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => onToggleSubject(subject)}
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
                onChange={(event) => onCustomSubjectChange(event.target.value)}
                className="form-control-ui h-10 rounded-xl flex-1"
                placeholder="Add custom subject"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onAddCustomSubject();
                  }
                }}
              />
              <button type="button" onClick={onAddCustomSubject} className="btn-secondary-ui px-3 py-2 rounded-lg text-xs font-semibold">
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
            onClick={onStepBack}
            disabled={step === 1}
            className="btn-secondary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            Back
          </button>
          {step < totalSteps ? (
            <button
              type="button"
              onClick={onStepNext}
              disabled={!canContinue}
              className="btn-primary-ui px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinish}
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
