const express = require('express');
const router = express.Router();
const { createUserSession, updateSessionActivity, checkSessionExpiration } = require('../controllers/UserSessionController');

// Middleware to verify authentication
const { isAuthenticated } = require('../middleware/authMiddleware');

// Route to start a new user session
router.post('/create', isAuthenticated, createUserSession);

// Route to update session activity
router.patch('/update-activity', isAuthenticated, updateSessionActivity);

// Route to check session expiration
router.get('/check-expiration', isAuthenticated, checkSessionExpiration);

module.exports = router;
