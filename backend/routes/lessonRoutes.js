const express = require('express')
const Lesson = require('../models/Lesson')
const Course = require('../models/Course')

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
        options: question.options,
      }))
    }
  }

  return safeLesson
}

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

// GET one published lesson by slug
router.get('/:slug', async (req, res) => {
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
}).select('isPremium').lean()

if (!course) {
  return res.status(404).json({
    success: false,
    message: 'Course not found.'
  })
}

if (course.isPremium) {
  return res.status(403).json({
    success: false,
    message: 'This lesson belongs to a premium course and is currently restricted.'
  })
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