const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Import lesson routes
const lessonRoutes = require('./routes/lessonRoutes')
const authRoutes = require('./routes/authRoutes')
const courseRoutes = require('./routes/courseRoutes')
const learningRoutes = require('./routes/learningRoutes')
const certificateRoutes = require('./routes/certificateRoutes')
const mediaRoutes = require('./routes/mediaRoutes')

// Health check API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CloudNexus backend is running successfully!'
  })
})

// Lesson APIs
app.use('/api/lessons', lessonRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/learning', learningRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/media', mediaRoutes)

// Start server after connecting to MongoDB
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from the .env file.')
    }

    await mongoose.connect(process.env.MONGODB_URI)

    console.log('MongoDB Atlas connected successfully!')

    const PORT = process.env.PORT || 5000

    app.listen(PORT, () => {
      console.log(
        `CloudNexus backend running on http://localhost:${PORT}`
      )
    })
  } catch (error) {
    console.error('Backend startup failed:', error.message)
    process.exit(1)
  }
}

startServer()