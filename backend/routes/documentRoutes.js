const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware'); // Updated path for consistency
const fileUploadMiddleware = require('../middleware/fileUploadMiddleware').upload; // Destructure the upload middleware if it's exported with other middlewares
const permissionsMiddleware = require('../middleware/permissionsMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const corsMiddleware = require('../middleware/corsMiddleware');
const sessionManagementMiddleware = require('../middleware/sessionManagementMiddleware');
const { validateDocumentUpload } = require('../middleware/validationMiddleware'); // Assuming you have specific validation for document upload
const loggerMiddleware = require('../middleware/loggerMiddleware');

// Apply CORS policies for document routes
router.use(corsMiddleware);

// Route to handle document upload with file upload and permission check
router.post('/upload', authMiddleware, fileUploadMiddleware, permissionsMiddleware.checkUploadPermission, validateDocumentUpload, sessionManagementMiddleware, documentController.uploadDocument);

// Route to handle document deletion with permission check
router.delete('/delete/:documentId', authMiddleware, permissionsMiddleware.checkDeletePermission, sessionManagementMiddleware, rateLimitMiddleware.generalRateLimit, documentController.deleteDocument);

// Route to handle document download with permission check
router.get('/download/:documentId', authMiddleware, permissionsMiddleware.checkDownloadPermission, sessionManagementMiddleware, documentController.downloadDocument);

// Log all document-related actions
router.use(loggerMiddleware);

module.exports = router;
