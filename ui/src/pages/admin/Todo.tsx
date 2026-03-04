import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock3, ListTodo, Star } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { featureTask, listTasks, type TaskItem } from '../../lib/api';
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

function TaskRow({ item, onToggleFeature }: { item: TaskItem; onToggleFeature: (item: TaskItem) => void }) {
  const meta = getTaskMeta(item);

  return (
    <li className="py-3 border-b border-white/5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-heading text-sm font-medium">{item.title}</p>
          <p className="text-xs text-slate-500 mt-1">
            {item.category} • {meta.date} • {meta.time} • {meta.recurring}
          </p>
          {meta.tags.length > 0 ? (
            <p className="text-[11px] text-slate-500 mt-1">Tags: {meta.tags.join(', ')}</p>
          ) : null}
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
    </li>
  );
}

export const TodoPage = () => {
  const { token, logout } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    if (!token) return;
    try {
      const response = await listTasks(token, 'all');
      setTasks(response.tasks);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks';
      if (message.toLowerCase().includes('unauthorized')) logout();
      setError(message);
    }
  }, [token, logout]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const nowTasks = useMemo(() => tasks.filter((task) => isInNextHours(task.dueDate, 4)), [tasks]);
  const laterTasks = useMemo(() => tasks.filter((task) => !isInNextHours(task.dueDate, 4)), [tasks]);
  const featuredTasks = useMemo(() => tasks.filter((task) => task.featured), [tasks]);

  async function toggleFeature(item: TaskItem) {
    if (!token) return;
    try {
      await featureTask(token, item.id, !item.featured);
      await loadTasks();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      if (message.toLowerCase().includes('unauthorized')) logout();
      setError(message);
    }
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
