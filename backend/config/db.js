import mongoose from 'mongoose'

export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    throw new Error('MONGO_URI is required. Add it to backend/.env before starting the API.')
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection lost. Mongoose will attempt to reconnect.')
  })
  mongoose.connection.on('reconnected', () => {
    console.info('MongoDB connection restored.')
  })

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  console.info('Connected to MongoDB.')
}
