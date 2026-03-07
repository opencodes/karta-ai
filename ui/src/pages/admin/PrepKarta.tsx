import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Lock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { createModuleAccessRequest, listMyModuleAccessRequests } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function PrepKartaPage() {
  const { token, user, hasModule, refreshRbac, logout } = useAuth();
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
        setHasAccess(modules.includes('*') || modules.includes('prepkarta') || hasModule('prepkarta'));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load access';
        if (message.toLowerCase().includes('unauthorized')) logout();
        setError(message);
      }
    }

    void loadAccess();
  }, [user, logout, refreshRbac, hasModule]);

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
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal text-black hover:bg-teal/90 w-fit disabled:opacity-50"
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
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-slate-200 hover:bg-white/20 w-fit disabled:opacity-50"
            >
              {isRequestPending ? 'Request Pending' : 'Request Access'}
            </button>
          ) : null}
          {requestState ? <p className="text-xs text-slate-400">{requestState}</p> : null}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-2">
      <div className="flex items-center gap-2"><Brain className="w-4 h-4 text-teal" /><p className="text-sm font-semibold text-heading">PrepKarta</p></div>
      <p className="text-sm text-slate-400">PrepKarta module is active for your account.</p>
    </Card>
  );
}
