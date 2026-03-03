import type { TaskItem } from '../types';

type AdminPageProps = {
  tasks: TaskItem[];
};

export function AdminPage({ tasks }: AdminPageProps) {
  const featured = tasks.filter((task) => task.featured);

  return (
    <main className="page-wrap">
      <header className="hero compact">
        <h1>Admin</h1>
        <p>History of featured items and curation controls.</p>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2>Featured History</h2>
          <span>{featured.length} items</span>
        </div>

        {featured.length === 0 ? (
          <p className="empty">No featured tasks yet.</p>
        ) : (
          <ul className="task-list">
            {featured.map((task) => (
              <li key={task.id} className="task-row">
                <div>
                  <p className="task-title">{task.title}</p>
                  <p className="task-meta">
                    {task.category} • {new Date(task.dueDate).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
