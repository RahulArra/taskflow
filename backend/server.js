import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/db.js'

const port = Number(process.env.PORT || 5000)
const host = '0.0.0.0'

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be a valid TCP port between 1 and 65535.')
  process.exit(1)
}

try {
  await connectDatabase()
  const server = app.listen(port, host, () => {
    console.info(`TaskFlow API listening on ${host}:${port}.`)
  })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      console.info(`${signal} received. Shutting down TaskFlow API.`)
      server.close(async () => {
        const mongoose = await import('mongoose')
        await mongoose.default.disconnect()
        process.exit(0)
      })
    })
  }
} catch (error) {
  console.error('Unable to start TaskFlow API:', error.message)
  process.exit(1)
}
