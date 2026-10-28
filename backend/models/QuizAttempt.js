const mongoose = require('mongoose')

const quizAttemptSchema = new mongoose.Schema(
  {
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    passed: { type: Boolean, required: true },
    answers: [{ type: Number }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema)
