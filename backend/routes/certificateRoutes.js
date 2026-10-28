const express = require('express')
const crypto = require('crypto')
const PDFDocument = require('pdfkit')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const Certificate = require('../models/Certificate')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.post('/:slug', requireAuth, async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
  const enrollment = course && await Enrollment.findOne({ learner: req.user._id, course: course._id })
  if (!course || !enrollment || !enrollment.completedAt) return res.status(403).json({ success: false, message: 'Complete the course before generating a certificate.' })
  const certificate = await Certificate.findOneAndUpdate(
    { learner: req.user._id, course: course._id },
    { $setOnInsert: { certificateId: `CN-${crypto.randomBytes(5).toString('hex').toUpperCase()}`, learner: req.user._id, course: course._id, issuedAt: new Date() } },
    { upsert: true, new: true }
  ).populate('course learner')
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
