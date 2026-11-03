function formatTimestamp(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function TaskDetails({ task, onClose, onEdit }) {
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section className="details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close task details">×</button>
        <p className="eyebrow">TASK DETAILS</p>
        <h2 id="details-title">{task.title}</h2>
        <div className="details-badges">
          <span className={`priority-pill priority-${task.priority}`}><span />{task.priority} priority</span>
          <span className={`status-label ${task.status}`}>{task.status === 'completed' ? 'Completed' : 'In progress'}</span>
        </div>
        <div className="details-description">
          <span>Description</span>
          <p>{task.description || 'No description added.'}</p>
        </div>
        <dl className="details-timestamps">
          <div><dt>Due date</dt><dd>{task.dueDate ? formatTimestamp(task.dueDate).split(',')[0] : 'No due date'}</dd></div>
          <div><dt>Created</dt><dd>{formatTimestamp(task.createdAt)}</dd></div>
          <div><dt>Last updated</dt><dd>{formatTimestamp(task.updatedAt)}</dd></div>
        </dl>
        <button type="button" className="primary-button details-edit" onClick={() => onEdit(task)}>Edit task <span>→</span></button>
      </section>
    </div>
  )
}

export default TaskDetails
