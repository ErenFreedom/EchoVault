const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const { ensureIsNormalUser } = require('../middleware/userTypeMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const corsMiddleware = require('../middleware/corsMiddleware');
const { runValidation } = require('../middleware/validationMiddleware'); // Assuming specific validations for upgrading subscriptions
const errorHandler = require('../middleware/errorMiddleware');
const loggerMiddleware = require('../middleware/loggerMiddleware');
const sessionManagementMiddleware = require('../middleware/sessionManagementMiddleware');

// Apply CORS policies for subscription routes
router.use(corsMiddleware);

// Route to handle the upgrade to a premium subscription, ensuring that the user is logged in, is a normal user, and not already a premium or dummy user.
router.post('/upgrade-to-premium',
    authMiddleware,
    ensureIsNormalUser,
    rateLimitMiddleware.generalRateLimit, // Apply general rate limiting to protect the upgrade process
    runValidation, // Run any specific validations for upgrading to premium
    sessionManagementMiddleware, // Manage the user session
    subscriptionController.upgradeToPremium,
    loggerMiddleware, // Log the upgrade action for monitoring
    errorHandler // Handle any errors that occur
);

// Export the router to be mounted in your main server file
module.exports = router;
