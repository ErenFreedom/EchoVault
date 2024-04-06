const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/DocumentController');
const Document = require('../models/Document'); // Adjust the path as necessary

const path = require('path');
// Set up storage engine for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function(req, file, cb) {
    // Naming convention to avoid conflicts
    cb(null, `${file.fieldname}-${Date.now()}.${file.originalname.split('.').pop()}`)
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Route to upload a document to a specific locker
router.post('/locker/:lockerId/upload', upload.single('document'), documentController.uploadDocument);

// Route to get all documents for a specific locker
router.get('/locker/:lockerId/documents', documentController.getDocumentsForLocker);



router.get('/documents/:documentId/preview', async (req, res) => {
  const { documentId } = req.params;
  try {
    // Assuming Document model is already imported in documentRoutes.js
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).send('Document not found');
    }
    const filePath = path.join(__dirname, '..', 'uploads', document.filePath);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).send('Error serving document');
  }
});

// Route to delete a specific document
router.delete('/document/:documentId', documentController.deleteDocument);

// Route to download a specific document
router.get('/document/:documentId/download', documentController.downloadDocument);

module.exports = router;
