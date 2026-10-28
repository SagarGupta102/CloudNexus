const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    course: {
      type: String,
      required: true,
      default: 'Cloud Computing'
    },

    description: {
      type: String,
      required: true
    },

    order: {
      type: Number,
      required: true,
      min: 1
    },

    durationMinutes: {
      type: Number,
      default: 10,
      min: 1
    },

    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },

    content: {
  type: String,
  default: ''
},

sections: [
  {
    heading: {
      type: String,
      required: true,
      trim: true
    },

    body: {
      type: String,
      required: true,
      trim: true
    },

    example: {
      type: String,
      default: '',
      trim: true
    }
  }
],

videoUrl: {
  type: String,
  default: ''
},

media: {
  secureUrl: { type: String, default: '' },
  publicId: { type: String, default: '' },
  resourceType: { type: String, default: '' },
  format: { type: String, default: '' },
  bytes: { type: Number, default: 0 }
},

isPublished: {
  type: Boolean,
  default: true
},
quiz: {
  passingPercentage: { type: Number, default: 70, min: 1, max: 100 },
  questions: [{
    question: { type: String, trim: true },
    options: [{ type: String, trim: true }],
    correctOption: { type: Number, min: 0 },
    explanation: { type: String, default: '' }
  }]
}
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Lesson', lessonSchema)