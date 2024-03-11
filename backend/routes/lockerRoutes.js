const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/LockerController');
const authMiddleware = require('../middleware/authMiddleware');
const { ensureIsPremiumUser } = require('../middleware/userTypeMiddleware');
const permissionsMiddleware = require('../middleware/permissionsMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const corsMiddleware = require('../middleware/corsMiddleware');
const sessionManagementMiddleware = require('../middleware/sessionManagementMiddleware');
const loggerMiddleware = require('../middleware/loggerMiddleware');
const { validateLockerCreation, validateGrantPermissions } = require('../middleware/validationMiddleware'); // Assuming you have specific validations

// Apply CORS policies for locker routes
router.use(corsMiddleware);

// POST route for creating a new locker, only accessible by premium users
router.post('/create', authMiddleware, ensureIsPremiumUser, validateLockerCreation, sessionManagementMiddleware, lockerController.createLocker);

// POST route for granting permissions to a dummy user, accessible by premium users who own the locker
router.post('/grant-permissions', authMiddleware, ensureIsPremiumUser, permissionsMiddleware.checkLockerOwnership, validateGrantPermissions, sessionManagementMiddleware, lockerController.grantPermissionsToDummyUser);

// Apply rate limiting to sensitive locker operations
router.use(rateLimitMiddleware.generalRateLimit);

// Log all locker-related actions
router.use(loggerMiddleware);

// Export the router to use it in your app.js or server.js file
module.exports = router;
