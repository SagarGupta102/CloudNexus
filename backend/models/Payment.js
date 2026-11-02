const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true
    },
    razorpayPaymentId: {
      type: String,
      default: null
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

paymentSchema.index({ learner: 1, course: 1 })
paymentSchema.index(
  { razorpayPaymentId: 1 },
  {
    name: 'razorpayPaymentId_unique_non_null',
    unique: true,
    partialFilterExpression: {
      razorpayPaymentId: { $type: 'string' }
    }
  }
)

paymentSchema.statics.ensurePaymentIndexes = async function ensurePaymentIndexes() {
  const indexes = await this.collection.listIndexes().toArray()
  const legacyIndexes = indexes.filter((index) => (
    index.name !== 'razorpayPaymentId_unique_non_null' &&
    index.key?.razorpayPaymentId === 1 &&
    index.unique === true
  ))

  for (const index of legacyIndexes) {
    await this.collection.dropIndex(index.name)
    console.log(`Removed legacy payment index: ${index.name}`)
  }

  const currentIndexes = await this.collection.listIndexes().toArray()
  const hasPaymentIdIndex = currentIndexes.some(
    (index) => index.name === 'razorpayPaymentId_unique_non_null'
  )

  if (!hasPaymentIdIndex) {
    await this.collection.createIndex(
      { razorpayPaymentId: 1 },
      {
        name: 'razorpayPaymentId_unique_non_null',
        unique: true,
        partialFilterExpression: {
          razorpayPaymentId: { $type: 'string' }
        }
      }
    )
    console.log('Created partial unique payment ID index.')
  }
}

module.exports = mongoose.model('Payment', paymentSchema)