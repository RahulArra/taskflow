import { useState } from 'react'

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  status: 'pending',
}

function taskToForm(task) {
  if (!task) return emptyForm
  const date = new Date(task.dueDate)
  return {
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : '',
    status: task.status,
  }
}

function TaskForm({ task, busy, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => taskToForm(task))
  const [validationError, setValidationError] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submitForm(event) {
    event.preventDefault()
    const title = form.title.trim()
    if (!title) {
      setValidationError('Please enter a task title.')
      return
    }
    if (title.length > 120) {
      setValidationError('Task titles must be 120 characters or fewer.')
      return
    }
    if (form.description.length > 2000) {
      setValidationError('Descriptions must be 2,000 characters or fewer.')
      return
    }

    setValidationError('')
    const saved = await onSubmit({
      ...form,
      title,
      dueDate: form.dueDate || null,
    })
    if (saved && !task) {
      setForm(emptyForm)
      setValidationError('')
    }
  }

  return (
    <form className="task-form" onSubmit={submitForm}>
      <div className="form-heading">
        <span className="form-heading-icon">✳</span>
        <div>
          <p className="eyebrow">{task ? 'MAKE IT JUST RIGHT' : 'ONE STEP AT A TIME'}</p>
          <h2>{task ? 'Edit task' : 'Add a task'}</h2>
        </div>
      </div>
      <p className="form-intro">{task ? 'Update the details below.' : 'Get it out of your head and onto your list.'}</p>

      <label className="field-label" htmlFor="task-form-title">Task name <span>*</span></label>
      <input
        id="task-form-title"
        className="form-input"
        name="title"
        value={form.title}
        onChange={updateField}
        placeholder="e.g. Plan the week ahead"
        maxLength={120}
        required
      />

      <label className="field-label" htmlFor="task-description">Description <span className="optional">(optional)</span></label>
      <textarea
        id="task-description"
        className="form-input form-textarea"
        name="description"
        value={form.description}
        onChange={updateField}
        placeholder="Add a few helpful details..."
        maxLength={2000}
        rows={3}
      />

      <div className="form-two-columns">
        <div>
          <label className="field-label" htmlFor="task-priority">Priority</label>
          <select id="task-priority" className="form-input" name="priority" value={form.priority} onChange={updateField}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="task-due-date">Due date</label>
          <input id="task-due-date" className="form-input date-input" type="date" name="dueDate" value={form.dueDate} onChange={updateField} />
        </div>
      </div>

      {task && (
        <>
          <label className="field-label" htmlFor="task-status">Status</label>
          <select id="task-status" className="form-input" name="status" value={form.status} onChange={updateField}>
            <option value="pending">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </>
      )}

      {validationError && <p className="form-error" role="alert">{validationError}</p>}

      <button className="primary-button form-submit" type="submit" disabled={busy}>
        {busy ? <><span className="button-spinner" /> Saving...</> : task ? 'Save changes' : <><span>Create task</span><span>→</span></>}
      </button>
      {task && <button className="cancel-button" type="button" onClick={onCancel} disabled={busy}>Cancel editing</button>}
    </form>
  )
}

export default TaskForm
