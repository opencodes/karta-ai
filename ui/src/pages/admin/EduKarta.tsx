import React from 'react';
import { BookOpenCheck } from 'lucide-react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ChapterPage } from '../../modules/edukarta/pages/ChapterPage';
import { Card } from '../../components/ui/Card';
import { EduKartaPage as EduKartaHomePage } from '../../modules/edukarta/pages/EduKartaPage';
import { MyProgressPage } from '../../modules/edukarta/pages/MyProgressPage';

type ProfileSummary = {
  board: string;
  classLevel: string;
};

const EduKartaModuleLayout: React.FC<{ children: React.ReactNode; profileSummary: ProfileSummary | null }> = ({
  children,
  profileSummary,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProgressTab = location.pathname.includes('/admin/edukarta/progress');

  return (
    <div className="space-y-4">
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/edukarta')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-colors ${
              !isProgressTab
                ? 'border-teal/60 bg-teal/15 text-teal'
                : 'border-main text-slate-400 hover:text-heading'
            }`}
          >
            My Study
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/edukarta/progress')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-colors ${
              isProgressTab
                ? 'border-teal/60 bg-teal/15 text-teal'
                : 'border-main text-slate-400 hover:text-heading'
            }`}
          >
            My Progress
          </button>
        </div>
      </Card>

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
};

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
      <Route
        path="/progress"
        element={(
          <EduKartaModuleLayout profileSummary={profileSummary}>
            <MyProgressPage />
          </EduKartaModuleLayout>
        )}
      />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
