const express = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const tokenFor = (user) => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
const allowedRegistrationRoles = new Set(['student', 'instructor'])
const bcryptHashPattern = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/

function normalizeRole(role) {
  return role === 'learner' || !role ? 'student' : role
}

function publicUser(user, includeInterests = false) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    ...(includeInterests ? { interests: user.interests } : {})
  }
}

function secretsMatch(providedSecret, configuredSecret) {
  const provided = Buffer.from(providedSecret)
  const configured = Buffer.from(configuredSecret)

  if (provided.length !== configured.length) return false
  return crypto.timingSafeEqual(provided, configured)
}

router.post('/setup/admin', async (req, res) => {
  try {
    if (!process.env.ADMIN_SETUP_SECRET || !process.env.JWT_SECRET) {
      return res.status(503).json({
        success: false,
        message: 'Admin setup is not configured on the server.'
      })
    }

    const { name, email, password, setupSecret } = req.body
    if (!name || !email || !password || !setupSecret || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password of at least 8 characters, and setup secret are required.'
      })
    }

    if (!secretsMatch(String(setupSecret), process.env.ADMIN_SETUP_SECRET)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin setup secret.'
      })
    }

    if (await User.exists({ role: 'admin' })) {
      return res.status(409).json({
        success: false,
        message: 'An admin account has already been configured.'
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({
        success: false,
        message: 'An account with that email already exists.'
      })
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'admin'
    })

    res.status(201).json({ success: true, user: publicUser(user) })
  } catch (error) {
    console.error('Admin setup failed:', error.message)
    res.status(500).json({ success: false, message: 'Unable to create the admin account.' })
  }
})

router.post('/register', async (req, res) => {
  try {
    console.log(
  'Register route - JWT_SECRET present:',
  Boolean(process.env.JWT_SECRET)
)

    if (!process.env.JWT_SECRET) return res.status(503).json({ success: false, message: 'Authentication is not configured on the server.' })
    const { name, email, password, interests = [] } = req.body
    const requestedRole = String(req.body.role || 'student').trim().toLowerCase()
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Name, email, and a password of at least 8 characters are required.' })
    }
    if (!allowedRegistrationRoles.has(requestedRole)) {
      return res.status(403).json({ success: false, message: 'Public registration is available for students and instructors only.' })
    }
    const normalizedEmail = email.trim().toLowerCase()
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists.' })
    }
    const user = await User.create({ name, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role: requestedRole, interests })
    res.status(201).json({ success: true, token: tokenFor(user), user: publicUser(user) })
  } catch (error) {
    console.error('Registration failed:', error.message)
    res.status(500).json({ success: false, message: 'Unable to create the account.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) return res.status(503).json({ success: false, message: 'Authentication is not configured on the server.' })
    const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() }).select('+passwordHash +password')
    const submittedPassword = String(req.body.password || '')
    let authenticated = false

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect.' })
    }

    if (user.passwordHash) {
      if (bcryptHashPattern.test(user.passwordHash)) {
        authenticated = await bcrypt.compare(submittedPassword, user.passwordHash)
      }
    } else if (user.password && bcryptHashPattern.test(user.password)) {
      authenticated = await bcrypt.compare(submittedPassword, user.password)
      if (authenticated) {
        user.passwordHash = await bcrypt.hash(submittedPassword, 12)
        await user.save()
      }
    }

    if (!authenticated) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect.' })
    }

    res.json({ success: true, token: tokenFor(user), user: publicUser(user) })
  } catch (error) {
    console.error('Login failed:', error.message)
    res.status(500).json({ success: false, message: 'Unable to log in.' })
  }
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: publicUser(req.user, true) })
})

module.exports = router
