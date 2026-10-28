const express = require('express')
const multer = require('multer')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const { requireAuth, requireRole } = require('../middleware/auth')
const { uploadBuffer } = require('../services/cloudinary')

const router = express.Router()

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const videoTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const valid = imageTypes.has(file.mimetype) || videoTypes.has(file.mimetype)
    callback(valid ? null : new Error('Use JPG, PNG, WebP, MP4, WebM, or QuickTime video.'))
  }
})

function mediaPayload(result) {
  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format || '',
    bytes: result.bytes || 0
  }
}

router.post('/upload', requireAuth, requireRole('instructor', 'admin'), (req, res) => {
  upload.single('file')(req, res, async (uploadError) => {
    if (uploadError) {
      const message = uploadError.code === 'LIMIT_FILE_SIZE'
        ? 'The file exceeds the 250 MB limit.'
        : uploadError.message
      return res.status(400).json({ success: false, message })
    }

    try {
      const { targetType, targetId } = req.body
      if (!req.file || !targetId || !['course', 'lesson'].includes(targetType)) {
        return res.status(400).json({ success: false, message: 'Choose a valid target and file.' })
      }
      const validTargetType = targetType === 'course'
        ? imageTypes.has(req.file.mimetype)
        : videoTypes.has(req.file.mimetype)
      if (!validTargetType) {
        return res.status(400).json({
          success: false,
          message: targetType === 'course'
            ? 'Course thumbnails must be JPG, PNG, or WebP.'
            : 'Lesson videos must be MP4, WebM, or QuickTime video.'
        })
      }

      const target = targetType === 'course'
        ? await Course.findById(targetId)
        : await Lesson.findById(targetId)
      if (!target) return res.status(404).json({ success: false, message: `${targetType} not found.` })

      if (req.user.role === 'instructor') {
        const course = targetType === 'course'
          ? target
          : await Course.findOne({ title: target.course })
        if (!course || String(course.instructor) !== String(req.user._id)) {
          return res.status(403).json({ success: false, message: 'You can only manage media for your own courses.' })
        }
      }

      const result = await uploadBuffer(req.file.buffer, {
        folder: `cloudnexus/${targetType}s`,
        resource_type: targetType === 'lesson' ? 'video' : 'image',
        type: 'upload',
        use_filename: true,
        unique_filename: true,
        overwrite: false
      })
      const media = mediaPayload(result)

      if (targetType === 'course') {
        const course = await Course.findByIdAndUpdate(
          targetId,
          { $set: { thumbnailUrl: media.secureUrl, thumbnailMedia: media } },
          { new: true }
        )
      } else {
        const lesson = await Lesson.findByIdAndUpdate(
          targetId,
          { $set: { videoUrl: media.secureUrl, media } },
          { new: true }
        )
      }

      return res.status(201).json({
        success: true,
        message: targetType === 'course' ? 'Course image uploaded.' : 'Lesson video uploaded.',
        media
      })
    } catch (error) {
      console.error('Cloudinary upload failed:', error.message)
      const status = error.message.startsWith('Cloudinary is not configured') ? 503 : 500
      return res.status(status).json({ success: false, message: status === 503 ? error.message : 'Media upload failed.' })
    }
  })
})

module.exports = router
