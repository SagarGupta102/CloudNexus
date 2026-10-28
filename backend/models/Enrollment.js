const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema(
  {
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    completedAt: Date,
    paymentStatus: { type: String, enum: ['free', 'paid', 'pending'], default: 'free' },
    lastActivityAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

enrollmentSchema.index({ learner: 1, course: 1 }, { unique: true })
module.exports = mongoose.model('Enrollment', enrollmentSchema)
