const express = require('express');
const router = express.Router();
const { createUserSession, updateSessionActivity, checkSessionExpiration } = require('../controllers/UserSessionController');

// Middleware to verify authentication
const authMiddleware = require('../middleware/authMiddleware');
const sessionManagementMiddleware = require('../middleware/sessionManagementMiddleware'); // Assuming you've created middleware for managing sessions

// Route to start a new user session
// Assumes all authenticated users can create a session
router.post('/create', authMiddleware, sessionManagementMiddleware.createSessionValidator, createUserSession);

// Route to update session activity
// Assumes that this is to keep the user's session alive, so all authenticated users can perform this action
router.patch('/update-activity', authMiddleware, sessionManagementMiddleware.updateSessionValidator, updateSessionActivity);

// Route to check session expiration
// Assumes this check could be part of session management to inform users about their session status
router.get('/check-expiration', authMiddleware, checkSessionExpiration);

module.exports = router;
