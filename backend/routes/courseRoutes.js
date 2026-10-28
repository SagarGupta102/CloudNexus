const express = require('express')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Enrollment = require('../models/Enrollment')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 }).lean()
    const lessonCounts = await Lesson.aggregate([{ $match: { isPublished: true } }, { $group: { _id: '$course', count: { $sum: 1 } } }])
    const counts = Object.fromEntries(lessonCounts.map((item) => [item._id, item.count]))
    res.json({ success: true, courses: courses.map((course) => ({ ...course, lessonCount: counts[course.title] || 0 })) })
  } catch (error) {
    console.error('Course listing failed:', error.message)
    res.status(500).json({ success: false, message: 'Unable to load courses.' })
  }
})

router.get('/:slug', async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, isPublished: true }).lean()
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' })
  const lessons = await Lesson.find({ course: course.title, isPublished: true }).sort({ order: 1 })
  res.json({ success: true, course: { ...course, lessons } })
})

router.post('/', requireAuth, requireRole('instructor', 'admin'), async (req, res) => {
  const course = await Course.create({ ...req.body, instructor: req.user._id })
  res.status(201).json({ success: true, course })
})

router.post('/:slug/enroll', requireAuth, async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, isPublished: true })
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' })
  if (course.isPremium && req.body.paymentStatus !== 'paid') {
    return res.status(402).json({ success: false, message: 'This course requires a verified payment.' })
  }
  const enrollment = await Enrollment.findOneAndUpdate(
    { learner: req.user._id, course: course._id },
    { $setOnInsert: { learner: req.user._id, course: course._id, paymentStatus: course.isPremium ? 'paid' : 'free' }, $set: { lastActivityAt: new Date() } },
    { upsert: true, new: true }
  )
  res.status(201).json({ success: true, enrollment })
})

module.exports = router
