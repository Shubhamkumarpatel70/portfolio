const express = require('express');
const router = express.Router();
const { login, register, getMe, logout } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.get('/me', getMe);
router.post('/logout', logout);

// Check if user is authenticated
router.get('/check', (req, res) => {
  // Check if session exists
  if (req.session && req.session.userId) {
    return res.json({ isAuthenticated: true });
  }
  
  // If no session, check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const jwt = require('jsonwebtoken');
      jwt.verify(token, process.env.JWT_SECRET);
      return res.json({ isAuthenticated: true });
    } catch (error) {
      // Token verification failed
    }
  }
  
  // Not authenticated
  return res.json({ isAuthenticated: false });
});

module.exports = router;
