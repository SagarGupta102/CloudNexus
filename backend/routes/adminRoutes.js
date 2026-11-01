const Lesson = require('../models/Lesson')
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

const User = require('../models/User')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const { requireAuth, requireRole } = require('../middleware/auth')

// Protect every admin route
router.use(requireAuth, requireRole('admin'))

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ['student', 'learner'] } }),
      User.countDocuments({ role: 'instructor' }),
      Course.countDocuments(),
      Enrollment.countDocuments()
    ])

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        totalEnrollments
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Unable to load admin statistics.'
    })
  }
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        role: user.role === 'learner' ? 'student' : user.role
      }))
    })
  } catch (error) {
    console.error('Admin users error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Unable to load users.'
    })
  }
})

// GET /api/admin/instructors
router.get('/instructors', async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .lean()

    res.json({ success: true, instructors })
  } catch (error) {
    console.error('Admin instructors error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Unable to load instructors.'
    })
  }
})

// GET /api/admin/students
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({
      role: { $in: ['student', 'learner'] }
    })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      students: students.map(user => ({
        ...user,
        role: 'student'
      }))
    })
  } catch (error) {
    console.error('Admin students error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Unable to load students.'
    })
  }
})

// GET /api/admin/courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      courses
    })
  } catch (error) {
    console.error('Admin courses error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Unable to load courses.'
    })
  }
})

// PATCH /api/admin/courses/:id/status
router.patch('/courses/:id/status', async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID.'
      })
    }

    if (typeof req.body.isPublished !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'A valid publishing status is required.'
      })
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: { isPublished: req.body.isPublished } },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email')

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      })
    }

    res.json({
      success: true,
      message: 'Course publishing status updated.',
      course
    })
  } catch (error) {
    console.error('Course status error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Unable to update course status.'
    })
  }
})


// PATCH /api/admin/courses/:id/pricing
// Update whether a course is free or premium and set its price.
router.patch('/courses/:id/pricing', async (req, res) => {
  try {
    const { id } = req.params
    const { isPremium, price } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID.'
      })
    }

    if (typeof isPremium !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'A valid premium status is required.'
      })
    }

    let updatedPrice = 0

    if (isPremium) {
      if (
        typeof price !== 'number' ||
        !Number.isFinite(price) ||
        price <= 0 ||
        !Number.isSafeInteger(Math.round(price * 100))
      ) {
        return res.status(400).json({
          success: false,
          message: 'Premium courses must have a valid price greater than zero.'
        })
      }

      updatedPrice = price
    }

    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: {
          isPremium,
          price: updatedPrice
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('instructor', 'name email')

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      })
    }

    return res.json({
      success: true,
      message: 'Course pricing updated successfully.',
      course
    })
  } catch (error) {
    console.error('Course pricing update error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to update course pricing.'
    })
  }
})


module.exports = router

// Get all lessons for admin review
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .sort({ createdAt: -1 })
      .lean()

    const courseTitles = [...new Set(lessons.map(lesson => lesson.course))]
    const courses = await Course.find({ title: { $in: courseTitles } })
      .populate('instructor', 'name email')
      .lean()

    const courseMap = new Map(courses.map(course => [course.title, course]))

    const lessonsWithDetails = lessons.map(lesson => ({
      ...lesson,
      approvalStatus: lesson.approvalStatus || 'pending',
      courseDetails: courseMap.get(lesson.course) || null
    }))

    res.json({ success: true, lessons: lessonsWithDetails })
  } catch (error) {
    console.error('Admin lessons error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to fetch lessons.'
    })
  }
})

// Approve or reject a lesson
router.patch('/lessons/:id/approval', async (req, res) => {
  try {
    const { status } = req.body

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected.'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson ID.'
      })
    }

    const lesson = await Lesson.findById(req.params.id)

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.'
      })
    }

    lesson.approvalStatus = status
    lesson.isPublished = status === 'approved'

    await lesson.save()

    res.json({
      success: true,
      message: `Lesson ${status} successfully.`,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        approvalStatus: lesson.approvalStatus,
        isPublished: lesson.isPublished
      }
    })
  } catch (error) {
    console.error('Lesson approval error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to update lesson approval.'
    })
  }
})