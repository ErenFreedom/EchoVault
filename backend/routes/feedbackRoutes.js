const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/FeedbackController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

// Route to submit feedback
router.post('/submit', /* authMiddleware, */ feedbackController.submitFeedback);

module.exports = router;
