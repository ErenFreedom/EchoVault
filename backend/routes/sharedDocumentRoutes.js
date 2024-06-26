const express = require('express');
const router = express.Router();
const sharedDocumentController = require('../controllers/SharedDocumentController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

router.post('/share', /* authMiddleware, */ sharedDocumentController.shareDocument);

module.exports = router;
