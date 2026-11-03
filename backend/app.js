import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import taskRoutes from './routes/taskRoutes.js'
import { appVersion } from './config/version.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

const allowedOrigin = process.env.FRONTEND_ORIGIN
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined))
app.use(express.json({ limit: '20kb' }))

app.get('/health', (req, res) => {
  const database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  const healthy = database === 'connected'
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'unavailable',
    database,
  })
})

app.get('/version', (req, res) => {
  res.json({ version: appVersion })
})

app.use('/api/tasks', taskRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
