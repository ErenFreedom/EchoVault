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

// Assuming you have middleware to authenticate and extract the user's ID from the JWT token
const { isAuthenticated } = require('../middleware/authMiddleware');

// Routes for notifying about document actions
router.post('/notifyUpload/:documentId', isAuthenticated, (req, res) => notifyDocumentUpload(req.user._id, req.params.documentId).then(res.json.bind(res)));
router.post('/notifyDeletion/:documentId', isAuthenticated, (req, res) => notifyDocumentDeletion(req.user._id, req.params.documentId).then(res.json.bind(res)));
router.post('/notifyDownload/:documentId', isAuthenticated, (req, res) => notifyDocumentDownload(req.user._id, req.params.documentId).then(res.json.bind(res)));

// Route for notifying about premium purchase
router.post('/notifyPremiumPurchase', isAuthenticated, (req, res) => notifyPremiumPurchase(req.user._id).then(res.json.bind(res)));

// Route for notifying about document sharing
router.post('/notifySharing/:documentId/:shareWithUserId', isAuthenticated, (req, res) => notifyDocumentSharing(req.user._id, req.params.shareWithUserId, req.params.documentId).then(res.json.bind(res)));

// Route for notifying about linking a guest user
router.post('/notifyGuestLinking/:guestUserId', isAuthenticated, (req, res) => notifyGuestUserLinking(req.user._id, req.params.guestUserId).then(res.json.bind(res)));

// Route for notifying about granting permissions to a guest user
router.post('/notifyPermissionGranted/:guestUserId/:permission', isAuthenticated, (req, res) => notifyPermissionGranted(req.user._id, req.params.guestUserId, req.params.permission).then(res.json.bind(res)));

module.exports = router;
