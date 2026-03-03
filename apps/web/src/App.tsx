import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { CommandBar } from './components/CommandBar';
import { BrandLogo } from './components/BrandLogo';
import { TaskList } from './components/TaskList';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { inNextHours, parseTask } from './lib';
import type { TaskItem } from './types';
import { useAuth } from './auth/AuthContext';
import { RequireAuth, RequireRole } from './auth/RouteGuards';

const TASKS_STORAGE_KEY = 'karta.tasks.v1';

function HomePage({
  tasks,
  setTasks,
  inputRef,
}: {
  tasks: TaskItem[];
  setTasks: Dispatch<SetStateAction<TaskItem[]>>;
  inputRef: RefObject<HTMLInputElement>;
}) {
  const nowList = useMemo(() => tasks.filter((task) => inNextHours(task.dueDate, 4)), [tasks]);
  const upcomingList = useMemo(() => tasks.filter((task) => !inNextHours(task.dueDate, 4)), [tasks]);

  function handleCreate(rawInput: string) {
    const task = parseTask(rawInput);
    setTasks((current) => [task, ...current]);
  }

  function handleFeature(id: string) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, featured: !task.featured } : task)),
    );
  }

  return (
    <main className="page-wrap">
      <header className="hero">
        <h1>Intent to Execution</h1>
        <p>Give Karta one sentence. It structures the task and schedules action.</p>
      </header>

      <CommandBar onSubmit={handleCreate} inputRef={inputRef} />

      <section className="grid">
        <TaskList title="Now (next 4 hours)" items={nowList} onFeature={handleFeature} />
        <TaskList title="Later (upcoming)" items={upcomingList} onFeature={handleFeature} />
      </section>
    </main>
  );
}

export function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const commandInputRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as TaskItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (!isAuthenticated) return;

    function handleShortcut(event: KeyboardEvent) {
      const isK = event.key.toLowerCase() === 'k';
      if (!isK || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      commandInputRef.current?.focus();
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isAuthenticated]);

  return (
    <div className="app-shell">
      <div className="bg-aurora" />
      <nav className="top-nav">
        <div className="nav-left">
          <BrandLogo />
          {isAuthenticated ? (
            <div className="nav-links">
              <NavLink to="/" end>
                Workspace
              </NavLink>
              <NavLink to="/admin">Admin</NavLink>
            </div>
          ) : null}
        </div>
        <div className="nav-right">
          {isAuthenticated && user ? (
            <>
              <span className="user-pill">
                {user.email} ({user.role})
              </span>
              <button type="button" className="btn-secondary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage tasks={tasks} setTasks={setTasks} inputRef={commandInputRef} />} />
          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin" element={<AdminPage tasks={tasks} />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  );
}
