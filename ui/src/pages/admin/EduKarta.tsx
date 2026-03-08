import React from 'react';
import { BookOpenCheck } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ChapterPage } from '../../modules/edukarta/pages/ChapterPage';
import { Card } from '../../components/ui/Card';
import { EduKartaPage as EduKartaHomePage } from '../../modules/edukarta/pages/EduKartaPage';

type ProfileSummary = {
  board: string;
  classLevel: string;
};

const EduKartaModuleLayout: React.FC<{ children: React.ReactNode; profileSummary: ProfileSummary | null }> = ({
  children,
  profileSummary,
}) => (
  <div className="space-y-4">
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <BookOpenCheck className="w-4 h-4 text-teal" />
        <p className="text-sm font-semibold text-heading">EduKarta Module</p>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {profileSummary
          ? `${profileSummary.board} • Class ${profileSummary.classLevel}`
          : 'Student onboarding, subject mapping, and chapter planning.'}
      </p>
    </Card>
    {children}
  </div>
);

export function EduKartaPage() {
  const [profileSummary, setProfileSummary] = React.useState<ProfileSummary | null>(null);

  return (
    <Routes>
      <Route
        path="/"
        element={(
          <EduKartaModuleLayout profileSummary={profileSummary}>
            <EduKartaHomePage onProfileSummaryChange={setProfileSummary} />
          </EduKartaModuleLayout>
        )}
      />
      <Route
        path="/chapter"
        element={(
          <EduKartaModuleLayout profileSummary={profileSummary}>
            <ChapterPage />
          </EduKartaModuleLayout>
        )}
      />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
