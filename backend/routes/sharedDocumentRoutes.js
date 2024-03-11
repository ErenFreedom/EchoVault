const express = require('express');
const router = express.Router();
const sharedDocumentController = require('../controllers/SharedDocumentController');
const authMiddleware = require('../middleware/authMiddleware');
const { ensureIsPremiumUser } = require('../middleware/userTypeMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const corsMiddleware = require('../middleware/corsMiddleware');
const sessionManagementMiddleware = require('../middleware/sessionManagementMiddleware');
const loggerMiddleware = require('../middleware/loggerMiddleware');
const { validateShareDocument } = require('../middleware/validationMiddleware'); // Assuming you have validations for sharing documents

// Apply CORS policies for shared document routes
router.use(corsMiddleware);

// POST route for sharing a document, only accessible by premium users and can only share with other premium users
router.post('/share', authMiddleware, ensureIsPremiumUser, validateShareDocument, sessionManagementMiddleware, sharedDocumentController.shareDocument);

// Apply rate limiting to the share document operation to protect against abuse
router.use(rateLimitMiddleware.generalRateLimit);

// Log all actions related to sharing documents for monitoring
router.use(loggerMiddleware);

// Export the router to be mounted in your main server file
module.exports = router;
