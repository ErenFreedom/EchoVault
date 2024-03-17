const express = require('express');
const multer = require('multer');
const router = express.Router();
const documentController = require('../controllers/DocumentController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure the path is correct

// Set up storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/') // Ensure this path exists or is configured according to your needs
  },
  filename: function(req, file, cb) {
    // Naming convention for the uploaded files
    // You might want to include timestamps or user identifiers for uniqueness
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop())
  }
});

const upload = multer({ storage: storage });

// Route to upload a document to a locker
router.post('/upload', authMiddleware, upload.single('document'), documentController.uploadDocument);

// Route to delete a specific document
router.delete('/delete/:documentId', authMiddleware, documentController.deleteDocument);

// Route to download a specific document
router.get('/download/:documentId', authMiddleware, documentController.downloadDocument);

module.exports = router;
