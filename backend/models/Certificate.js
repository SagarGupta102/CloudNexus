const mongoose = require('mongoose')

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

certificateSchema.index({ learner: 1, course: 1 }, { unique: true })

module.exports = mongoose.model('Certificate', certificateSchema)
