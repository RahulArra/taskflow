import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required.'],
    trim: true,
    maxlength: [120, 'Task title must be 120 characters or fewer.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description must be 2,000 characters or fewer.'],
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  versionKey: false,
})

export default mongoose.model('Task', taskSchema)
