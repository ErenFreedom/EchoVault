const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');
const corsMiddleware = require('../middleware/corsMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const { validateFeedback } = require('../middleware/validationMiddleware'); // Assuming you have validation rules for feedback
const loggerMiddleware = require('../middleware/loggerMiddleware');
const errorHandler = require('../middleware/errorMiddleware');

// Apply CORS policies for feedback routes
router.use(corsMiddleware);

// Route to submit feedback, ensuring the user is authenticated (normal, premium, or dummy user)
router.post('/submit',
    authMiddleware,
    rateLimitMiddleware.generalRateLimit, // Apply general rate limiting to protect the feedback submission process
    validateFeedback, // Validate the feedback submission fields
    feedbackController.submitFeedback,
    loggerMiddleware, // Log the feedback submission action for monitoring
    errorHandler // Handle any errors that occur
);

// Export the router to be mounted in your main server file
module.exports = router;
