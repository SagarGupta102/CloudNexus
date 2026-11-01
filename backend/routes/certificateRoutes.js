const express = require('express')
const crypto = require('crypto')
const PDFDocument = require('pdfkit')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Enrollment = require('../models/Enrollment')
const Certificate = require('../models/Certificate')
const QuizAttempt = require('../models/QuizAttempt')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

async function getEligibleCertificateData(learnerId, slug) {
  const course = await Course.findOne({ slug, isPublished: true })
  const enrollment = course
    ? await Enrollment.findOne({ learner: learnerId, course: course._id })
    : null

  if (!course || !enrollment) {
    return { error: 'Enroll in the published course before generating a certificate.' }
  }

  const lessons = await Lesson.find({
    course: course.title,
    isPublished: true
  }).select('_id quiz')

  const completedLessonIds = new Set(
    enrollment.completedLessons.map((lessonId) => String(lessonId))
  )
  const allLessonsCompleted =
    lessons.length > 0 &&
    lessons.every((lesson) => completedLessonIds.has(String(lesson._id)))

  if (!allLessonsCompleted) {
    return { error: 'Complete all published lessons before generating a certificate.' }
  }

  const quizLessonIds = lessons
    .filter((lesson) => lesson.quiz?.questions?.length)
    .map((lesson) => lesson._id)
  if (quizLessonIds.length) {
    const passedLessonIds = await QuizAttempt.distinct('lesson', {
      learner: learnerId,
      lesson: { $in: quizLessonIds },
      passed: true
    })
    if (passedLessonIds.length !== quizLessonIds.length) {
      return { error: 'Pass every required lesson quiz before generating a certificate.' }
    }
  }

  return { course, enrollment }
}

async function createOrGetCertificate(learnerId, course) {
  return Certificate.findOneAndUpdate(
    { learner: learnerId, course: course._id },
    {
      $setOnInsert: {
        certificateId: `CN-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
        learner: learnerId,
        course: course._id,
        issuedAt: new Date()
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('course learner')
}

router.get('/mine', requireAuth, async (req, res) => {
  const certificates = await Certificate.find({ learner: req.user._id })
    .populate('course', 'title slug description')
    .sort({ issuedAt: -1 })
    .lean()
  res.json({ success: true, certificates })
})

router.post('/generate/:slug', requireAuth, async (req, res) => {
  const result = await getEligibleCertificateData(req.user._id, req.params.slug)
  if (result.error) {
    return res.status(403).json({ success: false, message: result.error })
  }

  const certificate = await createOrGetCertificate(req.user._id, result.course)
  res.status(201).json({ success: true, certificate })
})

router.post('/:slug', requireAuth, async (req, res) => {
  const result = await getEligibleCertificateData(req.user._id, req.params.slug)
  if (result.error) {
    return res.status(403).json({ success: false, message: result.error })
  }

  const certificate = await createOrGetCertificate(req.user._id, result.course)
  const pdf = new PDFDocument({ size: 'A4', margin: 60 })
  const chunks = []
  pdf.on('data', (chunk) => chunks.push(chunk))
  pdf.on('end', () => {
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${certificate.certificateId}.pdf"` })
    res.send(Buffer.concat(chunks))
  })
  pdf.fontSize(30).fillColor('#087fdb').text('CloudNexus LMS', { align: 'center' })
  pdf.moveDown(2).fontSize(24).fillColor('#12264a').text('Certificate of Completion', { align: 'center' })
  pdf.moveDown().fontSize(16).fillColor('#475569').text('This certifies that', { align: 'center' })
  pdf.moveDown().fontSize(28).fillColor('#12264a').text(certificate.learner.name, { align: 'center' })
  pdf.moveDown().fontSize(16).text(`has completed ${certificate.course.title}`, { align: 'center' })
  pdf.moveDown(2).fontSize(12).text(`Issued ${certificate.issuedAt.toLocaleDateString()}  |  Certificate ID: ${certificate.certificateId}`, { align: 'center' })
  pdf.end()
})

router.get('/verify/:certificateId', async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId }).populate('course learner', 'title name')
  if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found.' })
  res.json({ success: true, certificate })
})

module.exports = router
