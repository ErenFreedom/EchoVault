const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRegistration, validateUserUpdate, runValidation } = require('../middleware/validationMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const loggerMiddleware = require('../middleware/loggerMiddleware');
const corsMiddleware = require('../middleware/corsMiddleware');
const sessionManagementMiddleware = require('../middleware/sessionManagementMiddleware');

// Middleware to ensure CORS policies are in place for user routes
router.use(corsMiddleware);

// Route to handle user registration with validation
router.post('/register', validateRegistration, runValidation, userController.registerUser);

// Route to verify OTP for user registration
router.post('/verify-otp', userController.verifyOtp);

// Route to update user profile with validation and session check
router.put('/profile', authMiddleware, validateUserUpdate, runValidation, sessionManagementMiddleware, userController.updateProfile);

// Route to toggle user theme preference with session check
router.patch('/toggle-theme', authMiddleware, sessionManagementMiddleware, userController.toggleTheme);

// Route to update user information with validation and session check
router.put('/info', authMiddleware, validateUserUpdate, runValidation, sessionManagementMiddleware, userController.updateUserInfo);

// Route to change user password with rate limiting and session check
router.post('/change-password', authMiddleware, rateLimitMiddleware.generalRateLimit, sessionManagementMiddleware, userController.changePassword);

// Route to send OTP for account deletion with rate limiting and session check
router.get('/send-deletion-otp', authMiddleware, rateLimitMiddleware.generalRateLimit, sessionManagementMiddleware, userController.sendDeletionOtp);

// Route to delete user account with rate limiting and session check
router.delete('/delete-account', authMiddleware, rateLimitMiddleware.generalRateLimit, sessionManagementMiddleware, userController.deleteAccount);

// Route to log all user-related actions
router.use(loggerMiddleware);

module.exports = router;
