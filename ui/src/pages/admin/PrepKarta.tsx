import React, { useEffect, useState } from 'react';
import { Brain, Lock } from 'lucide-react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { createModuleAccessRequest, listMyModuleAccessRequests } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ManagePrepKartaPage } from '../../modules/prepkarta/pages/ManagePrepKartaPage';
import { SubjectCardsPage } from '../../modules/prepkarta/pages/SubjectCardsPage';
import { ConceptListPage } from '../../modules/prepkarta/pages/ConceptListPage';
import { ConceptModesPage } from '../../modules/prepkarta/pages/ConceptModesPage';
import { PracticePage } from '../../modules/prepkarta/pages/PracticePage';
import { ReviewPage } from '../../modules/prepkarta/pages/ReviewPage';
import { AnalyticsPage } from '../../modules/prepkarta/pages/AnalyticsPage';

function ConceptListRoute({ token }: { token: string }) {
  const params = useParams<{ subjectId: string }>();
  if (!params.subjectId) return null;
  return <ConceptListPage token={token} subjectId={params.subjectId} />;
}

function SubjectManageRoute({ token }: { token: string }) {
  const params = useParams<{ subjectId: string }>();
  if (!params.subjectId) return null;
  return <ManagePrepKartaPage token={token} subjectId={params.subjectId} />;
}

function ConceptModesRoute({ token }: { token: string }) {
  const params = useParams<{ conceptId: string }>();
  if (!params.conceptId) return null;
  return <ConceptModesPage token={token} conceptId={params.conceptId} />;
}

function PracticeRoute({ token }: { token: string }) {
  const params = useParams<{ conceptId: string }>();
  if (!params.conceptId) return null;
  return <PracticePage token={token} conceptId={params.conceptId} />;
}

export function PrepKartaPage() {
  const { token, user, refreshRbac, logout } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');
  const [requestState, setRequestState] = useState('');
  const [isRequestPending, setIsRequestPending] = useState(false);

  useEffect(() => {
    async function loadAccess() {
      try {
        if (user?.isRoot || user?.role === 'root') {
          setHasAccess(true);
          return;
        }
        const snapshot = await refreshRbac();
        const modules = snapshot?.modules ?? [];
        setHasAccess(modules.includes('*') || modules.includes('prepkarta'));
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
          .filter((item) => item.module_name === 'prepkarta')
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
          <p className="text-lg font-semibold text-heading">PrepKarta Locked</p>
          <p className="text-sm text-slate-400">Subscribe to access PrepKarta features.</p>
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
                  await createModuleAccessRequest(token, { moduleSlug: 'prepkarta' });
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

  if (!token) {
    return <Card className="p-6"><p className="text-sm text-slate-500">Token missing. Please login again.</p></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-teal" />
          <p className="text-sm font-semibold text-heading">PrepKarta - Micro Practice Interview Engine</p>
        </div>
      </Card>

      <Routes>
        <Route path="/" element={<SubjectCardsPage token={token} />} />
        <Route path="/subject/:subjectId" element={<SubjectManageRoute token={token} />} />
        <Route path="/analytics" element={<AnalyticsPage token={token} />} />
        <Route path="/concept/:conceptId" element={<ConceptModesRoute token={token} />} />
        <Route path="/practice/:conceptId" element={<PracticeRoute token={token} />} />
        <Route path="/review/:attemptId" element={<ReviewPage />} />
        <Route path="/:subjectId" element={<ConceptListRoute token={token} />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </div>
  );
}
