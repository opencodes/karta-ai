import type { TaskItem } from '../types';

type TaskListProps = {
  title: string;
  items: TaskItem[];
  onFeature: (id: string) => void;
};

export function TaskList({ title, items, onFeature }: TaskListProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <span>{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <p className="empty">No tasks here yet.</p>
      ) : (
        <ul className="task-list">
          {items.map((task) => (
            <li key={task.id} className="task-row">
              <div>
                <p className="task-title">{task.title}</p>
                <p className="task-meta">
                  {task.category} • {new Date(task.dueDate).toLocaleString()}
                </p>
              </div>
              <button
                className={task.featured ? 'btn-secondary' : 'btn-primary'}
                onClick={() => onFeature(task.id)}
                type="button"
              >
                {task.featured ? 'Featured' : 'Feature'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
