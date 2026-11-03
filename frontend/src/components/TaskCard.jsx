function formatDueDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function TaskCard({ task, onToggle, onEdit, onDelete, onDetails }) {
  const dueDate = formatDueDate(task.dueDate)

  return (
    <article className={`task-card ${task.status === 'completed' ? 'task-complete' : ''}`}>
      <button
        type="button"
        className={`task-check ${task.status === 'completed' ? 'checked' : ''}`}
        onClick={() => onToggle(task)}
        aria-label={task.status === 'completed' ? `Mark ${task.title} as in progress` : `Mark ${task.title} as completed`}
        title={task.status === 'completed' ? 'Mark as in progress' : 'Mark as completed'}
      >
        {task.status === 'completed' && <span>✓</span>}
      </button>
      <div className="task-main">
        <button type="button" className="task-title" onClick={() => onDetails(task)}>{task.title}</button>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`priority-pill priority-${task.priority}`}><span />{task.priority} priority</span>
          {dueDate && <span className="due-date"><svg aria-hidden="true" viewBox="0 0 16 16"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" /><path d="M5 2v3M11 2v3M3 6.5h10" /></svg>{dueDate}</span>}
          <span className={`status-label ${task.status}`}>{task.status === 'completed' ? 'Completed' : 'In progress'}</span>
        </div>
      </div>
      <div className="task-actions">
        <button type="button" onClick={() => onDetails(task)} aria-label={`View ${task.title} details`} title="View details">
          <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" /><path d="M10 9v4M10 6.5h.01" /></svg>
        </button>
        <button type="button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`} title="Edit task">
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m12.8 4.2 3 3M4 16l3.6-.7L16 6.9a1.8 1.8 0 0 0-2.5-2.5L5.1 12.8 4 16Z" /></svg>
        </button>
        <button type="button" className="delete-action" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`} title="Delete task">
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4.5 6h11M8 6V4h4v2m2.5 0-.7 10H6.2L5.5 6m2.8 3v4m3.4-4v4" /></svg>
        </button>
      </div>
    </article>
  )
}

export default TaskCard
