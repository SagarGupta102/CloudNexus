const express = require('express')
const Lesson = require('../models/Lesson')

const router = express.Router()

// GET all published lessons
router.get('/', async (req, res) => {
  try {
    const lessons = await Lesson.find({
      isPublished: true
    }).sort({ order: 1 })

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons
    })
  } catch (error) {
    console.error('Error fetching lessons:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons.'
    })
  }
})

// GET one published lesson by its slug
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

    res.status(200).json({
      success: true,
      lesson
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