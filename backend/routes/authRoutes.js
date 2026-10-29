const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const tokenFor = (user) => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res) => {
  try {
    console.log(
  'Register route - JWT_SECRET present:',
  Boolean(process.env.JWT_SECRET)
)

    if (!process.env.JWT_SECRET) return res.status(503).json({ success: false, message: 'Authentication is not configured on the server.' })
    const { name, email, password, interests = [] } = req.body
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Name, email, and a password of at least 8 characters are required.' })
    }
    const normalizedEmail = email.trim().toLowerCase()
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists.' })
    }
    const user = await User.create({ name, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), interests })
    res.status(201).json({ success: true, token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error('Registration failed:', error.message)
    res.status(500).json({ success: false, message: 'Unable to create the account.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) return res.status(503).json({ success: false, message: 'Authentication is not configured on the server.' })
    const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() }).select('+passwordHash')
    if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect.' })
    }
    res.json({ success: true, token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error('Login failed:', error.message)
    res.status(500).json({ success: false, message: 'Unable to log in.' })
  }
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, interests: req.user.interests } })
})

module.exports = router
