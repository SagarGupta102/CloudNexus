const jwt = require('jsonwebtoken')
const User = require('../models/User')

function normalizeRole(role) {
  return role === 'learner' || !role ? 'student' : role
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(payload.userId)
    if (!req.user) return res.status(401).json({ success: false, message: 'User account not found.' })
    req.user.role = normalizeRole(req.user.role)
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' })
  }
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return next()
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(payload.userId)
    if (req.user) {
      req.user.role = normalizeRole(req.user.role)
    }
  } catch {
    req.user = null
  }

  next()
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You are not allowed to perform this action.' })
    }
    next()
  }
}

module.exports = { requireAuth, optionalAuth, requireRole }
