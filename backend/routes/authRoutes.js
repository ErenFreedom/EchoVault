const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { validateLogin } = require('../middleware/validationMiddleware');
const { rateLimitMiddleware } = require('../middleware/rateLimitMiddleware');
const { loggerMiddleware } = require('../middleware/loggerMiddleware');

// Assuming you have middleware to validate login data
// Rate limiting to prevent brute-force attacks on login
// Logging middleware to log the login attempts

// Route to handle user login with validation, rate limiting, and logging
router.post('/login', validateLogin, rateLimitMiddleware.generalRateLimit, loggerMiddleware, authController.login);

// Route to handle OTP verification for login with rate limiting and logging
router.post('/verify-otp', rateLimitMiddleware.generalRateLimit, loggerMiddleware, authController.verifyOtpForLogin);

module.exports = router;
