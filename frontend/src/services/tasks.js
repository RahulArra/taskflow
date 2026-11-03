const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Unable to connect to TaskFlow. Check that the backend is running and try again.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}.`)
  }
  return data
}

export async function getTasks() {
  return request('/tasks')
}

export async function getTask(id) {
  return request(`/tasks/${encodeURIComponent(id)}`)
}

export async function createTask(task) {
  return request('/tasks', { method: 'POST', body: JSON.stringify(task) })
}

export async function updateTask(id, task) {
  return request(`/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(task) })
}

export async function deleteTask(id) {
  return request(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
