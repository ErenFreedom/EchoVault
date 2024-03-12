const express = require('express');
const router = express.Router();
const {
    notifyDocumentUpload,
    notifyDocumentDeletion,
    notifyDocumentDownload,
    notifyPremiumPurchase,
    notifyDocumentSharing,
    notifyGuestUserLinking,
    notifyPermissionGranted
} = require('../controllers/notificationController');

const authMiddleware = require('../middleware/authMiddleware');
const { ensureIsPremiumUser } = require('../middleware/userTypeMiddleware');
const permissionsMiddleware = require('../middleware/permissionsMiddleware').checkPermissions; // Assuming this middleware can check specific permissions
const errorHandler = require('../middleware/errorMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware').generalRateLimit; // Or use a specific rate limit for notifications if needed

// Apply middlewares globally to all routes if applicable
router.use(authMiddleware, rateLimitMiddleware, errorHandler);

// Routes for notifying about document actions, accessible by authenticated users with specific permissions
router.post('/notifyUpload/:documentId', permissionsMiddleware('upload'), notifyDocumentUpload);
router.post('/notifyDeletion/:documentId', permissionsMiddleware('delete'), notifyDocumentDeletion);
router.post('/notifyDownload/:documentId', permissionsMiddleware('download'), notifyDocumentDownload);

// Route for notifying about premium purchase, accessible only by premium users
router.post('/notifyPremiumPurchase', ensureIsPremiumUser, notifyPremiumPurchase);

// Route for notifying about document sharing, accessible only by premium users and to premium users
router.post('/notifySharing/:documentId/:shareWithUserId', ensureIsPremiumUser, notifyDocumentSharing);

// Route for notifying about linking a guest user, accessible only by premium users
router.post('/notifyGuestLinking/:guestUserId', ensureIsPremiumUser, notifyGuestUserLinking);

// Route for notifying about granting permissions to a guest user, accessible only by premium users
router.post('/notifyPermissionGranted/:guestUserId/:permission', ensureIsPremiumUser, notifyPermissionGranted);

// Export the router to be mounted in your main server file
module.exports = router;
