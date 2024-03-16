const express = require('express');
const router = express.Router();
const documentController = require('../controllers/DocumentController');
const authMiddleware = require('../middleware/authMiddleware'); // Adjust the path as needed

// Route to upload a document to a locker
router.post('/upload', authMiddleware, documentController.uploadDocument);

// Route to delete a specific document
router.delete('/delete/:documentId', authMiddleware, documentController.deleteDocument);

// Route to download a specific document
router.get('/download/:documentId', authMiddleware, documentController.downloadDocument);

module.exports = router;
