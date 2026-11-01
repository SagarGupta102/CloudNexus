
const express = require('express')
const mongoose = require('mongoose')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Enrollment = require('../models/Enrollment')
const { optionalAuth, requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

// Hide correct answers from public course responses.
function sanitizeLesson(lesson) {
  const safeLesson =
    typeof lesson.toObject === 'function'
      ? lesson.toObject()
      : { ...lesson }

  if (safeLesson.quiz?.questions) {
    safeLesson.quiz = {
      passingPercentage: safeLesson.quiz.passingPercentage,
      questions: safeLesson.quiz.questions.map((question) => ({
        _id: question._id,
        question: question.question,
        options: question.options
      }))
    }
  }

  return safeLesson
}

// Public: list published courses.
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean()

    const lessonCounts = await Lesson.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$course', count: { $sum: 1 } } }
    ])

    const counts = Object.fromEntries(
      lessonCounts.map((item) => [item._id, item.count])
    )

    res.json({
      success: true,
      courses: courses.map((course) => ({
        ...course,
        lessonCount: counts[course.title] || 0
      }))
    })
  } catch (error) {
    console.error('Course listing failed:', error.message)
    res.status(500).json({
      success: false,
      message: 'Unable to load courses.'
    })
  }
})

// Instructor: list only courses created by the logged-in instructor.
// Keep this route before /:slug.
router.get(
  '/mine',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res) => {
    try {
      const filter =
        req.user.role === 'admin'
          ? {}
          : { instructor: req.user._id }

      const courses = await Course.find(filter)
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 })

      res.json({ success: true, courses })
    } catch (error) {
      console.error('Instructor course listing failed:', error.message)
      res.status(500).json({
        success: false,
        message: 'Unable to load your courses.'
      })
    }
  }
)

// Public: view a published course.
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      isPublished: true
    }).lean()

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      })
    }

    const enrollment = req.user
      ? await Enrollment.findOne({
          learner: req.user._id,
          course: course._id,
          paymentStatus: course.isPremium ? 'paid' : { $in: ['free', 'paid'] }
        }).select('paymentStatus').lean()
      : null
    const hasAccess = !course.isPremium || enrollment?.paymentStatus === 'paid' || enrollment?.paymentStatus === 'free'
    const lessons = hasAccess
      ? await Lesson.find({
          course: course.title,
          isPublished: true
        }).sort({ order: 1 })
      : []

    res.json({
      success: true,
      course: {
        ...course,
        hasAccess,
        isLocked: course.isPremium && !hasAccess,
        lessons: lessons.map(sanitizeLesson)
      }
    })
  } catch (error) {
    console.error('Course details failed:', error.message)
    res.status(500).json({
      success: false,
      message: 'Unable to load course details.'
    })
  }
})

// Instructor: create a course. New courses require admin publication.
router.post(
  '/',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        level,
        thumbnailUrl,
        isPremium,
        price,
        tags
      } = req.body

      if (!title?.trim() || !description?.trim() || !category?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title, description and category are required.'
        })
      }

      const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid course title.'
        })
      }

      const existingCourse = await Course.findOne({ slug })

      if (existingCourse) {
        return res.status(409).json({
          success: false,
          message: 'A course with this title already exists. Please use a different title.'
        })
      }

      const course = await Course.create({
        title: title.trim(),
        slug,
        description: description.trim(),
        category: category.trim(),
        level,
        thumbnailUrl: thumbnailUrl || '',
        isPremium: Boolean(isPremium),
        price: isPremium ? Number(price) || 0 : 0,
        tags: Array.isArray(tags) ? tags : [],
        instructor: req.user._id,
        isPublished: false
      })

      res.status(201).json({
        success: true,
        message: 'Course created successfully. It is awaiting admin approval.',
        course
      })
    } catch (error) {
      console.error('Course creation failed:', error.message)

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'A course with this title already exists.'
        })
      }

      res.status(500).json({
        success: false,
        message: 'Unable to create course.'
      })
    }
  }
)

// Student: enroll in a published free course.
router.post('/:slug/enroll', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      isPublished: true
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      })
    }

    if (course.isPremium) {
      return res.status(402).json({
        success: false,
        message: 'Premium courses require verified payment through checkout. Direct enrolment is disabled.'
      })
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { learner: req.user._id, course: course._id },
      {
        $setOnInsert: {
          learner: req.user._id,
          course: course._id,
          paymentStatus: 'free'
        },
        $set: { lastActivityAt: new Date() }
      },
      { upsert: true, new: true }
    )

    res.status(201).json({ success: true, enrollment })
  } catch (error) {
    console.error('Course enrolment failed:', error.message)
    res.status(500).json({
      success: false,
      message: 'Unable to enrol in this course.'
    })
  }
})

module.exports = router
