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

module.exports = mongoose.model('Certificate', certificateSchema)
