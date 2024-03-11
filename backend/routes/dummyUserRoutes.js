const express = require('express');
const router = express.Router();
const dummyUserController = require('../controllers/DummyUserController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateDummyRegistration, runValidation } = require('../middleware/validationMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const loggerMiddleware = require('../middleware/loggerMiddleware');
const corsMiddleware = require('../middleware/corsMiddleware');
const sessionManagementMiddleware = require('../middleware/sessionManagementMiddleware');
const permissionsMiddleware = require('../middleware/permissionsMiddleware');

// Middleware to ensure CORS policies are in place for dummy user routes
router.use(corsMiddleware);

// Route to handle registration of a dummy user with validation
router.post('/register', validateDummyRegistration, runValidation, dummyUserController.registerDummyUser);

// Route to handle OTP verification for dummy user registration
router.post('/verify-otp', authMiddleware, sessionManagementMiddleware, dummyUserController.verifyDummyUserOtp);

// Route to toggle theme for a dummy user with session and permissions check
router.post('/toggle-theme', authMiddleware, sessionManagementMiddleware, permissionsMiddleware.checkDummyUserPermission, dummyUserController.toggleThemeDummyUser);

// Route to update dummy user information with validation, session, and permissions check
router.put('/update-info', authMiddleware, validateDummyRegistration, runValidation, sessionManagementMiddleware, permissionsMiddleware.checkDummyUserPermission, dummyUserController.updateDummyUserInfo);

// Route to change dummy user password with rate limiting, session, and permissions check
router.post('/change-password', authMiddleware, rateLimitMiddleware.generalRateLimit, sessionManagementMiddleware, permissionsMiddleware.checkDummyUserPermission, dummyUserController.changeDummyUserPassword);

// Route to unlink (delete) a dummy user account with rate limiting, session, and permissions check
router.delete('/unlink-account', authMiddleware, rateLimitMiddleware.generalRateLimit, sessionManagementMiddleware, permissionsMiddleware.checkDummyUserPermission, dummyUserController.unlinkDummyUserAccount);

// Route to log all dummy user-related actions
router.use(loggerMiddleware);

module.exports = router;
