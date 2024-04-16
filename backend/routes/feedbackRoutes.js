const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/FeedbackController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure this path is correct

// Route to submit feedback
router.post('/submit', authMiddleware, feedbackController.submitFeedback);

module.exports = router;
