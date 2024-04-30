const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/FeedbackController');
const authMiddleware = require('../middleware/authMiddleware'); 
router.post('/submit', authMiddleware, feedbackController.submitFeedback);

module.exports = router;
