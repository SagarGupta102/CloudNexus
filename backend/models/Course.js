const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    thumbnailUrl: { type: String, default: '' },
    thumbnailMedia: {
      secureUrl: { type: String, default: '' },
      publicId: { type: String, default: '' },
      resourceType: { type: String, default: 'image' },
      format: { type: String, default: '' },
      bytes: { type: Number, default: 0 }
    },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },
    price: { type: Number, min: 0, default: 0 },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Course', courseSchema)
