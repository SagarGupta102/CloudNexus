
const express = require('express')
const Lesson = require('../models/Lesson')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const { optionalAuth, requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

// Remove correct answers before returning lessons to the frontend.
function sanitizeLesson(lesson) {
  if (!lesson) return lesson

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

// CREATE a lesson (instructor or admin)
router.post(
  '/',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res) => {
    try {
      const {
        title,
        course,
        description,
        order,
        durationMinutes,
        level,
        content,
        sections,
        videoUrl,
        quiz
      } = req.body

      if (!title?.trim() || !course?.trim() || !description?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title, course and description are required.'
        })
      }

      const courseRecord = await Course.findOne({
        title: course.trim()
      })

      if (!courseRecord) {
        return res.status(404).json({
          success: false,
          message: 'Course not found.'
        })
      }

      // Instructors can only add lessons to their own courses.
      if (
        req.user.role === 'instructor' &&
        String(courseRecord.instructor) !== String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only add lessons to your own courses.'
        })
      }

      const lessonOrder = Number(order)

      if (!Number.isInteger(lessonOrder) || lessonOrder < 1) {
        return res.status(400).json({
          success: false,
          message: 'Lesson order must be a positive whole number.'
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
          message: 'Please provide a valid lesson title.'
        })
      }

      const existingLesson = await Lesson.findOne({ slug })

      if (existingLesson) {
        return res.status(409).json({
          success: false,
          message: 'A lesson with this title already exists. Use a different title.'
        })
      }

      const lesson = await Lesson.create({
        title: title.trim(),
        slug,
        course: courseRecord.title,
        description: description.trim(),
        order: lessonOrder,
        durationMinutes: Number(durationMinutes) || 10,
        level: level || 'Beginner',
        content: content || '',
        sections: Array.isArray(sections) ? sections : [],
        videoUrl: videoUrl || '',
        approvalStatus: 'pending',
        quiz: quiz || { passingPercentage: 70, questions: [] }
      })

      return res.status(201).json({
        success: true,
        message: 'Lesson created successfully. It is awaiting publication.',
        lesson: sanitizeLesson(lesson)
      })
    } catch (error) {
      console.error('Error creating lesson:', error.message)

      return res.status(500).json({
        success: false,
        message: 'Failed to create lesson.'
      })
    }
  }
)

// GET all published lessons
router.get('/', async (req, res) => {
  try {
    const premiumCourses = await Course.find({
      isPublished: true,
      isPremium: true
    }).select('title').lean()

    const premiumCourseTitles = premiumCourses.map(
      (course) => course.title
    )

    const lessons = await Lesson.find({
      isPublished: true,
      course: { $nin: premiumCourseTitles }
    }).sort({ order: 1 })

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons: lessons.map(sanitizeLesson)
    })
  } catch (error) {
    console.error('Error fetching lessons:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons.'
    })
  }
})

// GET lessons belonging to the authenticated instructor's courses, including unpublished lessons.
router.get(
  '/mine',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res) => {
    try {
      const courses =
        req.user.role === 'admin'
          ? await Course.find().select('title').lean()
          : await Course.find({ instructor: req.user._id })
              .select('title')
              .lean()
      const courseTitles = courses.map((course) => course.title)
      const lessons = courseTitles.length
        ? await Lesson.find({ course: { $in: courseTitles } }).sort({
            course: 1,
            order: 1
          })
        : []

      return res.status(200).json({
        success: true,
        count: lessons.length,
        lessons: lessons.map(sanitizeLesson)
      })
    } catch (error) {
      console.error('Error fetching instructor lessons:', error.message)

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch your lessons.'
      })
    }
  }
)

// GET one published lesson by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      slug: req.params.slug,
      isPublished: true
    })

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.'
      })
    }

    const course = await Course.findOne({
      title: lesson.course,
      isPublished: true
    }).select('_id isPremium').lean()

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      })
    }

    if (course.isPremium) {
      const enrollment = req.user
        ? await Enrollment.findOne({
            learner: req.user._id,
            course: course._id,
            paymentStatus: 'paid'
          }).select('_id').lean()
        : null

      if (!enrollment) {
        console.warn(
          `Premium lesson access denied: lesson=${lesson._id} course=${course._id} user=${req.user?._id || 'anonymous'}`
        )
        return res.status(403).json({
          success: false,
          message: 'Purchase this course before opening its lessons.'
        })
      }
    }

    res.status(200).json({
      success: true,
      lesson: sanitizeLesson(lesson)
    })
  } catch (error) {
    console.error('Error fetching lesson:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson.'
    })
  }
})

module.exports = router
