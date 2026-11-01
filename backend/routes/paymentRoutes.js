
const express = require('express')
const crypto = require('crypto')
const Razorpay = require('razorpay')

const Course = require('../models/Course')
const Payment = require('../models/Payment')
const Enrollment = require('../models/Enrollment')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay environment variables are missing.')
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  })
}

// Create a Razorpay order for a published premium course.
router.post(
  '/create-order',
  requireAuth,
  requireRole('student'),
  async (req, res) => {
    try {
      const { courseSlug } = req.body

      if (!courseSlug) {
        return res.status(400).json({
          success: false,
          message: 'Course slug is required.'
        })
      }

      const course = await Course.findOne({
        slug: courseSlug,
        isPublished: true,
        isPremium: true
      })

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Published premium course not found.'
        })
      }

      const existingEnrollment = await Enrollment.findOne({
        learner: req.user._id,
        course: course._id
      })

      if (existingEnrollment?.paymentStatus === 'paid') {
        return res.status(409).json({
          success: false,
          message: 'You already have access to this course.'
        })
      }

      const amount = Math.round(course.price * 100)

      if (!Number.isSafeInteger(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'This course has an invalid price.'
        })
      }

      const razorpay = getRazorpayInstance()

      const order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `course_${course._id}_${Date.now()}`,
        notes: {
          learnerId: String(req.user._id),
          courseId: String(course._id)
        }
      })

      await Payment.create({
        learner: req.user._id,
        course: course._id,
        razorpayOrderId: order.id,
        amount,
        currency: 'INR',
        status: 'pending'
      })

      return res.status(201).json({
        success: true,
        message: 'Payment order created successfully.',
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency
        },
        course: {
          title: course.title,
          price: course.price
        },
        keyId: process.env.RAZORPAY_KEY_ID
      })
    } catch (error) {
      console.error('Create payment order error:', error.message)

      return res.status(500).json({
        success: false,
        message: 'Unable to create payment order.'
      })
    }
  }
)

// Verify payment and enroll the student only after capture is confirmed.
router.post(
  '/verify',
  requireAuth,
  requireRole('student'),
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification details are incomplete.'
        })
      }

      const paymentRecord = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
        learner: req.user._id
      })

      if (!paymentRecord) {
        return res.status(404).json({
          success: false,
          message: 'Payment order not found for this account.'
        })
      }

      if (paymentRecord.status === 'verified') {
        return res.json({
          success: true,
          message: 'Payment was already verified. Course access is active.'
        })
      }

      const secret = process.env.RAZORPAY_KEY_SECRET

      if (!secret) {
        throw new Error('Razorpay secret is missing.')
      }

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      const received = Buffer.from(razorpay_signature, 'utf8')
      const expected = Buffer.from(expectedSignature, 'utf8')

      if (
        received.length !== expected.length ||
        !crypto.timingSafeEqual(received, expected)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Payment signature verification failed.'
        })
      }

      // Confirm the payment details directly with Razorpay.
      const razorpay = getRazorpayInstance()
      const razorpayPayment = await razorpay.payments.fetch(
        razorpay_payment_id
      )

      if (
        razorpayPayment.order_id !== razorpay_order_id ||
        razorpayPayment.amount !== paymentRecord.amount ||
        razorpayPayment.currency !== paymentRecord.currency ||
        razorpayPayment.status !== 'captured'
      ) {
        return res.status(400).json({
          success: false,
          message: 'Payment has not been successfully captured.'
        })
      }

      const course = await Course.findById(paymentRecord.course)

      if (!course || !course.isPublished || !course.isPremium) {
        return res.status(400).json({
          success: false,
          message: 'This course is no longer available for purchase.'
        })
      }

      // Update or create the enrollment without duplicating it.
      await Enrollment.findOneAndUpdate(
        {
          learner: req.user._id,
          course: course._id
        },
        {
          $set: {
            paymentStatus: 'paid',
            lastActivityAt: new Date()
          },
          $setOnInsert: {
            learner: req.user._id,
            course: course._id
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      )

      paymentRecord.razorpayPaymentId = razorpay_payment_id
      paymentRecord.status = 'verified'
      paymentRecord.verifiedAt = new Date()
      await paymentRecord.save()

      return res.json({
        success: true,
        message: 'Payment verified. You are now enrolled in the course.'
      })
    } catch (error) {
      console.error('Payment verification error:', error.message)

      return res.status(500).json({
        success: false,
        message: 'Unable to verify payment. Please contact support if money was deducted.'
      })
    }
  }
)

module.exports = router
