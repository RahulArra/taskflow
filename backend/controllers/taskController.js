import mongoose from 'mongoose'
import Task from '../models/Task.js'
import AppError from '../middleware/AppError.js'

const allowedFields = new Set(['title', 'description', 'status', 'priority', 'dueDate'])
const statuses = new Set(['pending', 'completed'])
const priorities = new Set(['low', 'medium', 'high'])

function validateTaskInput(body, { creating = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'Request body must be a JSON object.')
  }

  const keys = Object.keys(body)
  const unexpectedFields = keys.filter((key) => !allowedFields.has(key))
  if (unexpectedFields.length) {
    throw new AppError(400, `Unexpected field: ${unexpectedFields.join(', ')}.`)
  }
  if (creating && !Object.hasOwn(body, 'title')) {
    throw new AppError(400, 'Task title is required.')
  }
  if (!creating && keys.length === 0) {
    throw new AppError(400, 'Provide at least one task field to update.')
  }

  const taskData = {}
  if (Object.hasOwn(body, 'title')) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw new AppError(400, 'Task title is required.')
    }
    taskData.title = body.title.trim()
  }
  if (Object.hasOwn(body, 'description')) {
    if (typeof body.description !== 'string') {
      throw new AppError(400, 'Description must be a string.')
    }
    taskData.description = body.description.trim()
  }
  if (Object.hasOwn(body, 'status')) {
    if (typeof body.status !== 'string' || !statuses.has(body.status)) {
      throw new AppError(400, 'Status must be either pending or completed.')
    }
    taskData.status = body.status
  }
  if (Object.hasOwn(body, 'priority')) {
    if (typeof body.priority !== 'string' || !priorities.has(body.priority)) {
      throw new AppError(400, 'Priority must be low, medium, or high.')
    }
    taskData.priority = body.priority
  }
  if (Object.hasOwn(body, 'dueDate')) {
    if (body.dueDate === null || body.dueDate === '') {
      taskData.dueDate = null
    } else if (typeof body.dueDate === 'string' && !Number.isNaN(Date.parse(body.dueDate))) {
      taskData.dueDate = new Date(body.dueDate)
    } else {
      throw new AppError(400, 'Due date must be a valid date or null.')
    }
  }

  return taskData
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function listTasks(req, res) {
  const { status, search = '' } = req.query
  if (status !== undefined && status !== 'all' && !statuses.has(status)) {
    throw new AppError(400, 'Status filter must be all, pending, or completed.')
  }
  if (typeof search !== 'string' || search.length > 120) {
    throw new AppError(400, 'Search must be 120 characters or fewer.')
  }

  const filter = {}
  if (status && status !== 'all') filter.status = status
  if (search.trim()) filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' }

  const tasks = await Task.find(filter).sort({ createdAt: -1 })
  res.json(tasks)
}

export async function createTask(req, res) {
  const task = await Task.create(validateTaskInput(req.body, { creating: true }))
  console.info(`Created task ${task.id}.`)
  res.status(201).json(task)
}

export async function getTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Task ID is invalid.')
  }
  const task = await Task.findById(req.params.id)
  if (!task) throw new AppError(404, 'Task not found.')
  res.json(task)
}

export async function updateTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Task ID is invalid.')
  }
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { $set: validateTaskInput(req.body) },
    { returnDocument: 'after', runValidators: true },
  )
  if (!task) throw new AppError(404, 'Task not found.')
  console.info(`Updated task ${task.id}.`)
  res.json(task)
}

export async function deleteTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Task ID is invalid.')
  }
  const task = await Task.findByIdAndDelete(req.params.id)
  if (!task) throw new AppError(404, 'Task not found.')
  console.info(`Deleted task ${task.id}.`)
  res.json({ message: 'Task deleted successfully.', id: task.id })
}
