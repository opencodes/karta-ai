import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, ListTodo, Lock, Repeat, Star, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { createModuleAccessRequest, featureTask, getMyAccess, listMyModuleAccessRequests, listTasks, type TaskItem } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function isInNextHours(dateIso: string, hours: number): boolean {
  const now = Date.now();
  const due = new Date(dateIso).getTime();
  return due >= now && due <= now + hours * 60 * 60 * 1000;
}

function getTaskMeta(item: TaskItem): { date: string; time: string; recurring: string; tags: string[] } {
  return {
    date: item.date,
    time: item.time,
    recurring: item.recurring,
    tags: item.tags,
  };
}

const spotlightTask = {
  title: 'Pay bill every month',
  category: 'Finance',
  date: '2026-03-04',
  time: '20:00',
  recurring: 'monthly',
};

function formatDate(dateStr: string): string {
  const value = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(value.getTime())) return dateStr;
  return value.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function getCategoryStyle(category: TaskItem['category'] | string): string {
  if (category === 'Finance') {
    return 'bg-emerald-300/10 text-emerald-200 border border-emerald-300/30';
  }

  return 'bg-white/5 text-slate-300 border border-white/10';
}

function TaskRow({ item, onToggleFeature }: { item: TaskItem; onToggleFeature: (item: TaskItem) => void }) {
  const meta = getTaskMeta(item);

  return (
    <li className="py-3.5 border-b border-white/5 last:border-b-0">
      <div className="rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_55%),linear-gradient(180deg,rgba(20,28,44,0.95),rgba(10,14,24,0.9))] p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-heading text-sm font-semibold tracking-tight">{item.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${getCategoryStyle(item.category)}`}>
                {item.category}
              </span>
              <span className="rounded-full px-2 py-0.5 text-teal border border-teal/40 bg-teal/10 font-semibold uppercase tracking-wide">
                {meta.recurring}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(meta.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                {meta.time}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-slate-400" />
                Repeats {meta.recurring}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleFeature(item)}
            className={item.featured
              ? 'p-1.5 rounded-md bg-teal/20 text-teal border border-teal/40'
              : 'p-1.5 rounded-md bg-white/5 text-slate-500 border border-white/10 hover:border-teal/40'}
            aria-label={item.featured ? 'Unfeature task' : 'Feature task'}
          >
            <Star className="w-3.5 h-3.5" />
          </button>
        </div>
        {meta.tags.length > 0 ? (
          <p className="text-[11px] text-slate-400 mt-2">Tags: {meta.tags.join(', ')}</p>
        ) : null}
      </div>
    </li>
  );
}

function SpotlightTaskCard() {
  return (
    <Card className="p-5 overflow-hidden">
      <div className="relative rounded-2xl border border-emerald-300/30 bg-[radial-gradient(circle_at_80%_0%,rgba(52,211,153,0.2),transparent_45%),linear-gradient(135deg,rgba(6,18,18,0.95),rgba(6,22,35,0.95))] p-5">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-300/15 blur-2xl" />
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-300/10 px-3 py-1">
            <Wallet className="h-3.5 w-3.5 text-emerald-200" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">Task Spotlight</span>
          </div>
          <h2 className="text-lg font-display font-semibold text-heading">{spotlightTask.title}</h2>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${getCategoryStyle(spotlightTask.category)}`}>
              {spotlightTask.category}
            </span>
            <span className="rounded-full px-2 py-0.5 text-teal border border-teal/40 bg-teal/10 font-semibold uppercase tracking-wide">
              {spotlightTask.recurring}
            </span>
          </div>
          <p className="text-sm text-slate-300">
            {formatDate(spotlightTask.date)} at {spotlightTask.time} • repeats every month
          </p>
        </div>
      </div>
    </Card>
  );
}

export const TodoPage = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [requestState, setRequestState] = useState('');
  const [isRequestPending, setIsRequestPending] = useState(false);

  useEffect(() => {
    async function loadAccess() {
      if (!token) return;

      try {
        if (user?.isRoot || user?.role === 'root') {
          setHasAccess(true);
          return;
        }

        const access = await getMyAccess(token);
        setHasAccess(access.modules.includes('*') || access.modules.includes('todokarta'));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load module access';
        if (message.toLowerCase().includes('unauthorized')) logout();
        setError(message);
      } finally {
        setCheckingAccess(false);
      }
    }

    void loadAccess();
  }, [token, user, logout]);

  useEffect(() => {
    async function loadRequestStatus() {
      if (!token || user?.role !== 'member' || hasAccess) return;
      try {
        const data = await listMyModuleAccessRequests(token);
        const latest = data.requests
          .filter((item) => item.module_name === 'todokarta')
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

  const loadTasks = useCallback(async () => {
    if (!token || !hasAccess) return;
    try {
      const response = await listTasks(token, 'all');
      setTasks(response.tasks);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks';
      if (message.toLowerCase().includes('unauthorized')) logout();
      setError(message);
    }
  }, [token, logout, hasAccess]);

  useEffect(() => {
    if (!hasAccess) return;
    void loadTasks();
  }, [loadTasks, hasAccess]);

  const nowTasks = useMemo(() => tasks.filter((task) => isInNextHours(task.dueDate, 4)), [tasks]);
  const laterTasks = useMemo(() => tasks.filter((task) => !isInNextHours(task.dueDate, 4)), [tasks]);
  const featuredTasks = useMemo(() => tasks.filter((task) => task.featured), [tasks]);

  async function toggleFeature(item: TaskItem) {
    if (!token || !hasAccess) return;
    try {
      await featureTask(token, item.id, !item.featured);
      await loadTasks();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      if (message.toLowerCase().includes('unauthorized')) logout();
      setError(message);
    }
  }

  if (checkingAccess) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-400">Checking module access...</p>
      </Card>
    );
  }

  if (!hasAccess) {
    const canRequest = user?.role === 'member';
    return (
      <Card className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-md">
          <div className="mx-auto w-12 h-12 rounded-full border border-teal/40 bg-teal/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-teal" />
          </div>
          <p className="text-lg font-semibold text-heading">TodoKarta Locked</p>
          <p className="text-sm text-slate-400">Subscribe to access TodoKarta features.</p>
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
                  await createModuleAccessRequest(token, { moduleSlug: 'todokarta' });
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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <ListTodo className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">ToDo</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">Task Buckets</h1>
        <p className="text-sm text-slate-500 mt-1">Tasks created from Karta Workspace appear here with scheduling details.</p>
        {error ? <p className="text-sm text-red-400 mt-3">{error}</p> : null}
      </Card>

      <SpotlightTaskCard />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title={`Now (${nowTasks.length})`}>
          {nowTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No immediate tasks.</p>
          ) : (
            <ul>
              {nowTasks.map((item) => (
                <TaskRow key={item.id} item={item} onToggleFeature={toggleFeature} />
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Later (${laterTasks.length})`}>
          {laterTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming tasks.</p>
          ) : (
            <ul>
              {laterTasks.map((item) => (
                <TaskRow key={item.id} item={item} onToggleFeature={toggleFeature} />
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Featured (${featuredTasks.length})`}>
          {featuredTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No featured items.</p>
          ) : (
            <ul>
              {featuredTasks.map((item) => (
                <li key={item.id} className="py-2.5 border-b border-white/5 last:border-b-0">
                  <p className="text-sm text-heading">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" />
                    {getTaskMeta(item).date} {getTaskMeta(item).time} • {getTaskMeta(item).recurring}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
