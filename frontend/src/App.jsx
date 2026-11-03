import { useEffect, useMemo, useState } from 'react'
import { createTask, deleteTask, getTask, getTasks, updateTask } from './services/tasks'
import TaskCard from './components/TaskCard'
import TaskDetails from './components/TaskDetails'
import TaskForm from './components/TaskForm'
import './App.css'

function Icon({ name, size = 20 }) {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [formBusy, setFormBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [detailsTask, setDetailsTask] = useState(null)
  const [formKey, setFormKey] = useState(0)

  async function refreshTasks() {
    setLoading(true)
    setError('')
    try {
      setTasks(await getTasks())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    getTasks()
      .then((loadedTasks) => {
        if (active) setTasks(loadedTasks)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const counts = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((task) => task.status === 'completed').length,
    pending: tasks.filter((task) => task.status === 'pending').length,
  }), [tasks])

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchesStatus = filter === 'all' || task.status === filter
      const matchesSearch = !query || task.title.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [tasks, filter, search])

  async function handleSave(taskData) {
    setFormBusy(true)
    setError('')
    setSuccess('')
    try {
      if (editingTask) {
        await updateTask(editingTask._id, taskData)
        setSuccess('Your task has been updated.')
      } else {
        await createTask(taskData)
        setSuccess('Your task has been created.')
      }
      setEditingTask(null)
      await refreshTasks()
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setFormBusy(false)
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"? This action cannot be undone.`)) return

    setError('')
    setSuccess('')
    try {
      await deleteTask(task._id)
      setSuccess('Task deleted.')
      if (editingTask?._id === task._id) setEditingTask(null)
      if (detailsTask?._id === task._id) setDetailsTask(null)
      await refreshTasks()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function handleToggle(task) {
    setError('')
    setSuccess('')
    try {
      const updatedTask = await updateTask(task._id, {
        status: task.status === 'completed' ? 'pending' : 'completed',
      })
      setTasks((currentTasks) => currentTasks.map((item) => (
        item._id === updatedTask._id ? updatedTask : item
      )))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function handleViewDetails(task) {
    setError('')
    try {
      setDetailsTask(await getTask(task._id))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function handleEdit(task) {
    setDetailsTask(null)
    setEditingTask(task)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="TaskFlow home">
          <span className="brand-mark"><Icon name="check" size={19} /></span>
          <span>task<span>flow</span></span>
        </a>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#dashboard">
            <Icon name="grid" size={18} />
            <span>Dashboard</span>
          </a>
        </nav>
        <div className="sidebar-note">
          <span className="note-icon"><Icon name="spark" size={17} /></span>
          <strong>A little progress<br />each day adds up.</strong>
          <span>Keep your momentum going.</span>
        </div>
        <div className="sidebar-footer">
          <span className="avatar">TF</span>
          <span><strong>My workspace</strong><small>Personal space</small></span>
          <span className="status-dot" aria-label="Workspace active" />
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <span className="breadcrumb">Workspace <span>/</span> Dashboard</span>
          <span className="today-label">Your personal workspace</span>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">YOUR OVERVIEW</p>
              <h1>Good things take <span>planning.</span></h1>
              <p className="welcome-copy">A clear mind starts with a clear plan. What will you get done today?</p>
            </div>
            <div className="today-badge"><span className="today-sun">✳</span> Make today count</div>
          </section>

          <section className="stats-grid" aria-label="Task summary">
            <article className="stat-card stat-total">
              <div className="stat-top"><span>Total tasks</span><span className="stat-icon"><Icon name="grid" size={17} /></span></div>
              <strong>{counts.total}</strong>
              <span className="stat-caption">Across your workspace</span>
            </article>
            <article className="stat-card stat-pending">
              <div className="stat-top"><span>In progress</span><span className="stat-icon"><span className="pending-icon" /></span></div>
              <strong>{counts.pending}</strong>
              <span className="stat-caption">Ready for your attention</span>
            </article>
            <article className="stat-card stat-completed">
              <div className="stat-top"><span>Completed</span><span className="stat-icon"><Icon name="check" size={17} /></span></div>
              <strong>{counts.completed}</strong>
              <span className="stat-caption">Look at you go</span>
            </article>
          </section>

          {(error || success) && (
            <div className={`feedback ${error ? 'feedback-error' : 'feedback-success'}`} role={error ? 'alert' : 'status'}>
              <span>{error || success}</span>
              <button type="button" className="feedback-close" onClick={() => { setError(''); setSuccess('') }} aria-label="Dismiss message">×</button>
            </div>
          )}

          <div className="workspace-grid">
            <section className="task-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">YOUR WORK</p>
                  <h2>Tasks <span className="task-count">{counts.total}</span></h2>
                </div>
                <button className="primary-button add-task-button" type="button" onClick={() => {
                  setEditingTask(null)
                  setFormKey((currentKey) => currentKey + 1)
                  document.getElementById('task-form-title')?.focus()
                  document.getElementById('task-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}>
                  <Icon name="plus" size={17} /> New task
                </button>
              </div>

              <div className="task-toolbar">
                <div className="filter-tabs" role="group" aria-label="Filter tasks by status">
                  {[
                    ['all', 'All tasks'],
                    ['pending', 'In progress'],
                    ['completed', 'Completed'],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      className={`filter-tab ${filter === value ? 'selected' : ''}`}
                      onClick={() => setFilter(value)}
                      aria-pressed={filter === value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="search-box">
                  <Icon name="search" size={17} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." />
                  {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>}
                </label>
              </div>

              {loading ? (
                <div className="loading-state"><span className="spinner" /> Loading your tasks...</div>
              ) : visibleTasks.length ? (
                <div className="task-list">
                  {visibleTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><Icon name={search || filter !== 'all' ? 'search' : 'check'} size={24} /></div>
                  <h3>{tasks.length ? 'No tasks found' : 'A fresh start'}</h3>
                  <p>{tasks.length ? 'Try another search or status filter.' : 'Add your first task and make a little progress today.'}</p>
                  {!tasks.length && <button type="button" className="text-button" onClick={() => document.getElementById('task-form-title')?.focus()}>Create your first task <span>→</span></button>}
                </div>
              )}
            </section>

            <aside className="form-panel" id="task-form">
              <TaskForm
                key={editingTask?._id || `new-task-${formKey}`}
                task={editingTask}
                busy={formBusy}
                onSubmit={handleSave}
                onCancel={() => setEditingTask(null)}
              />
            </aside>
          </div>
        </div>
        <footer className="page-footer"><span>TaskFlow</span> &nbsp;·&nbsp; Small steps, meaningful progress.</footer>
      </main>

      {detailsTask && (
        <TaskDetails
          task={detailsTask}
          onClose={() => setDetailsTask(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}

export default App
