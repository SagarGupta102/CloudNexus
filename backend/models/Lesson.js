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

isPublished: {
  type: Boolean,
  default: true
}
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Lesson', lessonSchema)