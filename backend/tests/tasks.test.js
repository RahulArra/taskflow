import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import mongoose from 'mongoose'
import app from '../app.js'

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow_test'
let server
let baseUrl

before(async () => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  await mongoose.connection.dropDatabase()
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  })
  const body = await response.json()
  return { response, body }
}

test('creates a task, lists it, and filters by status and title', async () => {
  const created = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Prepare interview notes',
      description: 'Review the project',
      priority: 'high',
      dueDate: '2026-11-05',
    }),
  })

  assert.equal(created.response.status, 201)
  assert.equal(created.body.title, 'Prepare interview notes')
  assert.equal(created.body.status, 'pending')
  assert.ok(created.body.createdAt)
  assert.ok(created.body.updatedAt)

  const allTasks = await request('/api/tasks')
  assert.equal(allTasks.response.status, 200)
  assert.equal(allTasks.body.length, 1)

  const matchingTasks = await request('/api/tasks?status=pending&search=interview')
  assert.equal(matchingTasks.body.length, 1)

  const noMatches = await request('/api/tasks?search=not-there')
  assert.equal(noMatches.body.length, 0)
})

test('gets, updates, and deletes a task', async () => {
  const created = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title: 'Write tests' }),
  })

  const fetched = await request(`/api/tasks/${created.body._id}`)
  assert.equal(fetched.response.status, 200)
  assert.equal(fetched.body.title, 'Write tests')

  const updated = await request(`/api/tasks/${created.body._id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'completed', priority: 'low' }),
  })
  assert.equal(updated.response.status, 200)
  assert.equal(updated.body.status, 'completed')
  assert.equal(updated.body.priority, 'low')

  const removed = await request(`/api/tasks/${created.body._id}`, { method: 'DELETE' })
  assert.equal(removed.response.status, 200)
  assert.equal(removed.body.id, created.body._id)

  const missing = await request(`/api/tasks/${created.body._id}`)
  assert.equal(missing.response.status, 404)
})

test('rejects invalid input and malformed task IDs', async () => {
  const missingTitle = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title: '   ' }),
  })
  assert.equal(missingTitle.response.status, 400)

  const badPriority = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title: 'Valid title', priority: 'urgent' }),
  })
  assert.equal(badPriority.response.status, 400)

  const invalidId = await request('/api/tasks/not-an-id')
  assert.equal(invalidId.response.status, 400)
})

test('reports health and application version', async () => {
  const health = await request('/health')
  assert.equal(health.response.status, 200)
  assert.deepEqual(health.body, { status: 'ok', database: 'connected' })

  const version = await request('/version')
  assert.equal(version.response.status, 200)
  assert.equal(version.body.version, '1.0.0')
})
