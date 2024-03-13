const express = require('express');
const router = express.Router();
const userSessionController = require('../controllers/UserSessionController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

// Route to create a new user session
router.post('/create', /* authMiddleware, */ userSessionController.createUserSession);

// Route to update session activity
router.patch('/update-activity', /* authMiddleware, */ userSessionController.updateSessionActivity);

// Route to check for session expiration
router.post('/check-expiration', /* authMiddleware, */ userSessionController.checkSessionExpiration);

module.exports = router;
