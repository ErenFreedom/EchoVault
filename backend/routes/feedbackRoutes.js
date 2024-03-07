const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Route to submit feedback
router.post('/submit', ensureAuthenticated, feedbackController.submitFeedback);

module.exports = router;
