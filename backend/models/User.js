const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    password: { type: String, select: false },
    role: { type: String, enum: ['student', 'learner', 'instructor', 'admin'], default: 'student' },
    interests: [{ type: String, trim: true }]
  },
  { timestamps: true }
)

userSchema.pre('validate', async function validatePasswordFields() {
  if (this.passwordHash || this.password) return

  if (!this.isNew && !this.isModified('passwordHash') && !this.isModified('password')) {
    const existing = await this.constructor
      .findById(this._id)
      .select('+passwordHash +password')
      .lean()

    if (existing?.passwordHash || existing?.password) return
  }

  throw new Error('User must have at least one supported password field.')
})

module.exports = mongoose.model('User', userSchema)
