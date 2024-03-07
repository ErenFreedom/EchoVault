const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/auth'); // Assume you have an authentication middleware to verify tokens

// Route to handle document upload
router.post('/upload', authMiddleware, documentController.uploadDocument);

// Route to handle document deletion
router.delete('/delete/:documentId', authMiddleware, documentController.deleteDocument);

// Route to handle document download
router.get('/download/:documentId', authMiddleware, documentController.downloadDocument);

module.exports = router;
