const express = require('express');
const router = express.Router();
const userSessionController = require('../controllers/UserSessionController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', /* authMiddleware, */ userSessionController.createUserSession);

router.patch('/update-activity', /* authMiddleware, */ userSessionController.updateSessionActivity);

router.post('/check-expiration', /* authMiddleware, */ userSessionController.checkSessionExpiration);

module.exports = router;
