const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { ensureIsNormalUser } = require('../middleware/userTypeMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const corsMiddleware = require('../middleware/corsMiddleware');
const loggerMiddleware = require('../middleware/loggerMiddleware');
const errorHandler = require('../middleware/errorMiddleware');
const sessionManagementMiddleware = require('../middleware/sessionManagementMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Apply CORS policies for payment routes
router.use(corsMiddleware);

// Route to create a Stripe PaymentIntent, with appropriate middlewares to handle authentication, rate limiting, and session management
router.post('/create-payment-intent',
    authMiddleware,
    ensureIsNormalUser,
    rateLimitMiddleware.dynamicRateLimiter, // Apply dynamic rate limiting based on user status
    sessionManagementMiddleware, // Ensure the session is active
    validationMiddleware.validatePaymentIntent, // Assuming this is a method for validating payment intent requests
    paymentController.createPaymentIntent,
    loggerMiddleware, // Log the payment intent creation for monitoring
    errorHandler // Handle any potential errors gracefully
);

// Route to upgrade user to premium after successful payment, ensuring all necessary middlewares are in place
router.post('/upgrade-to-premium',
    authMiddleware,
    ensureIsNormalUser,
    rateLimitMiddleware.dynamicRateLimiter, // Apply dynamic rate limiting
    sessionManagementMiddleware, // Check the session's validity
    validationMiddleware.validateUpgradeToPremium, // Assuming this validates the request for premium upgrade
    paymentController.upgradeToPremium,
    loggerMiddleware, // Log the upgrade action
    errorHandler // Handle errors
);

// Export the router for use in the application
module.exports = router;
