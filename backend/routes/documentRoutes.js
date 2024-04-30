const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/DocumentController');
const Document = require('../models/Document'); 
const User = require('../models/UserModel'); 
const bcrypt = require('bcryptjs');
const fs = require('fs'); 
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware'); 
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/') 
  },
  filename: function(req, file, cb) {
    
    cb(null, `${file.fieldname}-${Date.now()}.${file.originalname.split('.').pop()}`)
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post('/locker/:lockerId/upload', upload.single('document'), documentController.uploadDocument);

router.get('/locker/:lockerId/documents', documentController.getDocumentsForLocker);



router.get('/documents/:documentId/preview', async (req, res) => {
  const { documentId } = req.params;
  try {
    
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).send('Document not found');
    }
    const filePath = path.join(__dirname, '..', document.filePath);

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).send('Error serving document');
  }
});

router.delete('/document/:documentId', documentController.deleteDocument);


router.get('/documents/download/:documentId', authMiddleware, documentController.downloadDocument);

//router.post('/documents/share', authMiddleware, documentController.shareDocument);



module.exports = router;
