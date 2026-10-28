const express = require('express')
const Lesson = require('../models/Lesson')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const QuizAttempt = require('../models/QuizAttempt')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const ownedEnrollment = (learner, course) => Enrollment.findOne({ learner, course }).populate('course')

router.get('/dashboard', requireAuth, async (req, res) => {
  const enrollments = await Enrollment.find({ learner: req.user._id }).populate('course').lean()
  const completedCourseIds = enrollments.filter((item) => item.completedAt).map((item) => String(item.course._id))
  const interests = req.user.interests || []
  const recommendations = await Course.find({ isPublished: true, _id: { $nin: enrollments.map((item) => item.course._id) }, $or: [{ category: { $in: interests } }, { tags: { $in: interests } }] }).limit(6).lean()
  const fallback = recommendations.length ? recommendations : await Course.find({ isPublished: true, _id: { $nin: completedCourseIds } }).sort({ createdAt: -1 }).limit(6).lean()
  const progress = await Promise.all(enrollments.map(async (enrollment) => {
    const total = await Lesson.countDocuments({ course: enrollment.course.title, isPublished: true })
    return { ...enrollment, progressPercentage: total ? Math.round((enrollment.completedLessons.length / total) * 100) : 0 }
  }))
  res.json({ success: true, enrollments: progress, recommendations: fallback })
})

router.post('/lessons/:lessonId/complete', requireAuth, async (req, res) => {
  const lesson = await Lesson.findOne({ _id: req.params.lessonId, isPublished: true })
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' })
  const course = await Course.findOne({ title: lesson.course, isPublished: true })
  if (!course) return res.status(404).json({ success: false, message: 'Course metadata not found.' })
  const enrollment = await ownedEnrollment(req.user._id, course._id)
  if (!enrollment) return res.status(403).json({ success: false, message: 'Enroll before tracking progress.' })
  if (!enrollment.completedLessons.some((id) => String(id) === String(lesson._id))) enrollment.completedLessons.push(lesson._id)
  const total = await Lesson.countDocuments({ course: course.title, isPublished: true })
  if (enrollment.completedLessons.length >= total) enrollment.completedAt = new Date()
  enrollment.lastActivityAt = new Date()
  await enrollment.save()
  res.json({ success: true, progressPercentage: total ? Math.round((enrollment.completedLessons.length / total) * 100) : 0 })
})

router.post('/lessons/:lessonId/quiz', requireAuth, async (req, res) => {
  const lesson = await Lesson.findOne({ _id: req.params.lessonId, isPublished: true })
  if (!lesson || !lesson.quiz || !lesson.quiz.questions.length) return res.status(404).json({ success: false, message: 'Quiz not found.' })
  const answers = Array.isArray(req.body.answers) ? req.body.answers : []
  const correct = lesson.quiz.questions.reduce((count, question, index) => count + (answers[index] === question.correctOption ? 1 : 0), 0)
  const score = Math.round((correct / lesson.quiz.questions.length) * 100)
  const passed = score >= lesson.quiz.passingPercentage
  const attempt = await QuizAttempt.create({ learner: req.user._id, lesson: lesson._id, score, passed, answers })
  res.json({ success: true, score, passed, attemptId: attempt._id, feedback: lesson.quiz.questions.map((question) => ({ explanation: question.explanation })) })
})

module.exports = router
